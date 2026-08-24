// ==========================================
// CUSTOMER CHECKOUT + RAZORPAY PAYMENT
// ==========================================


// ==========================================
// GET LOGGED USER
// ==========================================

const loggedUser =
    JSON.parse(
        localStorage.getItem("loggedUser")
    );


// ==========================================
// CHECK LOGIN
// ==========================================

if (!loggedUser) {

    alert("Please login first");

    window.location.href =
        "login.html";

    throw new Error(
        "User not logged in"
    );

}


// ==========================================
// API BASE URL
// ==========================================

const API_BASE =
    "http://https://flipkart-clone-91e6.onrender.com";


// ==========================================
// GET JWT TOKEN
// ==========================================

function getToken() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert(
            "Your login session has expired. Please login again."
        );

        localStorage.removeItem(
            "loggedUser"
        );

        window.location.href =
            "login.html";

        return null;

    }

    return token;

}


// ==========================================
// CHECKOUT TOTALS
// ==========================================

let checkoutTotal = 0;

let checkoutItemCount = 0;


// ==========================================
// LOAD CART SUMMARY
// ==========================================

async function loadCheckout() {

    try {

        const token =
            getToken();

        if (!token) {
            return;
        }


        // ==================================
        // GET USER CART
        // ==================================

        const response =
            await fetch(
                `${API_BASE}/api/cart/${loggedUser.id}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const cart =
            await response.json();


        // ==================================
        // AUTHORIZATION ERROR
        // ==================================

        if (
            response.status ===
            401
        ) {

            alert(
                "Your login session has expired. Please login again."
            );

            localStorage.removeItem(
                "loggedUser"
            );

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (
            response.status ===
            403
        ) {

            alert(
                "You can access only your own cart."
            );

            window.location.href =
                "index.html";

            return;

        }


        // ==================================
        // OTHER ERRORS
        // ==================================

        if (!response.ok) {

            throw new Error(
                cart.message ||
                "Unable to load cart"
            );

        }


        // ==================================
        // EMPTY CART
        // ==================================

        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            alert(
                "Your cart is empty"
            );

            window.location.href =
                "index.html";

            return;

        }


        // ==================================
        // CALCULATE TOTALS
        // ==================================

        checkoutItemCount = 0;

        checkoutTotal = 0;


        cart.forEach(
            function (product) {

                checkoutItemCount +=
                    Number(
                        product.quantity
                    );


                checkoutTotal +=
                    Number(
                        product.price
                    ) *
                    Number(
                        product.quantity
                    );

            }
        );


        // ==================================
        // DISPLAY TOTAL ITEMS
        // ==================================

        const checkoutItems =
            document.getElementById(
                "checkoutItems"
            );


        if (checkoutItems) {

            checkoutItems.textContent =
                checkoutItemCount;

        }


        // ==================================
        // DISPLAY TOTAL PRICE
        // ==================================

        const checkoutPrice =
            document.getElementById(
                "checkoutPrice"
            );


        if (checkoutPrice) {

            checkoutPrice.textContent =
                "₹" +
                checkoutTotal.toLocaleString(
                    "en-IN"
                );

        }


    } catch (error) {

        console.log(
            "Checkout load error:",
            error
        );


        alert(
            error.message ||
            "Unable to load checkout details"
        );

    }

}


// ==========================================
// GET DELIVERY DETAILS
// ==========================================

function getDeliveryDetails() {

    const fullName =
        document.getElementById(
            "fullName"
        ).value.trim();


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    const address =
        document.getElementById(
            "address"
        ).value.trim();


    const city =
        document.getElementById(
            "city"
        ).value.trim();


    const state =
        document.getElementById(
            "state"
        ).value.trim();


    const pincode =
        document.getElementById(
            "pincode"
        ).value.trim();


    // ======================================
    // EMPTY VALIDATION
    // ======================================

    if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        alert(
            "Please fill all delivery details"
        );

        return null;

    }


    // ======================================
    // PHONE VALIDATION
    // ======================================

    if (
        !/^[6-9]\d{9}$/.test(
            phone
        )
    ) {

        alert(
            "Please enter a valid 10-digit phone number"
        );

        return null;

    }


    // ======================================
    // PINCODE VALIDATION
    // ======================================

    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        alert(
            "Please enter a valid 6-digit pincode"
        );

        return null;

    }


    return {

        fullName:
            fullName,

        phone:
            phone,

        address:
            address,

        city:
            city,

        state:
            state,

        pincode:
            pincode

    };

}


// ==========================================
// GET PAYMENT METHOD
// ==========================================

function getPaymentMethod() {

    const selectedPayment =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    if (!selectedPayment) {

        alert(
            "Please select a payment method"
        );

        return null;

    }


    return selectedPayment.value;

}


// ==========================================
// BUTTON LOADING
// ==========================================

function setButtonLoading(
    loading
) {

    const payNowBtn =
        document.getElementById(
            "payNowBtn"
        );


    if (!payNowBtn) {

        return;

    }


    if (loading) {

        payNowBtn.disabled =
            true;

        payNowBtn.textContent =
            "Processing...";

    } else {

        payNowBtn.disabled =
            false;

        payNowBtn.textContent =
            "PAY NOW";

    }

}


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

async function createRazorpayOrder(
    paymentMethod,
    address
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Login session expired. Please login again."
        );

    }


    const response =
        await fetch(
            `${API_BASE}/api/payment/create-order`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify({

                        payment_method:
                            paymentMethod,

                        address:
                            address

                    })

            }
        );


    const data =
        await response.json();


    if (
        response.status ===
        401
    ) {

        throw new Error(
            "Your login session has expired. Please login again."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to create payment order"
        );

    }


    return data;

}


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

async function verifyPayment(
    paymentResponse,
    paymentMethod,
    address
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Login session expired. Please login again."
        );

    }


    const response =
        await fetch(
            `${API_BASE}/api/payment/verify`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify({

                        razorpay_payment_id:
                            paymentResponse.razorpay_payment_id,

                        razorpay_order_id:
                            paymentResponse.razorpay_order_id,

                        razorpay_signature:
                            paymentResponse.razorpay_signature,

                        payment_method:
                            paymentMethod,

                        address:
                            address

                    })

            }
        );


    const data =
        await response.json();


    if (
        response.status ===
        401
    ) {

        throw new Error(
            "Your login session has expired. Please login again."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Payment verification failed"
        );

    }


    return data;

}


// ==========================================
// OPEN RAZORPAY CHECKOUT
// ==========================================

function openRazorpayCheckout(
    razorpayOrder,
    paymentMethod,
    address
) {

    // ======================================
    // CHECK RAZORPAY SCRIPT
    // ======================================

    if (
        typeof Razorpay ===
        "undefined"
    ) {

        throw new Error(
            "Razorpay checkout script is not loaded. Add the Razorpay script to checkout.html."
        );

    }


    // ======================================
    // RAZORPAY OPTIONS
    // ======================================

    const options = {

        key:
            razorpayOrder.key_id,

        amount:
            razorpayOrder.amount,

        currency:
            razorpayOrder.currency,

        name:
            "Flipkart Clone",

        description:
            "Flipkart Clone Order",

        order_id:
            razorpayOrder.razorpay_order_id,


        // ==================================
        // CUSTOMER INFORMATION
        // ==================================

        prefill: {

            name:
                address.fullName,

            contact:
                "+91" +
                address.phone,

            email:
                loggedUser.email

        },


        // ==================================
        // EXTRA INFORMATION
        // ==================================

        notes: {

            customer_id:
                String(
                    loggedUser.id
                ),

            payment_method:
                paymentMethod

        },


        // ==================================
        // THEME
        // ==================================

        theme: {

            color:
                "#2874f0"

        },


        // ==================================
        // MODAL
        // ==================================

        modal: {

            confirm_close:
                true,

            escape:
                false,

            backdropclose:
                false

        },


        // ==================================
        // PAYMENT SUCCESS
        // ==================================

        handler:
            async function (
                paymentResponse
            ) {

                try {

                    console.log(
                        "Razorpay payment response:",
                        paymentResponse
                    );


                    const result =
                        await verifyPayment(
                            paymentResponse,
                            paymentMethod,
                            address
                        );


                    alert(
                        "Payment successful and order placed! 🎉"
                    );


                    console.log(
                        "Order ID:",
                        result.orderId
                    );


                    console.log(
                        "Payment ID:",
                        result.paymentId
                    );


                    window.location.href =
                        "orders.html";


                } catch (error) {

                    console.log(
                        "Payment verification error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Payment verification failed"
                    );


                    setButtonLoading(
                        false
                    );

                }

            }

    };


    // ======================================
    // CREATE RAZORPAY INSTANCE
    // ======================================

    const razorpay =
        new Razorpay(
            options
        );


    // ======================================
    // PAYMENT FAILED
    // ======================================

    razorpay.on(
        "payment.failed",
        function (
            response
        ) {

            console.log(
                "Payment failed:",
                response
            );


            let message =
                "Payment failed. Please try again.";


            if (
                response &&
                response.error &&
                response.error.description
            ) {

                message =
                    response.error.description;

            }


            alert(
                message
            );


            setButtonLoading(
                false
            );

        }
    );


    // ======================================
    // OPEN PAYMENT WINDOW
    // ======================================

    razorpay.open();

}


// ==========================================
// PLACE COD ORDER
// ==========================================

async function placeCODOrder(
    address
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Login session expired. Please login again."
        );

    }


    const response =
        await fetch(
            `${API_BASE}/api/payment/cod`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify({

                        address:
                            address

                    })

            }
        );


    const data =
        await response.json();


    if (
        response.status ===
        401
    ) {

        throw new Error(
            "Your login session has expired. Please login again."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to place COD order"
        );

    }


    return data;

}


// ==========================================
// PAY NOW BUTTON
// ==========================================

const payNowBtn =
    document.getElementById(
        "payNowBtn"
    );


if (payNowBtn) {

    payNowBtn.addEventListener(
        "click",
        async function () {

            // ==================================
            // GET ADDRESS
            // ==================================

            const address =
                getDeliveryDetails();


            if (!address) {

                return;

            }


            // ==================================
            // GET PAYMENT METHOD
            // ==================================

            const paymentMethod =
                getPaymentMethod();


            if (!paymentMethod) {

                return;

            }


            try {

                setButtonLoading(
                    true
                );


                // ==================================
                // COD
                // ==================================

                if (
                    paymentMethod ===
                    "COD"
                ) {

                    const result =
                        await placeCODOrder(
                            address
                        );


                    alert(
                        "Order placed successfully! 🎉"
                    );


                    console.log(
                        "COD Order ID:",
                        result.orderId
                    );


                    window.location.href =
                        "orders.html";


                    return;

                }


                // ==================================
                // ONLINE PAYMENT
                // ==================================

                const razorpayOrder =
                    await createRazorpayOrder(
                        paymentMethod,
                        address
                    );


                console.log(
                    "Razorpay order:",
                    razorpayOrder
                );


                // ==================================
                // OPEN RAZORPAY
                // ==================================

                openRazorpayCheckout(
                    razorpayOrder,
                    paymentMethod,
                    address
                );


            } catch (error) {

                console.log(
                    "Payment error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to start payment"
                );


                setButtonLoading(
                    false
                );

            }

        }
    );

}


// ==========================================
// START CHECKOUT
// ==========================================

loadCheckout();