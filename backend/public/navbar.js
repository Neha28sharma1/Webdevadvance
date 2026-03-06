// Navigation bar
function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      const placeholder = document.getElementById("navbar-placeholder");
      if (placeholder) {
        placeholder.innerHTML = data;
      }
    })
    .catch((error) => console.error("Can't load navbar:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});
