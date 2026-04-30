let resources = [];
let editId = null;

const resourceForm = document.querySelector("#resource-form");
const resourcesTbody = document.querySelector("#resources-tbody");

function createResourceRow(resource) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${resource.title}</td>
    <td>${resource.description}</td>
    <td>${resource.link}</td>
    <td>
      <button class="edit-btn" data-id="${resource.id}">Edit</button>
      <button class="delete-btn" data-id="${resource.id}">Delete</button>
    </td>
  `;

  return row;
}

function renderTable() {
  resourcesTbody.innerHTML = "";

  window.resources.forEach(function (resource) {
    const row = createResourceRow(resource);
    resourcesTbody.appendChild(row);
  });
}

async function handleAddResource(event) {
  event.preventDefault();

  const title = document.querySelector("#resource-title").value;
  const description = document.querySelector("#resource-description").value;
  const link = document.querySelector("#resource-link").value;

  const response = await fetch("./api/index.php", {
    method: editId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      editId ? { id: editId, title, description, link } : { title, description, link }
    )
  });

  const result = await response.json();

  if (result.success) {
    if (editId) {
      resources = resources.map(function (resource) {
        return String(resource.id) === String(editId)
          ? { id: editId, title, description, link }
          : resource;
      });

      editId = null;
      document.querySelector("#add-resource").textContent = "Add Resource";
    } else {
      resources.push({ id: result.id, title, description, link });
    }

    window.resources = resources;
    renderTable();
    resourceForm.reset();
  }
}

async function handleTableClick(event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = event.target.dataset.id;

    const response = await fetch(`./api/index.php?id=${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (result.success) {
      resources = resources.filter(function (resource) {
        return String(resource.id) !== String(id);
      });

      window.resources = resources;
      renderTable();
    }
  }

  if (event.target.classList.contains("edit-btn")) {
    const id = event.target.dataset.id;

    const resource = resources.find(function (resource) {
      return String(resource.id) === String(id);
    });

    if (resource) {
      document.querySelector("#resource-title").value = resource.title;
      document.querySelector("#resource-description").value = resource.description;
      document.querySelector("#resource-link").value = resource.link;

      editId = id;
      document.querySelector("#add-resource").textContent = "Update Resource";
    }
  }
}

async function loadAndInitialize() {
  const response = await fetch("./api/index.php");
  const result = await response.json();

  resources = result.data || [];
  window.resources = resources;

  renderTable();

  resourceForm.addEventListener("submit", handleAddResource);
  resourcesTbody.addEventListener("click", handleTableClick);
}

loadAndInitialize();
