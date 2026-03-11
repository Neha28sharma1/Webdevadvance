// Navigation bar
function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      const placeholder = document.getElementById("navbar-placeholder");
      if (placeholder) {
        placeholder.innerHTML = data;

        // After navbar is loaded, check login status
        checkAuth();
      }
    })
    .catch((error) => console.error("Can't load navbar:", error));
}

// Check if user is logged in
function checkAuth() {
  fetch("/api/auth")
    .then((res) => res.json())
    .then((data) => {
      const loginLink = document.getElementById("login-link");
      const logoutLink = document.getElementById("logout-link");

      // if (!loginLink || !logoutLink) return;

      if (data.loggedIn) {
        loginLink.style.display = "none";
        logoutLink.style.display = "inline-block";
      } else {
        loginLink.style.display = "inline-block";
        logoutLink.style.display = "none";
      }
    })
    .catch((err) => console.error("Auth check failed:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});











document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});
