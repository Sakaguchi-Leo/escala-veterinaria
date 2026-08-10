window.ScheduleDrag = (() => {
  let drag = null;
  let ghost = null;

  function targetAt(x,y) {
    const element = document.elementFromPoint(x,y);
    const card = element && element.closest(".day");
    return card && card.dataset.key !== drag?.key ? card : null;
  }

  function clearTargets() {
    document.querySelectorAll(".target").forEach(el => el.classList.remove("target"));
  }

  function start(card,event) {
    const person = card.querySelector(".person");
    drag = { element: card, key: card.dataset.key };
    card.classList.add("dragging");
    ghost = document.createElement("div");
    ghost.className = `ghost ${person.classList.contains("role1") ? "role1" : "role2"}`;
    ghost.innerHTML = `<b>${card.querySelector(".date").childNodes[0].textContent.trim()}</b><br>${person.textContent}`;
    document.body.appendChild(ghost);
    move(event.clientX,event.clientY);
    card.setPointerCapture?.(event.pointerId);
  }

  function move(x,y) {
    if (!drag) return;
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    clearTargets();
    targetAt(x,y)?.classList.add("target");
  }

  function cancel() {
    if (!drag) return;
    drag.element.classList.remove("dragging");
    clearTargets();
    ghost?.remove();
    ghost = null;
    drag = null;
  }

  function bind(onDrop) {
    document.addEventListener("pointerdown", event => {
      const card = event.target.closest(".day");
      if (!card?.dataset.key) return;
      event.preventDefault();
      start(card,event);
    });
    document.addEventListener("pointermove", event => {
      if (!drag) return;
      event.preventDefault();
      move(event.clientX,event.clientY);
    }, { passive: false });
    document.addEventListener("pointerup", event => {
      if (!drag) return;
      event.preventDefault();
      const target = targetAt(event.clientX,event.clientY);
      const sourceKey = drag.key;
      cancel();
      if (target) onDrop(sourceKey,target.dataset.key);
    });
    document.addEventListener("pointercancel", cancel);
  }

  return { bind };
})();
