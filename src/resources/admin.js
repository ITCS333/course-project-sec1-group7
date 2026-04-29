document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resource-form");
    const list = document.getElementById("admin-resource-list");

    const idInput = document.getElementById("resource-id");
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const linkInput = document.getElementById("link");

    function loadResources() {
        fetch("api/list.php")
            .then(response => response.json())
            .then(data => {
                list.innerHTML = "";

                data.forEach(resource => {
                    const article = document.createElement("article");

                    article.innerHTML = `
                        <h3>${resource.title}</h3>
                        <p>${resource.description}</p>
                        <a href="${resource.link}" target="_blank">Open</a>
                        <button onclick="editResource(${resource.id}, '${resource.title}', '${resource.description}', '${resource.link}')">Edit</button>
                        <button onclick="deleteResource(${resource.id})">Delete</button>
                    `;

                    list.appendChild(article);
                });
            });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = idInput.value;

        const resource = {
            title: titleInput.value,
            description: descriptionInput.value,
            link: linkInput.value
        };

        const url = id ? "api/update.php?id=" + id : "api/create.php";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resource)
        })
        .then(response => response.json())
        .then(() => {
            form.reset();
            idInput.value = "";
            loadResources();
        });
    });

    window.editResource = function (id, title, description, link) {
        idInput.value = id;
        titleInput.value = title;
        descriptionInput.value = description;
        linkInput.value = link;
    };

    window.deleteResource = function (id) {
        fetch("api/delete.php?id=" + id, {
            method: "POST"
        })
        .then(response => response.json())
        .then(() => {
            loadResources();
        });
    };

    loadResources();
});
