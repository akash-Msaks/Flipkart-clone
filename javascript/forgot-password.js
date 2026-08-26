// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


// ==========================================
// SUBMIT
// ==========================================

forgotPasswordForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        if (!email) {

            alert(
                "Please enter your email"
            );

            return;

        }


        try {

            // ==================================
            // FORGOT PASSWORD API
            // ==================================

            const response =
                await fetch(
                     "http://localhost:5001/api/auth/forgot-password",
                    //"https://flipkart-clone-91e6.onrender.com/api/auth/forgot-password",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email:
                                    email

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to send OTP"
                );

                return;

            }


            // ==================================
            // SAVE EMAIL
            // ==================================

            localStorage.setItem(
                "resetEmail",
                email
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Password reset OTP sent 📧"
            );


            window.location.href =
                "reset-otp.html";


        } catch (error) {

            console.log(
                "Forgot password error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);