const container = document.querySelector(".container");
let pwShowHide = document.querySelectorAll(".showHidePw");
let pwFields = document.querySelectorAll(".password");
let signUp = document.querySelector(".signup-link");
let login = document.querySelector(".login-link");
let strengthBadge = document.getElementById("StrengthDisp");
let forms = document.querySelectorAll("form");
let signUpBtn = document.querySelector("#signup-btn");
let email = document.querySelector("#email-input");
let userName = document.querySelector("#name-input");
let password = document.querySelector("#password-input");
const login_btn = document.querySelector("#login-btn");

let login_email = document.querySelector("#login-email-input");
let login_password = document.querySelector("#login-password-input");
let forgotPassword = document.querySelector(".forgot-text");
let errorElement = document.querySelector("#error");
let confirm_password = document.querySelector(".confirm-password");
let remberME = document.getElementById("logCheck");
let letter = document.getElementById("letter");
let capital = document.getElementById("capital");
let number = document.getElementById("number");
let length = document.getElementById("length");
let robot = document.getElementById("robot");
forms.forEach(function (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
});
login_btn.addEventListener("click", function () {
  loginpage();
});

pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    pwFields.forEach((pwField) => {
      if (pwField.type === "password") {
        pwField.type = "text";

        pwShowHide.forEach((icon) => {
          icon.classList.replace("uil-eye-slash", "uil-eye");
        });
      } else {
        pwField.type = "password";

        pwShowHide.forEach((icon) => {
          icon.classList.replace("uil-eye", "uil-eye-slash");
        });
      }
    });
  });
});

signUpBtn.addEventListener("click", function () {
  register();
});

signUp.addEventListener("click", () => {
  container.classList.add("active");
});
login.addEventListener("click", () => {
  container.classList.remove("active");
});
password.onfocus = function () {
  document.getElementById("message").style.display = "block";
};
password.onblur = function () {
  document.getElementById("message").style.display = "none";
};
password.addEventListener("keyup", function () {
  let lowerCaseLetters = /[a-z]/g;

  if (password.value.match(lowerCaseLetters)) {
    letter.classList.remove("invalid");
    letter.classList.add("valid");
  } else {
    letter.classList.remove("valid");
    letter.classList.add("invalid");
  }

  // Validate capital letters
  let upperCaseLetters = /[A-Z]/g;
  if (password.value.match(upperCaseLetters)) {
    capital.classList.remove("invalid");
    capital.classList.add("valid");
  } else {
    capital.classList.remove("valid");
    capital.classList.add("invalid");
  }

  // Validate numbers
  let numbers = /[0-9]/g;
  if (password.value.match(numbers)) {
    number.classList.remove("invalid");
    number.classList.add("valid");
    signUpBtn.disabled = false;
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

  // Validate length
  if (password.value.length >= 8) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }
});

function loginpage() {
  const loginEmail = login_email.value;
  const loginPassword = login_password.value;
  auth
    .signInWithEmailAndPassword(loginEmail, loginPassword)
    .then((userCredential) => {
      const user = userCredential.user;
      window.location.replace("/Live/room.html");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      errorElement.textContent = errorMessage;
    });
}
forgotPassword.addEventListener("click", function () {
  reset();
});

function reset() {
  auth
    .sendPasswordResetEmail(login_email.value)
    .then(() => {
      alert("Reset sent to Your Email Address " + login_email.value);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(error, errorCode);
    });
}

function register() {
  inputEmail = email.value;
  inputPassword = password.value;
  confirm = confirm_password.value;
  userName = userName.value;

  auth
    .createUserWithEmailAndPassword(inputEmail, inputPassword)
    .then(function () {
      let user = auth.currentUser;
      let database_ref = db.ref();

      let user_data = {
        inputEmail: inputEmail,
        userName: userName,
        password: inputPassword,
        last_login: Date.now(),
      };

      database_ref.child("users/" + user.uid).set(user_data);
      alert("user Created Now You Can Login");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      errorElement.textContent = errorMessage;
    });
}

function display() {
  let user = auth.currentUser;
  if (user !== null) {
    const name = document.querySelector(".name");
    name.textContent = user.displayName;
  }
  console.log(user.uid);
}
