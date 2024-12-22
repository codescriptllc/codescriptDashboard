// Theme switcher
document.getElementById('themeSwitcher').addEventListener('change', (event) => {
    if (event.target.checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Load saved theme preference
  window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.getElementById('themeSwitcher').checked = true;
    }
  };
  



//WHEN LOG OUT BUTTON IS PRESSED...
function logOut(){
  firebase.auth().signOut().then(function(){
      // SIGN-OUT SUCCESSFULL
      window.location = "index.html"
  }).catch(function(error){
      //AN ERROR HAPPENED SIGNING OUT
  });
}