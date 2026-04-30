/*
  Requirement: Make the "Manage Resources" page interactive.
*/

// --- Global Data Store ---
let resources = [];
let editingId = null; // tracks which resource is being edited (null = add mode)

// --- Element Selections ---
const resourceForm = document.querySelector('#resource-form');
const resourcesTbody = document.querySelector('#resources-tbody');

// --- Functions ---

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
  resourcesTbody.innerHTML = '';
  resources.forEach(resource => {
    resourcesTbody.appendChild(createResourceRow(resource));
  });
}

async function handleAddResource(event) {
  event.preventDefault();

  const title       = document.querySelector('#resource-title').value.trim();
  const description = document.querySelector('#resource-description').value.trim();
  const link        = document.querySelector('#resource-link').value.trim();

  if (editingId !== null) {
    // --- PUT (update existing) ---
    const res  = await fetch('./api/index.php', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: editingId, title, description, link }),
    });
    const data = await res.json();

    if (data.success) {
      resources = resources.map(r =>
        r.id == editingId ? { id: editingId, title, description, link } : r
      );
      exitEditMode();
      renderTable();
    }

  } else {
    // --- POST (add new) ---
    const res  = await fetch('./api/index.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, description, link }),
    });
    const data = await res.json();

    if (data.success) {
      resources.push({ id: data.id, title, description, link });
      renderTable();
    }
  }

  resourceForm.reset();
}

function handleTableClick(event) {
  const target = event.target;

  // --- DELETE ---
  if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    fetch(`./api/index.php?id=${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          resources = resources.filter(r => r.id != id);
          renderTable();
        }
      });
  }

  // --- EDIT ---
  if (target.classList.contains('edit-btn')) {
    const id       = target.dataset.id;
    const resource = resources.find(r => r.id == id);
    if (!resource) return;

    // Populate form with existing values
    document.querySelector('#resource-title').value       = resource.title;
    document.querySelector('#resource-description').value = resource.description;
    document.querySelector('#resource-link').value        = resource.link;

    // Switch to edit mode
    editingId = resource.id;
    document.querySelector('#add-resource').textContent = 'Update Resource';
  }
}

function exitEditMode() {
  editingId = null;
  document.querySelector('#add-resource').textContent = 'Add Resource';
  resourceForm.reset();
}

async function loadAndInitialize() {
  const res  = await fetch('./api/index.php');
  const data = await res.json();

  if (data.success) {
    resources = data.data;
    renderTable();
  }

  resourceForm.addEventListener('submit', handleAddResource);
  resourcesTbody.addEventListener('click', handleTableClick);
}

// --- Initial Page Load ---
loadAndInitialize();
