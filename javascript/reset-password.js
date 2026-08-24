// ==========================================
// RESET PASSWORD
// ==========================================

const resetPasswordForm =
    document.getElementById("resetPasswordForm");


// ==========================================
// GET RESET DATA
// ==========================================

const email =
    localStorage.getItem("resetEmail");

const resetToken =
    localStorage.getItem("resetToken");


// ==========================================
// CHECK RESET SESSION
// ==========================================

if (!email || !resetToken) {

    alert(
        "Password reset session has expired. Please try again."
    );

    window.location.href =
        "forgot-password.html";

}


// ==========================================
// SUBMIT RESET PASSWORD
// ==========================================

resetPasswordForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const newPassword =
            document
                .getElementById("newPassword")
                .value
                .trim();


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value
                .trim();


        // ==================================
        // PASSWORD MATCH
        // ==================================

        if (
            newPassword !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match"
            );

            return;

        }


        // ==================================
        // PASSWORD LENGTH
        // ==================================

        if (
            newPassword.length < 6
        ) {

            alert(
                "Password must contain at least 6 characters"
            );

            return;

        }


        try {

            // ==================================
            // RESET PASSWORD API
            // ==================================

            const response =
                await fetch(
                    "https://flipkart-clone-91e6.onrender.com/api/auth/reset-password",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email:
                                    email,

                                resetToken:
                                    resetToken,

                                newPassword:
                                    newPassword

                            })

                    }
                );


            const data =
                await response.json();


            // ==================================
            // FAILED
            // ==================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to reset password"
                );

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Password reset successfully ✅"
            );


            // ==================================
            // REMOVE RESET DATA
            // ==================================

            localStorage.removeItem(
                "resetEmail"
            );

            localStorage.removeItem(
                "resetToken"
            );


            // ==================================
            // GO TO LOGIN
            // ==================================

            window.location.href =
                "login.html";

        } catch (error) {

            console.log(
                "Reset password error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);