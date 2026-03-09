// it selects all circle elements
const items = document.querySelectorAll(".person");

// the scroll observer
const observer = new IntersectionObserver((entries)=>{
// Loop through each observed element
  entries.forEach(entry=>{

      // Check if the element is visible on screen
    if(entry.isIntersecting){

 // Create a random delay so images appear at different times
      const randomDelay = Math.random() * 1.5;
      entry.target.style.transitionDelay = randomDelay + "s";

   // Adding the class that triggers the CSS animation
      entry.target.classList.add("show");

    // it stops observing after the animation runs
      observer.unobserve(entry.target);
    }
  });
  // Trigger animation, when the element is visible at 15%
},{ threshold:0.15 });

// Start watching every image
items.forEach(el => observer.observe(el));
