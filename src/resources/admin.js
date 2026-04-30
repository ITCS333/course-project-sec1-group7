window.resources = [];
let editingId = null;

function createResourceRow({ id, title, description, link }) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${title}</td>
    <td>${description}</td>
    <td><a href="${link}" target="_blank">${link}</a></td>
    <td>
      <button class="edit-btn"   data-id="${id}">Edit</button>
      <button class="delete-btn" data-id="${id}">Delete</button>
    </td>
  `;
  return tr;
}

function renderTable() {
  const tbody = document.querySelector('#resources-tbody');
  tbody.innerHTML = '';
  window.resources.forEach(resource => {
    tbody.appendChild(createResourceRow(resource));
  });
}

async function handleAddResource(event) {
  event.preventDefault();

  const title       = document.querySelector('#resource-title').value.trim();
  const description = document.querySelector('#resource-description').value.trim();
  const link        = document.querySelector('#resource-link').value.trim();

  if (editingId !== null) {
    const res  = await fetch('./api/index.php', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: editingId, title, description, link }),
    });
    const data = await res.json();
    if (data.success) {
      window.resources = window.resources.map(r =>
        r.id == editingId ? { id: editingId, title, description, link } : r
      );
      exitEditMode();
      renderTable();
    }
  } else {
    const res  = await fetch('./api/index.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, description, link }),
    });
    const data = await res.json();
    if (data.success) {
      window.resources.push({ id: data.id, title, description, link });
      renderTable();
    }
  }

  document.querySelector('#resource-form').reset();
}

function handleTableClick(event) {
  const target = event.target;

  if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    fetch(`./api/index.php?id=${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.resources = window.resources.filter(r => r.id != id);
          renderTable();
        }
      });
  }

  if (target.classList.contains('edit-btn')) {
    const id       = target.dataset.id;
    const resource = window.resources.find(r => r.id == id);
    if (!resource) return;

    document.querySelector('#resource-title').value       = resource.title;
    document.querySelector('#resource-description').value = resource.description;
    document.querySelector('#resource-link').value        = resource.link;

    editingId = resource.id;
    document.querySelector('#add-resource').textContent = 'Update Resource';
  }
}

function exitEditMode() {
  editingId = null;
  document.querySelector('#add-resource').textContent = 'Add Resource';
  document.querySelector('#resource-form').reset();
}

async function loadAndInitialize() {
  const res  = await fetch('./api/index.php');
  const data = await res.json();
  if (data.success) {
    window.resources = data.data;
    renderTable();
  }
  document.querySelector('#resource-form').addEventListener('submit', handleAddResource);
  document.querySelector('#resources-tbody').addEventListener('click', handleTableClick);
}

loadAndInitialize();
