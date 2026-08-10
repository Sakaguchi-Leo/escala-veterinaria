(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const month = $("month");
  const year = $("year");
  const history = [];
  let state = { slots: {}, names: { r1: "Rebeca", r2: "Samantha" } };

  ScheduleCalendar.months.forEach((name,index) => month.add(new Option(name,index+1)));
  for (let value=2026; value<=2030; value++) year.add(new Option(value,value));
  month.value = 8;
  year.value = 2026;

  function parseKey(value) {
    return value.split("-").map(Number);
  }

  function render() {
    $("name1").value = state.names.r1;
    $("name2").value = state.names.r2;
    ScheduleCalendar.render(state,Number(year.value),Number(month.value));
  }

  async function persist(message) {
    await ScheduleStorage.save(state);
    $("status").textContent = message;
    render();
  }

  function showStorageMode() {
    const box = $("syncStatus");
    box.classList.add("visible");
    box.textContent = ScheduleStorage.mode() === "local"
      ? "Modo local: as alterações ficam somente neste aparelho. A integração compartilhada será ativada ao configurar o Supabase."
      : "Modo compartilhado: as alterações são sincronizadas entre os aparelhos.";
  }

  ScheduleDrag.bind(async (sourceKey,targetKey) => {
    history.push(JSON.parse(JSON.stringify(state.slots)));
    const [sy,sm,sd] = parseKey(sourceKey);
    const [ty,tm,td] = parseKey(targetKey);
    const sourceRole = ScheduleCalendar.roleFor(state,sy,sm,sd);
    const targetRole = ScheduleCalendar.roleFor(state,ty,tm,td);
    state.slots[sourceKey] = targetRole;
    state.slots[targetKey] = sourceRole;
    if (state.slots[sourceKey] === ScheduleCalendar.baseRole(sy,sm,sd)) delete state.slots[sourceKey];
    if (state.slots[targetKey] === ScheduleCalendar.baseRole(ty,tm,td)) delete state.slots[targetKey];
    await persist(`Plantões de ${sd}/${sm} e ${td}/${tm} trocados.`);
  });

  $("saveNames").addEventListener("click", async () => {
    const first = $("name1").value.trim();
    const second = $("name2").value.trim();
    if (!first || !second || first.toLocaleLowerCase("pt-BR") === second.toLocaleLowerCase("pt-BR")) {
      $("status").textContent = "Informe dois nomes diferentes.";
      return;
    }
    state.names = { r1: first, r2: second };
    await persist("Nomes atualizados.");
  });

  $("undo").addEventListener("click", async () => {
    if (!history.length) {
      $("status").textContent = "Não há troca para desfazer nesta sessão.";
      return;
    }
    state.slots = history.pop();
    await persist("Última troca desfeita.");
  });

  $("reset").addEventListener("click", async () => {
    if (Object.keys(state.slots).length) history.push(JSON.parse(JSON.stringify(state.slots)));
    state.slots = {};
    await persist("Escala original restaurada.");
  });

  month.addEventListener("change", render);
  year.addEventListener("change", render);

  (async () => {
    try {
      state = await ScheduleStorage.load();
      showStorageMode();
      render();
      ScheduleStorage.subscribe(remoteState => {
        state = remoteState;
        render();
        $("status").textContent = "Escala sincronizada com outra alteração.";
      });
    } catch (error) {
      console.error(error);
      $("syncStatus").classList.add("visible");
      $("syncStatus").textContent = "Não foi possível conectar ao banco. Execute o arquivo supabase-setup.sql no Supabase e tente novamente.";
      render();
    }
  })();
})();
