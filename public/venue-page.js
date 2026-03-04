let loggedIn = false;

document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cardGrid = document.querySelector(".card-grid");
  const form = document.getElementById("addVenueForm");

  ///function to add a new venue to the database from the form on the frontend

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

  // Fetch the stores data from the API and initialize the page with the data
  fetch("http://localhost:3000/api/venues")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      updateFilterCounts(data);
      renderCards(data);
      setupFiltering();
    })
    .catch((error) => console.error("Could not fetch stores data:", error));

  // Function to render cards based on the stores data
  function renderCards(stores) {
    cardGrid.innerHTML = "";

    stores.forEach((store) => {
      const districtName = store.district ? store.district : "Other";

      // Call for the function to get images for the cards
      const cardImageUrl = getCardImage(store, districtName);

      const websiteHTML = store.url
        ? `<div class="info-row">
           <i class="fa-solid fa-link"></i>
           <a href="https://${store.url}" target="_blank" style="color: inherit; text-decoration: underline;">Visit the website</a>
         </div>`
        : "";
      ///  card HTML structure with dynamic data and event handlers for edit and delete buttons
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
      /// if user is logged in, show the edit and delete buttons, otherwise do not show the buttons
      loggedIn
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

  // Function to determine the appropriate image for a store card based on its district or a default image
  function getCardImage(store, districtName) {
    const districtImages = {
      Öster: "images/category-oster.jpeg",
      Väster: "images/category-vaster.jpg",
      Atollen: "images/category-atollen.jpg",
      Tändsticksområdet: "images/category-tandsticksomradet.jpg",
      Other: "images/category-other.jpg", // A default image for stores without a specific district or for the "Other" category.
    };

    // First priority: store-specific image, if available
    if (store.image) {
      return store.image;
    }
    // Second priority: district-specific image, if available.
    // In case we want to have a default image for each district.
    return districtImages[districtName] || districtImages["Other"];
  }

  // Calculate and update the counts for each filter button
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
        if (filterValue === "all") {
          countSpan.textContent = `(${counts.all})`;
        } else {
          countSpan.textContent = `(${counts[filterValue] || 0})`;
        }
      }
    });
  }

  // Filtering logic for the buttons to show/hide cards based on category
  function setupFiltering() {
    const cards = document.querySelectorAll(".venue-card");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        cards.forEach((card) => {
          const category = card.getAttribute("data-category");

          if (filterValue === "all" || filterValue === category) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
});

/// function to delete the selected card
async function deleteVenue(id) {
  await fetch(`http://localhost:3000/api/venues/${id}`, {
    method: "DELETE",
  });

  location.reload();
}

// function to edit a venue in the database from the edit button on the frontend
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

//function to hide the add venue form if the user is not logged in and show the form if the user is logged in

fetch("/api/auth")
  .then((res) => res.json())
  .then((data) => {
    loggedIn = data.loggedIn;

    if (!loggedIn) {
      const form = document.getElementById("addVenueForm");

      if (form) {
        form.style.display = "none";
      }
    }
  });
