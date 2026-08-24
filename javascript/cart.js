// ==========================================
// CART
// ==========================================

const cartItems =
    document.getElementById("cartItems");


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

}


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


        localStorage.removeItem(
            "token"
        );


        window.location.href =
            "login.html";


        return null;

    }


    return token;

}


// ==========================================
// LOAD CART FROM BACKEND
// ==========================================

async function loadCart() {

    try {

        const token =
            getToken();


        if (!token) {

            return;

        }


        const response =
            await fetch(
                `https://flipkart-clone-91e6.onrender.com/api/cart/${loggedUser.id}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const cart =
            await response.json();


        // ==================================
        // AUTHENTICATION ERROR
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


        // ==================================
        // AUTHORIZATION ERROR
        // ==================================

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
        // OTHER SERVER ERRORS
        // ==================================

        if (!response.ok) {

            throw new Error(
                cart.message ||
                "Unable to load cart"
            );

        }


        displayCart(cart);


    } catch (error) {

        console.log(
            "Load cart error:",
            error
        );


        cartItems.innerHTML =
            "<p>Unable to load cart</p>";

    }

}


// ==========================================
// DISPLAY CART
// ==========================================

function displayCart(cart) {

    cartItems.innerHTML = "";


    let totalItems = 0;

    let totalPrice = 0;


    // ======================================
    // EMPTY CART
    // ======================================

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <h2>
                Your cart is empty 🛒
            </h2>

        `;


        updatePriceDetails(
            0,
            0
        );


        return;

    }


    // ======================================
    // DISPLAY PRODUCTS
    // ======================================

    cart.forEach(
        function (product) {

            totalItems +=
                Number(
                    product.quantity
                );


            const price =
                Number(
                    product.price
                );


            totalPrice +=
                price *
                Number(
                    product.quantity
                );


            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "cart-card"
            );


            card.innerHTML = `

                <img
                    src="./images/${product.image}"
                    alt="${product.name}"
                >


                <div class="cart-details">

                    <h2>
                        ${product.name}
                    </h2>


                    <p class="cart-price">

                        ₹${price.toLocaleString(
                            "en-IN"
                        )}

                    </p>


                    <div class="quantity-box">


                        <button
                            class="minus-btn"
                            data-id="${product.id}"
                            data-quantity="${product.quantity}"
                        >
                            -
                        </button>


                        <span>
                            ${product.quantity}
                        </span>


                        <button
                            class="plus-btn"
                            data-id="${product.id}"
                            data-quantity="${product.quantity}"
                        >
                            +
                        </button>


                    </div>


                    <button
                        class="remove-btn"
                        data-id="${product.id}"
                    >
                        Remove
                    </button>


                </div>

            `;


            cartItems.appendChild(
                card
            );

        }
    );


    // ======================================
    // UPDATE PRICE
    // ======================================

    updatePriceDetails(
        totalItems,
        totalPrice
    );


    // ======================================
    // ADD BUTTON EVENTS
    // ======================================

    addCartButtonEvents();

}


// ==========================================
// PRICE DETAILS
// ==========================================

function updatePriceDetails(
    totalItems,
    totalPrice
) {


    const totalItemsElement =
        document.getElementById(
            "totalItems"
        );


    const totalPriceElement =
        document.getElementById(
            "totalPrice"
        );


    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    if (totalItemsElement) {

        totalItemsElement.textContent =
            totalItems;

    }


    if (totalPriceElement) {

        totalPriceElement.textContent =
            "₹" +
            totalPrice.toLocaleString(
                "en-IN"
            );

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            "₹" +
            totalPrice.toLocaleString(
                "en-IN"
            );

    }

}


// ==========================================
// BUTTON EVENTS
// ==========================================

function addCartButtonEvents() {


    // ======================================
    // PLUS
    // ======================================

    const plusButtons =
        document.querySelectorAll(
            ".plus-btn"
        );


    plusButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartId =
                        button.dataset.id;


                    const currentQuantity =
                        Number(
                            button.dataset.quantity
                        );


                    await updateQuantity(
                        cartId,
                        currentQuantity + 1
                    );

                }
            );

        }
    );


    // ======================================
    // MINUS
    // ======================================

    const minusButtons =
        document.querySelectorAll(
            ".minus-btn"
        );


    minusButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartId =
                        button.dataset.id;


                    const currentQuantity =
                        Number(
                            button.dataset.quantity
                        );


                    if (
                        currentQuantity <= 1
                    ) {

                        return;

                    }


                    await updateQuantity(
                        cartId,
                        currentQuantity - 1
                    );

                }
            );

        }
    );


    // ======================================
    // REMOVE
    // ======================================

    const removeButtons =
        document.querySelectorAll(
            ".remove-btn"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartId =
                        button.dataset.id;


                    await removeCartItem(
                        cartId
                    );

                }
            );

        }
    );

}


// ==========================================
// UPDATE QUANTITY
// ==========================================

async function updateQuantity(
    cartId,
    quantity
) {

    try {

        const token =
            getToken();


        if (!token) {

            return;

        }


        const response =
            await fetch(
                `https://flipkart-clone-91e6.onrender.com/api/cart/${cartId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            quantity:
                                quantity

                        })

                }
            );


        const data =
            await response.json();


        // ==================================
        // AUTHENTICATION ERROR
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


        // ==================================
        // AUTHORIZATION ERROR
        // ==================================

        if (
            response.status ===
            403
        ) {

            alert(
                data.message ||
                "You can only modify your own cart."
            );


            return;

        }


        // ==================================
        // OTHER ERROR
        // ==================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update cart"
            );

        }


        // ==================================
        // RELOAD CART
        // ==================================

        await loadCart();


    } catch (error) {

        console.log(
            "Update cart error:",
            error
        );


        alert(
            error.message ||
            "Unable to update quantity"
        );

    }

}


// ==========================================
// REMOVE CART ITEM
// ==========================================

async function removeCartItem(
    cartId
) {

    try {

        const token =
            getToken();


        if (!token) {

            return;

        }


        const response =
            await fetch(
                `https://flipkart-clone-91e6.onrender.com/api/cart/${cartId}`,
                {

                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        // ==================================
        // AUTHENTICATION ERROR
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


        // ==================================
        // AUTHORIZATION ERROR
        // ==================================

        if (
            response.status ===
            403
        ) {

            alert(
                data.message ||
                "You can only delete your own cart."
            );


            return;

        }


        // ==================================
        // OTHER ERROR
        // ==================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to remove item"
            );

        }


        // ==================================
        // RELOAD CART
        // ==================================

        await loadCart();


    } catch (error) {

        console.log(
            "Remove cart error:",
            error
        );


        alert(
            error.message ||
            "Unable to remove product"
        );

    }

}


// ==========================================
// START
// ==========================================

loadCart();