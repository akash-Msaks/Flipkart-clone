// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        // ===============================
        // GET FORM VALUES
        // ===============================

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


        // ===============================
        // VALIDATION
        // ===============================

        if (!email || !password) {

            alert(
                "Please enter email and password"
            );

            return;

        }


        try {

            // ===============================
            // LOGIN API
            // ===============================

            const response =
                await fetch(
                    "http://localhost:5001/api/auth/login",
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

                                password:
                                    password

                            })

                    }
                );


            // ===============================
            // RESPONSE
            // ===============================

            const data =
                await response.json();


            // ===============================
            // LOGIN SUCCESS
            // ===============================

            if (response.ok) {


                // ===========================
                // SAVE JWT TOKEN
                // ===========================

                localStorage.setItem(
                    "token",
                    data.token
                );


                // ===========================
                // SAVE LOGGED USER
                // ===========================

                localStorage.setItem(
                    "loggedUser",
                    JSON.stringify(
                        data.user
                    )
                );


                alert(
                    "Login Successful ✅"
                );


                // ===========================
                // ROLE BASED REDIRECTION
                // ===========================

                if (
                    data.user.role === "ADMIN"
                ) {

                    // ADMIN
                    window.location.href =
                        "admin.html";

                } 
                else if (data.user.role === "DELIVERY_PARTNER") {

    window.location.href = "delivery.html";

}
                else {

                    // CUSTOMER
                    window.location.href =
                        "index.html";

                }


            } else {

                alert(
                    data.message ||
                    "Invalid email or password"
                );

            }


        } catch (error) {

            console.log(
                "Login error:",
                error
            );


            alert(
                "Unable to connect to server ❌"
            );

        }

    }
);