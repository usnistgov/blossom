document.addEventListener("DOMContentLoaded", function() {
    const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    const repoName = 'blossom';

    const BASE_URL = isLocal ? '/' : `/${repoName}/`;

    fetch(`${BASE_URL}sidenav.html`)
        .then(response => response.text())
        .then(data => {
             const fixedHTML = data.replace(/\{\{BASE_URL\}\}/g, BASE_URL);

            document.getElementById("sidenav-main").innerHTML = fixedHTML;
            setActiveNavLink();
        })
        .catch(error => console.error("Error loading the sidenavigation: ", error));
});

function setActiveNavLink() {
    const links = document.querySelectorAll('#sidenav-main .resources-sidebar-nav a');
    const currentUrl = window.location.href;

    links.forEach(link => {
        try {
            const linkUrl = new URL(link.href, window.location.origin);
            const currentUrlObj = new URL(currentUrl);

            let linkPath = linkUrl.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
            let currentPath = currentUrlObj.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');

            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        } catch (e) {
            console.error('Error processing link: ', e);
        }
    });
}