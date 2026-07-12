// ===============================
// SHOW PASSWORD
// ===============================

const showPassword = document.getElementById("showPassword");
const password = document.getElementById("password");

showPassword.addEventListener("change", function () {

    if (showPassword.checked) {

        password.type = "text";

    } else {

        password.type = "password";

    }

});

// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    // Get all users from localStorage

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find matching user

    const user = users.find(function (u) {

        return u.email === email && u.password === password;

    });

    if (user) {

        // Save logged user

        localStorage.setItem("loggedUser", JSON.stringify(user));

        alert("Login Successful ✅");

        window.location.href = "index.html";

    }

    else {

        alert("Invalid Email or Password ❌");

    }

});