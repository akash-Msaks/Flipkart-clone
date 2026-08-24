// ==========================================
// OTP VERIFICATION
// ==========================================

const otpForm =
    document.getElementById("otpForm");

const otpInput =
    document.getElementById("otp");

const resendBtn =
    document.getElementById("resendBtn");

const otpEmail =
    document.getElementById("otpEmail");


// ==========================================
// GET USER INFORMATION
// ==========================================

const userId =
    localStorage.getItem("otpUserId");

const email =
    localStorage.getItem("otpEmail");


// ==========================================
// CHECK USER ID
// ==========================================

if (!userId || !email) {

    alert(
        "Verification session not found"
    );

    window.location.href =
        "signup.html";

}


// ==========================================
// DISPLAY EMAIL
// ==========================================

otpEmail.textContent =
    email;


// ==========================================
// ONLY ALLOW NUMBERS
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
// VERIFY OTP
// ==========================================

otpForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const otp =
            otpInput.value.trim();


        // ==================================
        // VALIDATION
        // ==================================

        if (
            otp.length !== 6
        ) {

            alert(
                "Please enter a valid 6-digit OTP"
            );

            return;

        }


        try {

            // ==================================
            // VERIFY API
            // ==================================

            const response =
                await fetch(
                    "http://https://flipkart-clone-91e6.onrender.com/api/auth/verify-email",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                userId:
                                    Number(userId),

                                otp:
                                    otp

                            })

                    }
                );


            const data =
                await response.json();


            // ==================================
            // VERIFICATION FAILED
            // ==================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "OTP verification failed"
                );

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Email verified successfully ✅"
            );


            // ==================================
            // REMOVE OTP DATA
            // ==================================

            localStorage.removeItem(
                "otpUserId"
            );

            localStorage.removeItem(
                "otpEmail"
            );


            // ==================================
            // GO TO LOGIN
            // ==================================

            window.location.href =
                "login.html";


        } catch (error) {

            console.log(
                "OTP verification error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);


// ==========================================
// RESEND OTP
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
                    "http://https://flipkart-clone-91e6.onrender.com/api/auth/resend-otp",
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

                resendBtn.disabled = false;

                resendBtn.textContent =
                    "Resend OTP";

                return;

            }


            alert(
                "New OTP sent 📧"
            );


            otpInput.value = "";


            // ==================================
            // 30 SECOND RESEND TIMER
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


                        if (
                            seconds <= 0
                        ) {

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