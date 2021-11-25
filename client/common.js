const UserObj = {
  loggedIn: false,
  first_name: null,
  last_name: null,
  email_id: null,

  async init() {
    try {
      let authResult = await catalyst.auth.isUserAuthenticated();
      console.log(authResult.content);
      this.email_id = authResult.content.email_id;
      this.first_name = authResult.content.first_name;
      this.loggedIn = true;
    } catch (error) {
      document.body.innerHTML =
        "You are not logged in. Please log in to continue. Redirecting you to the login page..";
      setTimeout(function () {
        window.location.href = "index.html";
      }, 3000);
    }
  },
};

function logout() {
  //The signOut method is used to sign the user out of the application
  var redirectURL = document.location.origin + "/app/index.html";
  console.log(redirectURL);
  var auth = catalyst.auth;
  auth.signOut(redirectURL);
}

function copyToClipboard(id) {
  /* Get the text field */
  var copyText = document.getElementById(id);
  console.log("the ele", copyText);

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);
}
