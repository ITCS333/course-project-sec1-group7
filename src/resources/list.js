document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("resource-list-section");

    fetch("/resources/api/index.php")
        .then(response => response.json())
        .then(data => {

            section.innerHTML = "";

            data.forEach(resource => {

                const article = document.createElement("article");

                article.innerHTML = `
                    <h2>${resource.title}</h2>
                    <p>${resource.description}</p>
                    <a href="details.html?id=${resource.id}">
                        View Resource & Discussion
                    </a>
                `;

                section.appendChild(article);
            });
        })
        .catch(error => console.error(error));
});
