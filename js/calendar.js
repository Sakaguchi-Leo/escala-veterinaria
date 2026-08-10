window.ScheduleCalendar = (() => {
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const key = (y,m,d) => `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const utc = (y,m,d) => Date.UTC(y,m-1,d);

  function baseRole(y,m,d) {
    const difference = Math.round((utc(y,m,d) - utc(2026,8,1)) / 86400000);
    return Math.abs(difference % 2) === 0 ? "r1" : "r2";
  }

  function roleFor(state,y,m,d) {
    return state.slots[key(y,m,d)] || baseRole(y,m,d);
  }

  function changed(state,y,m,d) {
    return roleFor(state,y,m,d) !== baseRole(y,m,d);
  }

  function card(state,y,m,d,mini=false) {
    const role = roleFor(state,y,m,d);
    const weekday = weekdays[new Date(y,m-1,d).getDay()];
    return `<div class="day ${mini ? "mini" : ""}" data-key="${key(y,m,d)}">
      ${changed(state,y,m,d) ? '<i class="changed"></i>' : ""}
      <span class="date">${d}<small>${weekday}</small></span>
      <div class="person ${role === "r1" ? "role1" : "role2"}">${state.names[role]}</div>
    </div>`;
  }

  function render(state, year, month) {
    const calendar = document.getElementById("calendar");
    document.getElementById("title").textContent = `${months[month-1]} de ${year}`;
    document.getElementById("legend1").textContent = state.names.r1;
    document.getElementById("legend2").textContent = state.names.r2;

    const days = new Date(year,month,0).getDate();
    const start = new Date(year,month-1,1).getDay();
    calendar.innerHTML = weekdays.map(w => `<div class="weekday">${w}</div>`).join("") + '<div class="blank"></div>'.repeat(start);

    let count1 = 0;
    let count2 = 0;
    for (let day=1; day<=days; day++) {
      roleFor(state,year,month,day) === "r1" ? count1++ : count2++;
      calendar.insertAdjacentHTML("beforeend", card(state,year,month,day));
    }

    document.getElementById("counts").innerHTML = `
      <div class="count role1"><strong>${count1}</strong>${state.names.r1}</div>
      <div class="count role2"><strong>${count2}</strong>${state.names.r2}</div>`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    document.getElementById("nextTitle").textContent = `Primeiros 7 dias de ${months[nextMonth-1]}/${nextYear}`;
    document.getElementById("next").innerHTML = Array.from({length:7},(_,i) => card(state,nextYear,nextMonth,i+1,true)).join("");
  }

  return { months, weekdays, key, baseRole, roleFor, render };
})();
