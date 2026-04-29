document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("resource-details-section");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    fetch(`api/get.php?id=${id}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (resource) {

            section.innerHTML = `
                <h2>${resource.title}</h2>
                <p>${resource.description}</p>
                <a href="${resource.link}" target="_blank">Open Resource</a>
            `;
        })
        .catch(function (error) {
            console.error("Error:", error);
        });
});
