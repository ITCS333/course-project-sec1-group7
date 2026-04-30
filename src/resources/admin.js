var resources = [];
var editId = null;

const resourceForm = document.querySelector("#resource-form");

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
  const resourcesTbody = document.querySelector("#resources-tbody");

  resourcesTbody.innerHTML = "";

  resources.forEach(function (resource) {
    resourcesTbody.appendChild(createResourceRow(resource));
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
        if (String(resource.id) === String(editId)) {
          return { id: editId, title, description, link };
        }
        return resource;
      });

      editId = null;
      document.querySelector("#add-resource").textContent = "Add Resource";
    } else {
      resources.push({ id: result.id, title, description, link });
    }

    renderTable();
    document.querySelector("#resource-form").reset();
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

  renderTable();

  document.querySelector("#resource-form").addEventListener("submit", handleAddResource);
  document.querySelector("#resources-tbody").addEventListener("click", handleTableClick);
}

loadAndInitialize();
