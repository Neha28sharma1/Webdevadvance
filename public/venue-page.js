// Check if the user is logged in and if they are an admin
let isAdmin = false;

document.addEventListener("DOMContentLoaded", async () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cardGrid = document.querySelector(".card-grid");
  const form = document.getElementById("addVenueForm");

  try {
    // When the page loads, first check the user's authentication and role to determine if they are an admin
    const authRes = await fetch("/api/auth");
    const authData = await authRes.json();

    // Both loggedIn and role === "admin" must be true for the user to be considered an admin
    isAdmin = authData.loggedIn && authData.role === "admin";

    // If not the admin, do not show
    if (!isAdmin) {
      if (form) form.style.display = "none";
    }

    const venueRes = await fetch("http://localhost:3000/api/venues");
    if (!venueRes.ok) throw new Error("Network response was not ok");
    const stores = await venueRes.json();

    updateFilterCounts(stores);
    renderCards(stores);
    setupFiltering();
  } catch (error) {
    console.error("Initialization error:", error);
  }

  // Handle form submission to add a new venue
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const venue = {
        name: document.getElementById("name").value,
        url: document.getElementById("url").value,
        district: document.getElementById("district").value,
      };

      await fetch("http://localhost:3000/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venue),
      });

      location.reload();
    });
  }

  // Function to render venue cards on the page
  function renderCards(stores) {
    cardGrid.innerHTML = "";

    stores.forEach((store) => {
      const districtName = store.district ? store.district : "Other";
      const cardImageUrl = getCardImage(store, districtName);

      const websiteHTML = store.url
        ? `<div class="info-row">
           <i class="fa-solid fa-link"></i>
           <a href="https://${store.url}" target="_blank" style="color: inherit; text-decoration: underline;">Visit the website</a>
         </div>`
        : "";

      const cardHTML = `
      <div class="venue-card" data-category="${districtName}">
        <div class="card-image" style="background-image: url('${cardImageUrl}');">
          <span class="badge category">${districtName}</span>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h3>${store.name}</h3>
          </div>

          <div class="info-row">
            <i class="fa-solid fa-location-dot"></i>
            <span>${districtName === "Other" ? "Jönköping" : districtName + ", Jönköping"}</span>
          </div>

          ${websiteHTML}

          ${
            // If the user is an admin, show the edit and delete buttons on each card
            isAdmin
              ? `
          <div class="card-actions">
            <button onclick="editVenue(${store.id}, '${store.name}', '${store.url}', '${store.district}')">
              Edit
            </button>
            <button onclick="deleteVenue(${store.id})">
              Delete
            </button>
          </div>
          `
              : ``
          }
        </div>
      </div>
      `;

      cardGrid.innerHTML += cardHTML;
    });
  }

  function getCardImage(store, districtName) {
    const districtImages = {
      Öster: "images/category-oster.jpeg",
      Väster: "images/category-vaster.jpg",
      Atollen: "images/category-atollen.jpg",
      Tändsticksområdet: "images/category-tandsticksomradet.jpg",
      Other: "images/category-other.jpg",
    };
    if (store.image) return store.image;
    return districtImages[districtName] || districtImages["Other"];
  }

  function updateFilterCounts(stores) {
    const counts = { all: stores.length };
    stores.forEach((store) => {
      if (store.district) {
        counts[store.district] = (counts[store.district] || 0) + 1;
      }
    });

    filterBtns.forEach((btn) => {
      const filterValue = btn.getAttribute("data-filter");
      const countSpan = btn.querySelector(".count");
      if (countSpan) {
        countSpan.textContent = `(${filterValue === "all" ? counts.all : counts[filterValue] || 0})`;
      }
    });
  }

  function setupFiltering() {
    const cards = document.querySelectorAll(".venue-card");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const category = card.getAttribute("data-category");
          card.style.display =
            filterValue === "all" || filterValue === category
              ? "block"
              : "none";
        });
      });
    });
  }
});

// Function to delete a venue by sending a DELETE request to the backend API, then reload the page to reflect changes
async function deleteVenue(id) {
  await fetch(`http://localhost:3000/api/venues/${id}`, {
    method: "DELETE",
  });
  location.reload();
}

async function editVenue(id, name, url, district) {
  const newName = prompt("Edit venue name:", name);
  const newUrl = prompt("Edit website:", url);
  const newDistrict = prompt("Edit district:", district);

  if (!newName) return;

  await fetch(`http://localhost:3000/api/venues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
      url: newUrl,
      district: newDistrict,
    }),
  });
  location.reload();
}
