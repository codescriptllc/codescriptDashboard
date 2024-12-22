// Function to check if a user is logged in
function checkAuthStatus() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        console.log("User is not logged in. Redirecting...");
        window.location.href = "index.html"; // Replace with your login page
      } else {
        console.log("User is logged in:", user.email);
      }
    });
  }
  
// Continuously check the user's login status every 5 seconds
setInterval(checkAuthStatus, 2000);
  
checkAuthStatus();