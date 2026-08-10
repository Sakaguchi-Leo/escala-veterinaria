window.ScheduleStorage = (() => {
  const SLOT_KEY = "vet_schedule_slots_v1";
  const NAME_KEY = "vet_schedule_names_v1";
  const defaults = { slots: {}, names: { r1: "Rebeca", r2: "Samantha" } };
  let client = null;
  let channel = null;

  function configured() {
    const c = window.APP_CONFIG || {};
    return Boolean(c.supabaseUrl && c.supabasePublishableKey && window.supabase?.createClient);
  }

  function getClient() {
    if (!configured()) return null;
    if (!client) client = window.supabase.createClient(
      window.APP_CONFIG.supabaseUrl,
      window.APP_CONFIG.supabasePublishableKey
    );
    return client;
  }

  function loadLocal() {
    let slots = {};
    let names = { ...defaults.names };
    try { slots = JSON.parse(localStorage.getItem(SLOT_KEY) || "{}"); } catch (_) {}
    try { names = { ...names, ...JSON.parse(localStorage.getItem(NAME_KEY) || "{}") }; } catch (_) {}
    return { slots, names };
  }

  function saveLocal(state) {
    localStorage.setItem(SLOT_KEY, JSON.stringify(state.slots));
    localStorage.setItem(NAME_KEY, JSON.stringify(state.names));
  }

  async function load() {
    const local = loadLocal();
    const db = getClient();
    if (!db) return local;

    const id = window.APP_CONFIG.sharedScheduleId;
    const { data, error } = await db.from("shared_schedules").select("slots,names").eq("id", id).maybeSingle();
    if (error) throw error;

    if (!data) {
      const { error: createError } = await db.from("shared_schedules").insert({ id, slots: local.slots, names: local.names });
      if (createError) throw createError;
      return local;
    }

    const state = {
      slots: data.slots || {},
      names: { ...defaults.names, ...(data.names || {}) }
    };
    saveLocal(state);
    return state;
  }

  async function save(state) {
    saveLocal(state);
    const db = getClient();
    if (!db) return { mode: "local" };

    const { error } = await db.from("shared_schedules").upsert({
      id: window.APP_CONFIG.sharedScheduleId,
      slots: state.slots,
      names: state.names,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });
    if (error) throw error;
    return { mode: "shared" };
  }

  function subscribe(onChange) {
    const db = getClient();
    if (!db || channel) return;
    channel = db.channel("shared-schedule-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "shared_schedules",
        filter: `id=eq.${window.APP_CONFIG.sharedScheduleId}`
      }, payload => {
        const row = payload.new;
        if (!row?.slots || !row?.names) return;
        const state = { slots: row.slots, names: { ...defaults.names, ...row.names } };
        saveLocal(state);
        onChange(state);
      })
      .subscribe();
  }

  function mode() { return configured() ? "shared" : "local"; }
  return { load, save, subscribe, mode };
})();
