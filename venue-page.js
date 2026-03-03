document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".venue-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Change color of active button
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Get filter value from button's data attribute
      const filterValue = btn.getAttribute("data-filter");

      // Filter cards based on category
      cards.forEach((card) => {
        const category = card.getAttribute("data-category");

        // If filter is "all" or matches card category, show it. Otherwise hide it
        if (filterValue === "all" || filterValue === category) {
          card.style.display = "block";
        } else {
          card.style.display = "none"; // Hide card if it doesn't match filter
        }
      });
    });
  });
});
