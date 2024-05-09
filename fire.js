const logout_btn = document.querySelector("#logout-btn");

const firebaseConfig = {
  apiKey: "AIzaSyAhP_TdnyGUbeJoZZO8aG57ypNRQ-pIqgY",
  authDomain: "login-326f5.firebaseapp.com",
  databaseURL:
    "https://login-326f5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-326f5",
  storageBucket: "login-326f5.appspot.com",
  messagingSenderId: "687715237793",
  appId: "1:687715237793:web:72520ca81e1e4f6f1c95e0",
  measurementId: "G-B7VK8W2FBE",
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var auth = firebase.auth();


async function signout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "/login.html";
    })
    .catch((error) => {
      console.log(error);
    });
}
auth.onAuthStateChanged(async function (user) {
  if (user) {
    await db
      .ref()
      .child("/users/" + user.uid)
      .once("value")
      .then(function (snaphot) {
        document.getElementById("username").textContent =
          "Welcome " + snaphot.val().userName;
      });
  } else {
    console.log(user);
  }
});
