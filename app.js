const STORAGE_KEY = "kontur-review-demo-v1";

const seedState = {
  currentUserId: "manager-a",
  currentView: "dashboard",
  users: [
    { id: "manager-a", name: "Анна Орлова", role: "manager", isAdmin: true, position: "Руководитель направления", teamId: "team-a", status: "active", email: "a.orlova@example.local", lastActive: "Сегодня, 10:14" },
    { id: "employee-a1", name: "Сергей Лавров", role: "employee", position: "Бизнес-аналитик", teamId: "team-a", managerId: "manager-a", status: "active", email: "s.lavrov@example.local", lastActive: "Вчера, 18:20" },
    { id: "employee-a2", name: "Елена Миронова", role: "employee", position: "Руководитель проектов", teamId: "team-a", managerId: "manager-a", status: "active", email: "e.mironova@example.local", lastActive: "Сегодня, 08:55" },
    { id: "employee-a3", name: "Павел Соколов", role: "employee", position: "Системный аналитик", teamId: "team-a", managerId: "manager-a", status: "invited", email: "p.sokolov@example.local", lastActive: "Приглашение отправлено" },
    { id: "manager-b", name: "Михаил Беляев", role: "manager", isAdmin: false, position: "Руководитель проектного офиса", teamId: "team-b", status: "active", email: "m.belyaev@example.local", lastActive: "Сегодня, 09:06" },
    { id: "employee-b1", name: "Дарья Котова", role: "employee", position: "Проектный менеджер", teamId: "team-b", managerId: "manager-b", status: "active", email: "d.kotova@example.local", lastActive: "21 сентября, 17:40" },
    { id: "employee-b2", name: "Илья Емельянов", role: "employee", position: "Бизнес-аналитик", teamId: "team-b", managerId: "manager-b", status: "blocked", email: "i.emelyanov@example.local", lastActive: "15 сентября, 12:11" }
  ],
  teams: [
    { id: "team-a", name: "Команда цифровых сервисов", managerId: "manager-a" },
    { id: "team-b", name: "Проектный офис", managerId: "manager-b" }
  ],
  reviews: [
    {
      id: "review-a1", employeeId: "employee-a1", managerId: "manager-a", period: "1 полугодие 2026", reviewDate: "2026-07-28", status: "manager_review",
      strengths: "Системно собирает требования и заранее подсвечивает зависимости.", development: "Больше фиксировать принятые решения и основания для них.", privateNotes: "Обсудить готовность вести небольшое направление самостоятельно.", employeeSummary: "Главный результат — самостоятельная подготовка требований к двум интеграциям.",
      goals: [
        { title: "Подготовить требования к ключевым интеграциям", criteria: "Требования согласованы, риски и зависимости зафиксированы", result: "partial", employeeComment: "Две интеграции согласованы, третья перенесена из-за внешней зависимости." },
        { title: "Актуализировать проектную документацию", criteria: "Все выпущенные изменения описаны в базе знаний", result: "done", employeeComment: "Документация обновлялась после каждого релиза." }
      ],
      nextGoals: "Взять в самостоятельное ведение один функциональный блок.\nРазработать шаблон фиксации интеграционных решений."
    },
    {
      id: "review-a2", employeeId: "employee-a2", managerId: "manager-a", period: "1 полугодие 2026", reviewDate: "2026-07-30", status: "meeting",
      strengths: "Удерживает сроки и собирает участников вокруг решения.", development: "Усилить работу с финансовыми рисками на этапе планирования.", privateNotes: "Подготовить примеры ситуаций для обсуждения на встрече.", employeeSummary: "Стабилизировала планирование релизов и коммуникацию с заказчиком.",
      goals: [
        { title: "Внедрить единый план релизов", criteria: "План обновляется каждый спринт, изменения согласованы с командой", result: "done", employeeComment: "План ведётся с марта, отклонения обсуждаются еженедельно." },
        { title: "Улучшить контроль бюджета", criteria: "Ежемесячный прогноз без неучтённых обязательств", result: "partial", employeeComment: "Прогноз внедрён, требуется автоматизировать сбор факта." }
      ],
      nextGoals: "Настроить ежемесячную сверку бюджета и обязательств."
    },
    {
      id: "review-a3", employeeId: "employee-a3", managerId: "manager-a", period: "1 полугодие 2026", reviewDate: "2026-08-04", status: "self_assessment",
      strengths: "", development: "", privateNotes: "Сотрудник недавно в команде — сфокусироваться на адаптации.", employeeSummary: "",
      goals: [{ title: "Завершить адаптацию в проекте", criteria: "Самостоятельно вести задачи по одному модулю", result: "not_set", employeeComment: "" }], nextGoals: ""
    },
    {
      id: "review-b1", employeeId: "employee-b1", managerId: "manager-b", period: "1 полугодие 2026", reviewDate: "2026-07-25", status: "complete",
      strengths: "", development: "", privateNotes: "", employeeSummary: "", goals: [], nextGoals: ""
    }
  ]
};

const statusMeta = {
  draft: ["Черновик", "draft"],
  self_assessment: ["Самооценка", "self"],
  manager_review: ["Оценка руководителя", "manager"],
  meeting: ["Встреча", "meeting"],
  approval: ["Согласование", "approval"],
  complete: ["Завершено", "complete"]
};
const roleNames = { manager: "Руководитель", employee: "Сотрудник" };
const resultNames = { done: "Выполнено", partial: "Частично", missed: "Не выполнено", not_set: "Без оценки" };

let state = loadState();
let selectedReviewId = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.users || !saved.teams || !saved.reviews) return structuredClone(seedState);
    const hadStandaloneAdmin = saved.users.some(item => item.role === "admin");
    saved.users = saved.users
      .filter(item => item.role !== "admin")
      .map(item => ({ ...item, isAdmin: item.isAdmin ?? false }));
    if (hadStandaloneAdmin && !saved.users.some(item => item.isAdmin)) {
      const defaultAdmin = saved.users.find(item => item.id === "manager-a") || saved.users.find(item => item.role === "manager");
      if (defaultAdmin) defaultAdmin.isAdmin = true;
    }
    if (!saved.users.some(item => item.id === saved.currentUserId)) saved.currentUserId = "manager-a";
    if (saved.currentView === "admin") saved.currentView = "settings";
    return saved;
  } catch { return structuredClone(seedState); }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function user(id) { return state.users.find(item => item.id === id); }
function currentUser() { return user(state.currentUserId); }
function team(id) { return state.teams.find(item => item.id === id); }
function initials(name) { return name.split(/\s+/).map(part => part[0]).slice(0, 2).join(""); }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function formatDate(value) { return value ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Не назначена"; }
function statusBadge(status) { const meta = statusMeta[status] || statusMeta.draft; return `<span class="badge ${meta[1]}">${meta[0]}</span>`; }
function showToast(message) { const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }

function allowedNav() {
  const person = currentUser();
  const nav = person.role === "manager"
    ? [{ id: "dashboard", label: "Обзор", icon: "О" }, { id: "reviews", label: "Ревью", icon: "Р" }, { id: "team", label: "Команда", icon: "К" }]
    : [{ id: "dashboard", label: "Моё ревью", icon: "Р" }, { id: "history", label: "История", icon: "И" }];
  if (person.isAdmin) nav.push({ id: "settings", label: "Настройки", icon: "Н" });
  return nav;
}

function renderShell() {
  const person = currentUser();
  const nav = allowedNav();
  if (!nav.some(item => item.id === state.currentView) && state.currentView !== "review") state.currentView = nav[0].id;
  document.querySelector("#main-nav").innerHTML = nav.map(item => `<button class="nav-button ${state.currentView === item.id ? "active" : ""}" data-nav="${item.id}"><span class="nav-icon">${item.icon}</span>${item.label}</button>`).join("");
  document.querySelector("#identity-select").innerHTML = state.users.map(item => `<option value="${item.id}" ${item.id === person.id ? "selected" : ""}>${escapeHtml(item.name)} — ${roleNames[item.role]}${item.isAdmin ? " + администратор" : ""}</option>`).join("");
  document.querySelector("#page-eyebrow").textContent = `${roleNames[person.role]}${person.isAdmin ? " + администратор" : ""} · ${person.position}`;
  document.querySelector("#page-title").textContent = pageTitle();
  renderView();
}

function pageTitle() {
  if (state.currentView === "review") return "Карточка ревью";
  return { dashboard: currentUser().role === "employee" ? "Моё ревью" : "Обзор команды", reviews: "Ревью сотрудников", team: "Команда", history: "История ревью", settings: "Настройки" }[state.currentView] || "Контур";
}

function renderView() {
  const app = document.querySelector("#app");
  if (state.currentView === "review") return renderReview(app);
  if (state.currentView === "settings") return currentUser().isAdmin ? renderSettings(app) : renderShell();
  if (state.currentView === "reviews") return renderReviews(app);
  if (state.currentView === "team") return renderTeam(app);
  if (state.currentView === "history") return renderHistory(app);
  return currentUser().role === "manager" ? renderManagerDashboard(app) : renderEmployeeDashboard(app);
}

function managerEmployees(managerId = currentUser().id) { return state.users.filter(item => item.role === "employee" && item.managerId === managerId); }
function accessibleReviews() {
  const person = currentUser();
  if (person.role === "manager") return state.reviews.filter(item => item.managerId === person.id);
  if (person.role === "employee") return state.reviews.filter(item => item.employeeId === person.id);
  return [];
}

function renderManagerDashboard(app) {
  const employees = managerEmployees();
  const reviews = accessibleReviews();
  const active = reviews.filter(item => item.status !== "complete");
  const waiting = reviews.filter(item => item.status === "self_assessment").length;
  app.innerHTML = `
    <div class="stack">
      <div class="stats">
        <div class="stat"><span>Сотрудников в команде</span><strong>${employees.length}</strong></div>
        <div class="stat"><span>Активных ревью</span><strong>${active.length}</strong></div>
        <div class="stat"><span>Ожидают самооценку</span><strong>${waiting}</strong></div>
      </div>
      <div class="content-grid">
        <section class="panel">
          <div class="panel-head"><div><h2>Текущий цикл</h2><p>Ревью вашей команды на этот период</p></div><button class="button primary" data-create-review>Новое ревью</button></div>
          ${reviewTable(reviews, true)}
        </section>
        <div class="stack">
          <section class="panel"><div class="panel-head"><div><h2>Готовность цикла</h2><p>По этапам процесса</p></div></div><div class="panel-body">${progressSummary(reviews)}</div></section>
          <section class="panel"><div class="panel-head"><div><h2>Ближайшие действия</h2></div></div><div class="panel-body timeline">${nextActions(reviews, employees)}</div></section>
        </div>
      </div>
    </div>`;
}

function nextActions(reviews, employees) {
  const actions = [];
  const selfAssessment = reviews.find(review => review.status === "self_assessment");
  const meeting = reviews.find(review => review.status === "meeting");
  const approval = reviews.find(review => review.status === "approval");
  const withoutActiveReview = employees.find(employee => !reviews.some(review => review.employeeId === employee.id && review.status !== "complete"));
  if (selfAssessment) actions.push(["Проверить самооценку", `${user(selfAssessment.employeeId).name} заполняет результаты по целям.`]);
  if (meeting) actions.push(["Провести встречу", `Ревью сотрудника ${user(meeting.employeeId).name} назначено на ${formatDate(meeting.reviewDate)}.`]);
  if (approval) actions.push(["Завершить согласование", `${user(approval.employeeId).name} ожидает подтверждения итогов.`]);
  if (withoutActiveReview) actions.push(["Начать новый цикл", `Создайте ревью для сотрудника ${withoutActiveReview.name}.`]);
  if (!actions.length) actions.push(["Проверить текущий цикл", "Новых действий по ревью сейчас нет."]);
  return actions.slice(0, 3).map(([title, text]) => `<div class="timeline-item"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div>`).join("");
}

function progressSummary(reviews) {
  const total = Math.max(reviews.length, 1);
  const groups = [
    ["Самооценка сотрудника", reviews.filter(r => ["manager_review", "meeting", "approval", "complete"].includes(r.status)).length],
    ["Оценка руководителя", reviews.filter(r => ["meeting", "approval", "complete"].includes(r.status)).length],
    ["Итоги согласованы", reviews.filter(r => ["complete"].includes(r.status)).length]
  ];
  return `<div class="progress-list">${groups.map(([label, count]) => `<div class="progress-item"><div class="progress-label"><span>${label}</span><strong>${count} из ${reviews.length}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${count / total * 100}%"></div></div></div>`).join("")}</div>`;
}

function reviewTable(reviews, includeAction = false) {
  if (!reviews.length) return `<div class="empty">Ревью пока нет.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Сотрудник</th><th>Период</th><th>Встреча</th><th>Статус</th>${includeAction ? "<th></th>" : ""}</tr></thead><tbody>${reviews.map(review => {
    const employee = user(review.employeeId);
    return `<tr data-action="open-review" data-review-id="${review.id}"><td><div class="person"><span class="avatar">${initials(employee.name)}</span><div><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.position)}</small></div></div></td><td>${escapeHtml(review.period)}</td><td>${formatDate(review.reviewDate)}</td><td>${statusBadge(review.status)}</td>${includeAction ? '<td><button class="text-button">Открыть</button></td>' : ""}</tr>`;
  }).join("")}</tbody></table></div>`;
}

function renderReviews(app) {
  app.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Все ревью команды</h2><p>Текущие и завершённые периоды</p></div><button class="button primary" data-create-review>Новое ревью</button></div>${reviewTable(accessibleReviews(), true)}</section>`;
}

function renderTeam(app) {
  const employees = managerEmployees();
  app.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>${escapeHtml(team(currentUser().teamId)?.name || "Моя команда")}</h2><p>У каждого сотрудника один руководитель</p></div></div><div class="table-wrap"><table><thead><tr><th>Сотрудник</th><th>Роль</th><th>Текущее ревью</th><th>Активность</th></tr></thead><tbody>${employees.map(employee => {
    const review = state.reviews.find(item => item.employeeId === employee.id && item.status !== "complete");
    return `<tr><td><div class="person"><span class="avatar">${initials(employee.name)}</span><div><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.email)}</small></div></div></td><td>${escapeHtml(employee.position)}</td><td>${review ? statusBadge(review.status) : '<span class="muted">Не начато</span>'}</td><td class="muted">${escapeHtml(employee.lastActive)}</td></tr>`;
  }).join("")}</tbody></table></div></section>`;
}

function renderEmployeeDashboard(app) {
  const reviews = accessibleReviews();
  const review = reviews.find(item => item.status !== "complete") || reviews[0];
  if (!review) { app.innerHTML = `<div class="panel empty">Для вас пока нет активного ревью.</div>`; return; }
  const completed = review.goals.filter(goal => goal.result === "done").length;
  app.innerHTML = `<div class="stack">
    <div class="review-hero"><div><span class="badge ${statusMeta[review.status][1]}">${statusMeta[review.status][0]}</span><h2 style="margin-top:12px">${escapeHtml(review.period)}</h2><p>Встреча с руководителем: ${formatDate(review.reviewDate)}</p><div class="review-meta"><span>${review.goals.length} цели</span><span>${completed} выполнено</span></div></div><button class="button primary" data-open-review="${review.id}">Открыть ревью</button></div>
    <div class="content-grid"><section class="panel"><div class="panel-head"><div><h2>Цели периода</h2><p>Добавьте фактические результаты и самооценку</p></div></div><div class="panel-body stack">${review.goals.map(goal => `<div class="goal-card"><h3>${escapeHtml(goal.title)}</h3><p class="muted">${escapeHtml(goal.criteria)}</p><div>${statusBadge(goal.result === "done" ? "complete" : goal.result === "partial" ? "manager_review" : "draft")}</div></div>`).join("")}</div></section>
    <section class="panel"><div class="panel-head"><div><h2>Как проходит ревью</h2></div></div><div class="panel-body timeline"><div class="timeline-item"><strong>Заполните самооценку</strong><p>Опишите результаты и сложности по каждой цели.</p></div><div class="timeline-item"><strong>Обсудите с руководителем</strong><p>Сверьте оценки и договоритесь о развитии.</p></div><div class="timeline-item"><strong>Подтвердите итоги</strong><p>Завершённое ревью останется в истории.</p></div></div></section></div>
  </div>`;
}

function renderHistory(app) {
  app.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>История ревью</h2><p>Доступны только ваши периоды</p></div></div>${reviewTable(accessibleReviews(), true)}</section>`;
}

function renderSettings(app) {
  app.innerHTML = `
    <div class="admin-banner"><div><p class="eyebrow" style="color:var(--acid)">Дополнительные права</p><h2>Пользователи и структура команд</h2><p>Настройки доступны пользователям с дополнительным правом администратора. Основная роль такого пользователя сохраняется: руководитель продолжает работать со своей командой, сотрудник — со своим ревью.</p></div><div class="future-card"><strong>Следующая версия</strong><p>Здесь появится управление дополнительными правами и составом команд с журналом изменений.</p></div></div>
    <div class="content-grid">
      <section class="panel"><div class="panel-head"><div><h2>Пользователи</h2><p>${state.users.length} учётных записей</p></div><input id="user-search" class="filter-input" placeholder="Поиск по имени или роли" aria-label="Поиск пользователей" /></div><div id="users-table">${usersTable(state.users)}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>Команды</h2><p>Фиксированная иерархия</p></div></div><div class="panel-body team-map">${state.teams.map(teamItem => teamCard(teamItem)).join("")}</div></section>
    </div>`;
}

function usersTable(users) {
  return `<div class="table-wrap"><table><thead><tr><th>Пользователь</th><th>Роль и права</th><th>Команда</th><th>Статус</th></tr></thead><tbody>${users.map(item => {
    const teamName = team(item.teamId)?.name || "Не назначена";
    const statusLabel = { active: "Активен", invited: "Приглашён", blocked: "Заблокирован" }[item.status] || item.status;
    return `<tr><td><div class="person"><span class="avatar">${initials(item.name)}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.email)}</small></div></div></td><td><div class="toolbar"><span class="badge">${roleNames[item.role]}</span>${item.isAdmin ? '<span class="badge admin-cap">Администратор</span>' : ""}</div></td><td>${escapeHtml(teamName)}</td><td>${escapeHtml(statusLabel)}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function teamCard(teamItem) {
  const manager = user(teamItem.managerId);
  const employees = state.users.filter(item => item.role === "employee" && item.teamId === teamItem.id);
  return `<div class="team-card"><div class="team-card-head"><div><h3>${escapeHtml(teamItem.name)}</h3><p class="muted" style="margin:5px 0 0;font-size:12px">Руководитель: ${escapeHtml(manager.name)}</p></div><span class="badge">${employees.length} сотрудника</span></div><div class="team-members">${employees.map(item => `<span class="member-chip">${escapeHtml(item.name)}</span>`).join("")}</div></div>`;
}

function renderReview(app) {
  const review = state.reviews.find(item => item.id === selectedReviewId);
  if (!review || !accessibleReviews().some(item => item.id === review.id)) { state.currentView = allowedNav()[0].id; renderShell(); return; }
  const employee = user(review.employeeId);
  const isManager = currentUser().role === "manager";
  app.innerHTML = `<div class="review-hero"><div><span class="badge ${statusMeta[review.status][1]}">${statusMeta[review.status][0]}</span><h2 style="margin-top:12px">${escapeHtml(employee.name)}</h2><p>${escapeHtml(employee.position)} · ${escapeHtml(review.period)}</p><div class="review-meta"><span>Встреча: ${formatDate(review.reviewDate)}</span><span>Руководитель: ${escapeHtml(user(review.managerId).name)}</span></div></div><button class="button secondary" data-nav="${isManager ? "reviews" : "dashboard"}">← Назад</button></div>
    <form id="review-form" class="review-form">
      <section class="section-card"><div class="section-title"><div><h2>Цели периода</h2><p>${isManager ? "Зафиксируйте итог и основания оценки" : "Опишите фактический результат по каждой цели"}</p></div>${isManager ? '<button type="button" class="button secondary" id="add-goal">Добавить цель</button>' : ""}</div><div id="goals-list">${review.goals.map((goal, index) => goalEditor(goal, index, isManager)).join("")}</div></section>
      <section class="section-card"><div class="section-title"><div><h2>Итоги периода</h2><p>Общее резюме и направления развития</p></div></div><div class="form-grid">
        <label class="field wide">Самооценка сотрудника<textarea name="employeeSummary" ${isManager ? "readonly" : ""}>${escapeHtml(review.employeeSummary)}</textarea></label>
        ${isManager ? `<label class="field">Сильные стороны<textarea name="strengths">${escapeHtml(review.strengths)}</textarea></label><label class="field">Зоны развития<textarea name="development">${escapeHtml(review.development)}</textarea></label>` : `<label class="field">Сильные стороны по оценке руководителя<textarea readonly>${escapeHtml(review.strengths)}</textarea></label><label class="field">Зоны развития<textarea readonly>${escapeHtml(review.development)}</textarea></label>`}
        <label class="field wide">Цели следующего периода<textarea name="nextGoals" ${isManager ? "" : "readonly"}>${escapeHtml(review.nextGoals)}</textarea></label>
      </div></section>
      ${isManager ? `<section class="section-card private-box"><span class="private-label">Только для руководителя</span><h2>Личные заметки</h2><p class="muted">Сотрудник не видит это поле.</p><textarea name="privateNotes" style="margin-top:12px">${escapeHtml(review.privateNotes)}</textarea></section>` : ""}
      <div class="sticky-actions"><div class="toolbar">${isManager ? `<label style="display:grid;grid-template-columns:auto 210px;gap:9px;align-items:center">Этап<select name="status">${Object.entries(statusMeta).map(([key, value]) => `<option value="${key}" ${key === review.status ? "selected" : ""}>${value[0]}</option>`).join("")}</select></label>` : ""}</div><div class="toolbar"><button type="button" class="button secondary" data-nav="${isManager ? "reviews" : "dashboard"}">Отмена</button><button type="submit" class="button primary">Сохранить изменения</button></div></div>
    </form>`;
}

function goalEditor(goal, index, isManager) {
  return `<div class="goal-card" data-goal-index="${index}"><div class="form-grid">
    <label class="field">Цель<textarea name="goal-title-${index}" ${isManager ? "" : "readonly"}>${escapeHtml(goal.title)}</textarea></label>
    <label class="field">Критерий достижения<textarea name="goal-criteria-${index}" ${isManager ? "" : "readonly"}>${escapeHtml(goal.criteria)}</textarea></label>
    <label class="field wide">Комментарий сотрудника<textarea name="goal-comment-${index}" ${isManager ? "readonly" : ""}>${escapeHtml(goal.employeeComment)}</textarea></label>
    <div class="field wide"><label>Итог по цели</label><div class="status-selector">${[["done","Выполнено"],["partial","Частично"],["missed","Не выполнено"]].map(([value, label]) => `<label><input type="radio" name="goal-result-${index}" value="${value}" ${goal.result === value ? "checked" : ""} ${isManager ? "" : "disabled"} /><span class="status-option">${label}</span></label>`).join("")}</div></div>
  </div></div>`;
}

function openCreateReview() {
  const candidates = managerEmployees().filter(employee => !state.reviews.some(review => review.employeeId === employee.id && review.status !== "complete"));
  const select = document.querySelector("#new-review-employee");
  select.innerHTML = candidates.length ? candidates.map(item => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("") : `<option value="">У всех сотрудников есть активное ревью</option>`;
  document.querySelector("#create-review-submit").disabled = !candidates.length;
  document.querySelector("#new-review-dialog").showModal();
}

function saveReview(form) {
  const review = state.reviews.find(item => item.id === selectedReviewId);
  const data = new FormData(form);
  review.employeeSummary = data.get("employeeSummary") || "";
  review.goals.forEach((goal, index) => {
    if (currentUser().role === "manager") {
      goal.title = data.get(`goal-title-${index}`) || "";
      goal.criteria = data.get(`goal-criteria-${index}`) || "";
      goal.result = data.get(`goal-result-${index}`) || goal.result;
    } else goal.employeeComment = data.get(`goal-comment-${index}`) || "";
  });
  if (currentUser().role === "manager") {
    review.strengths = data.get("strengths") || "";
    review.development = data.get("development") || "";
    review.nextGoals = data.get("nextGoals") || "";
    review.privateNotes = data.get("privateNotes") || "";
    review.status = data.get("status") || review.status;
  }
  persist(); showToast("Изменения сохранены"); renderShell();
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) { state.currentView = nav.dataset.nav; selectedReviewId = null; persist(); renderShell(); document.querySelector(".sidebar").classList.remove("open"); return; }
  const row = event.target.closest('[data-action="open-review"]');
  const direct = event.target.closest("[data-open-review]");
  if (row || direct) { selectedReviewId = row?.dataset.reviewId || direct.dataset.openReview; state.currentView = "review"; renderShell(); return; }
  if (event.target.closest("[data-create-review]")) { openCreateReview(); return; }
  if (event.target.closest("#add-goal")) {
    const review = state.reviews.find(item => item.id === selectedReviewId);
    review.goals.push({ title: "", criteria: "", result: "not_set", employeeComment: "" }); persist(); renderShell();
  }
});

document.querySelector("#identity-select").addEventListener("change", event => {
  state.currentUserId = event.target.value;
  state.currentView = "dashboard";
  selectedReviewId = null; persist(); renderShell();
});
document.querySelector("#mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.querySelector("#new-review-form").addEventListener("submit", event => {
  const submitter = event.submitter;
  if (!submitter || submitter.value === "cancel") return;
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const employeeId = data.get("employeeId");
  if (!employeeId) return;
  const review = { id: `review-${Date.now()}`, employeeId, managerId: currentUser().id, period: data.get("period"), reviewDate: data.get("reviewDate"), status: "draft", strengths: "", development: "", privateNotes: "", employeeSummary: "", goals: [{ title: "", criteria: "", result: "not_set", employeeComment: "" }], nextGoals: "" };
  state.reviews.push(review); persist(); selectedReviewId = review.id; state.currentView = "review"; document.querySelector("#new-review-dialog").close(); renderShell(); showToast("Ревью создано");
});
document.addEventListener("submit", event => {
  if (event.target.id !== "review-form") return;
  event.preventDefault(); saveReview(event.target);
});
document.addEventListener("input", event => {
  if (event.target.id !== "user-search") return;
  const query = event.target.value.trim().toLowerCase();
  const filtered = state.users.filter(item => `${item.name} ${item.email} ${roleNames[item.role]} ${item.isAdmin ? "администратор" : ""}`.toLowerCase().includes(query));
  document.querySelector("#users-table").innerHTML = usersTable(filtered);
});

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const tools = [
    { name: "get_current_review_context", title: "Получить текущий контекст", description: "Возвращает основную роль, дополнительное право администратора и количество доступных пользователю ревью.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => ({ role: currentUser().role, isAdmin: Boolean(currentUser().isAdmin), userId: currentUser().id, reviewCount: accessibleReviews().length }) },
    { name: "open_review", title: "Открыть ревью", description: "Открывает доступное текущему пользователю ревью по идентификатору.", inputSchema: { type: "object", properties: { reviewId: { type: "string" } }, required: ["reviewId"], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: ({ reviewId }) => { if (!accessibleReviews().some(item => item.id === reviewId)) throw new Error("Ревью недоступно"); selectedReviewId = reviewId; state.currentView = "review"; renderShell(); return { reviewId, opened: true }; } }
  ];
  tools.forEach(tool => { try { void Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {} });
}

renderShell();
registerWebMcpTools();
