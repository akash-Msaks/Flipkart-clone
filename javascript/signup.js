// ==========================================
// SIGNUP
// ==========================================

const signupForm =
    document.getElementById("signupForm");


// ==========================================
// SUBMIT SIGNUP
// ==========================================

signupForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        // ======================================
        // GET VALUES
        // ======================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value
                .trim();


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value
                .trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            alert(
                "Please fill all fields"
            );

            return;

        }


        // ======================================
        // PASSWORD MATCH
        // ======================================

        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match"
            );

            return;

        }


        // ======================================
        // PASSWORD LENGTH
        // ======================================

        if (
            password.length < 6
        ) {

            alert(
                "Password must contain at least 6 characters"
            );

            return;

        }


        try {

            // ==================================
            // REGISTER API
            // ==================================

            const response =
                await fetch(
                     "http://localhost:5001/api/auth/register",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                password:
                                    password

                            })

                    }
                );


            // ==================================
            // GET RESPONSE
            // ==================================

            const data =
                await response.json();


            // ==================================
            // REGISTRATION FAILED
            // ==================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed"
                );

                return;

            }


            // ==================================
            // SAVE USER ID FOR OTP
            // ==================================

            localStorage.setItem(
                "otpUserId",
                data.userId
            );


            // ==================================
            // SAVE EMAIL FOR RESEND
            // ==================================

            localStorage.setItem(
                "otpEmail",
                email
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "OTP sent to your email 📧"
            );


            // ==================================
            // GO TO OTP PAGE
            // ==================================

            window.location.href =
                "otp.html";


        } catch (error) {

            console.log(
                "Signup error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);