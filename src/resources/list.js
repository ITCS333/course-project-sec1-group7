document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("resource-details-section");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    fetch(`/resources/api/index.php?id=${id}`)
        .then(response => response.json())
        .then(resource => {

            section.innerHTML = `
                <h2>${resource.title}</h2>
                <p>${resource.description}</p>
                <a href="${resource.link}" target="_blank">Open Resource</a>
            `;
        })
        .catch(error => console.error(error));
});
