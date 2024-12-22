// document.getElementById('loginForm').addEventListener('submit', function(e) {
//     e.preventDefault();
  
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
  
//     if (username === '' || password === '') {
//       alert('Please fill in both fields!');
//       return;
//     }
  
//     // Simulate a login process (this would typically involve an API request)
//     console.log('Logging in with:', username, password);
  
//     // Redirect to the dashboard after a successful login (this would typically be handled with an actual check)
//     window.location.href = 'index.html'; // Redirect to your dashboard page
//   });
  

// WHEN THE LOGIN BUTTON IS CLICKED ON THE LOGIN PAGE */
function login(event){
  event.preventDefault()
  var email = document.getElementById('emailField').value
  var password = document.getElementById('passwordField').value
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){
      //HANDELING ERRORS
      var errorCode = error.code;
      console.log("Error signing in,",  error.message)
      document.getElementById("errorMessage").style.display = "block"
      document.getElementById("errorMessage").style.fontSize = "10px"
      document.getElementById('messageError').style.width = '100%'
      document.getElementById('messageError').style.wordWrap = 'break-word'
      document.getElementById("messageError").innerHTML = error.message
      document.getElementById('messageError').style.textAlign = 'center'
      document.getElementById("errorMessage").style.color = "red"
      document.getElementById('messageError').style.marginBottom = '2%'
      setTimeout(function(){
          document.getElementById("errorMessage").style.display = "none"
      }, 3000);
  }).then(function(user){
      //IF THE USER IS LOGGED IN
      if(user != null){
          console.log("User is logged in")
          window.location.href = "dashboard.html"

          , function (errorObject) {
              console.log("The read failed: " + errorObject.code);
          }
        }
      })
    }


//WHEN LOG OUT BUTTON IS PRESSED...
function logOut(){
  firebase.auth().signOut().then(function(){
      // SIGN-OUT SUCCESSFULL
      window.location = "index.html"
  }).catch(function(error){
      //AN ERROR HAPPENED SIGNING OUT
  });
}
