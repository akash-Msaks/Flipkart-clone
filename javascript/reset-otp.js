// ==========================================
// RESET OTP VERIFICATION
// ==========================================

const resetOtpForm =
    document.getElementById("resetOtpForm");

const otpInput =
    document.getElementById("otp");

const resetEmail =
    document.getElementById("resetEmail");

const resendBtn =
    document.getElementById("resendBtn");


// ==========================================
// GET EMAIL
// ==========================================

const email =
    localStorage.getItem("resetEmail");


// ==========================================
// CHECK EMAIL
// ==========================================

if (!email) {

    alert(
        "Password reset session not found"
    );

    window.location.href =
        "login.html";

}


// ==========================================
// DISPLAY EMAIL
// ==========================================

resetEmail.textContent =
    email;


// ==========================================
// ONLY NUMBERS
// ==========================================

otpInput.addEventListener(
    "input",
    function () {

        otpInput.value =
            otpInput.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// ==========================================
// VERIFY RESET OTP
// ==========================================

resetOtpForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const otp =
            otpInput.value.trim();


        if (otp.length !== 6) {

            alert(
                "Please enter a valid 6-digit OTP"
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "https://flipkart-clone-91e6.onrender.com/api/auth/verify-reset-otp",
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

                                otp:
                                    otp

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
                    "OTP verification failed"
                );

                return;

            }


            // ==================================
            // SAVE RESET TOKEN
            // ==================================

            localStorage.setItem(
                "resetToken",
                data.resetToken
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "OTP verified successfully ✅"
            );


            // ==================================
            // GO TO RESET PASSWORD
            // ==================================

            window.location.href =
                "reset-password.html";


        } catch (error) {

            console.log(
                "Reset OTP error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);


// ==========================================
// RESEND RESET OTP
// ==========================================

resendBtn.addEventListener(
    "click",
    async function () {

        try {

            resendBtn.disabled = true;

            resendBtn.textContent =
                "Sending...";


            const response =
                await fetch(
                    "https://flipkart-clone-91e6.onrender.com/api/auth/forgot-password",
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
                    "Unable to resend OTP"
                );

                resendBtn.disabled =
                    false;

                resendBtn.textContent =
                    "Resend OTP";

                return;

            }


            alert(
                "New OTP sent 📧"
            );


            otpInput.value = "";


            // ==================================
            // 30 SECOND TIMER
            // ==================================

            let seconds = 30;

            resendBtn.textContent =
                `Resend OTP (${seconds}s)`;


            const timer =
                setInterval(
                    function () {

                        seconds--;

                        resendBtn.textContent =
                            `Resend OTP (${seconds}s)`;


                        if (seconds <= 0) {

                            clearInterval(
                                timer
                            );

                            resendBtn.disabled =
                                false;

                            resendBtn.textContent =
                                "Resend OTP";

                        }

                    },
                    1000
                );


        } catch (error) {

            console.log(
                "Resend OTP error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );


            resendBtn.disabled =
                false;

            resendBtn.textContent =
                "Resend OTP";

        }

    }
);