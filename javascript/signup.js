// ==========================================
// SIGNUP FORM
// ==========================================

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (e) {

    e.preventDefault();

    // Get Input Values

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Password Validation

    if(password !== confirmPassword){

        alert("Passwords do not match ❌");

        return;
    }

    // Get Existing Users

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check Email Exists

    const existingUser = users.find(function(user){

        return user.email === email;

    });

    if(existingUser){

        alert("Email already registered!");

        return;

    }

    // Create User Object

    const newUser = {

        name: name,

        email: email,

        password: password

    };

    // Store User

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account Created Successfully ✅");

    // Redirect

    window.location.href = "login.html";

});