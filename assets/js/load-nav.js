document.addEventListener("DOMContentLoaded", function() {
    const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    const repoName = 'blossom';

    const BASE_URL = isLocal ? '/' : `/${repoName}/`;

    fetch(`${BASE_URL}nav.html`)
        .then(response => response.text())
        .then(data => {
             const fixedHTML = data.replace(/\{\{BASE_URL\}\}/g, BASE_URL);

            document.getElementById("nav-main").innerHTML = fixedHTML;
        })
        .catch(error => console.error("Error loading the navigation: ", error));
});