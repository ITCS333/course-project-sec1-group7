document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("resource-list-section");

    fetch("api/list.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            section.innerHTML = ""; 

            data.forEach(function (resource) {

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
        .catch(function (error) {
            console.error("Error:", error);
        });
});
