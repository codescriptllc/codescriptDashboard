// // Function to check if an element is in the viewport
// function isInViewport(element) {
//     const rect = element.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// }

// // Function to handle the scroll event
// function handleScroll() {
//     // Get the fade-in section
//     const fadeInSection = document.getElementById('projects');
//     if (isInViewport(fadeInSection)) {
//         fadeInSection.classList.add('fade-in');
//     }
// }

// // Attach the handleScroll function to the scroll event
// window.addEventListener('scroll', handleScroll);

// // Initial check on page load
// window.addEventListener('load', handleScroll);

