document.addEventListener("DOMContentLoaded", function() {
    fetch("/nav.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("nav-main").innerHTML = data;
        })
        .catch(error => console.error("Error loading the navigation: ", error));
});