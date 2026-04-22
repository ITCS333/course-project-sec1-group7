// --- Global Data Store ---
let weeks = [];

// --- Element Selections ---
const form = document.getElementById('week-form');
const tbody = document.getElementById('weeks-tbody');
const submitBtn = document.getElementById('add-week');


// --- Functions ---

function createWeekRow(week) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${week.title}</td>
    <td>${week.start_date}</td>
    <td>${week.description}</td>
    <td>
      <button class="edit-btn" data-id="${week.id}">Edit</button>
      <button class="delete-btn" data-id="${week.id}">Delete</button>
    </td>
  `;

  return tr;
}


function renderTable() {
  tbody.innerHTML = '';

  weeks.forEach(week => {
    const row = createWeekRow(week);
    tbody.appendChild(row);
  });
}


async function handleAddWeek(event) {
  event.preventDefault();

  const title = document.getElementById('week-title').value.trim();
  const start_date = document.getElementById('week-start-date').value;
  const description = document.getElementById('week-description').value.trim();

  const linksRaw = document.getElementById('week-links').value;
  const links = linksRaw.split('\n').map(l => l.trim()).filter(l => l);

  const editId = submitBtn.dataset.editId;

  if (editId) {
    await handleUpdateWeek(editId, { title, start_date, description, links });
    return;
  }

  const res = await fetch('./api/index.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, start_date, description, links })
  });

  const result = await res.json();

  if (result.success) {
    weeks.push({
      id: result.id,
      title,
      start_date,
      description,
      links
    });

    renderTable();
    form.reset();
  }
}


async function handleUpdateWeek(id, fields) {
  const res = await fetch('./api/index.php', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, ...fields })
  });

  const result = await res.json();

  if (result.success) {
    const index = weeks.findIndex(w => w.id == id);

    if (index !== -1) {
      weeks[index] = { id, ...fields };
    }

    renderTable();
    form.reset();

    submitBtn.textContent = "Add Week";
    delete submitBtn.dataset.editId;
  }
}


async function handleTableClick(event) {
  const target = event.target;

  const id = target.dataset.id;

  if (target.classList.contains('delete-btn')) {
    const res = await fetch(`./api/index.php?id=${id}`, {
      method: 'DELETE'
    });

    const result = await res.json();

    if (result.success) {
      weeks = weeks.filter(w => w.id != id);
      renderTable();
    }
  }

  if (target.classList.contains('edit-btn')) {
    const week = weeks.find(w => w.id == id);

    if (!week) return;

    document.getElementById('week-title').value = week.title;
    document.getElementById('week-start-date').value = week.start_date;
    document.getElementById('week-description').value = week.description;
    document.getElementById('week-links').value = week.links.join('\n');

    submitBtn.textContent = "Update Week";
    submitBtn.dataset.editId = id;
  }
}


async function loadAndInitialize() {
  const res = await fetch('./api/index.php');
  const result = await res.json();

  if (result.success) {
    weeks = result.data;
    renderTable();
  }

  form.addEventListener('submit', handleAddWeek);
  tbody.addEventListener('click', handleTableClick);
}


// --- Initial Page Load ---
loadAndInitialize();