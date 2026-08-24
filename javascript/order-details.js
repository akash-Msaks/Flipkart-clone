// ==========================================
// GET LOGGED USER
// ==========================================

const loggedUser =
    JSON.parse(localStorage.getItem("loggedUser"));


// ==========================================
// GET ORDER DETAILS CONTAINER
// ==========================================

const orderDetails =
    document.getElementById("orderDetails");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!loggedUser) {

    alert("Please login first");

    window.location.href = "login.html";

}


// ==========================================
// GET ORDER ID FROM URL
// ==========================================

const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("id");


if (!orderId) {

    orderDetails.innerHTML = `
        <p>
            Order ID not found
        </p>
    `;

    throw new Error("Order ID missing");

}


// ==========================================
// LOAD ORDER DETAILS
// ==========================================

async function loadOrderDetails() {

    try {

        // ==============================
        // GET JWT TOKEN
        // ==============================

        const token =
            localStorage.getItem("token");


        // ==============================
        // CHECK TOKEN
        // ==============================

        if (!token) {

            throw new Error(
                "Access token required"
            );

        }


        // ==============================
        // API REQUEST
        // ==============================

        const response =
            await fetch(
                `https://flipkart-clone-91e6.onrender.com/api/orders/${loggedUser.id}/${orderId}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        // ==============================
        // RESPONSE
        // ==============================

        const orders =
            await response.json();


        if (!response.ok) {

            throw new Error(
                orders.message ||
                "Unable to load order"
            );

        }


        // ==============================
        // DISPLAY ORDER
        // ==============================

        displayOrderDetails(orders);


    } catch (error) {

        console.log(
            "Order details error:",
            error
        );


        orderDetails.innerHTML = `

            <div class="error-message">

                <h2>
                    Unable to load order
                </h2>

                <p>
                    ${error.message}
                </p>

                <a href="orders.html">
                    ← Back to Orders
                </a>

            </div>

        `;

    }

}
// ==========================================
// DISPLAY ORDER
// ==========================================

function displayOrderDetails(orders) {

    if (orders.length === 0) {

        orderDetails.innerHTML = `
            <h2>
                Order not found
            </h2>
        `;

        return;

    }


    // ======================================
    // ORDER INFORMATION
    // ======================================

    const order =
        orders[0];


    const orderDate =
        new Date(
            order.created_at
        ).toLocaleString();


    // ======================================
    // CREATE PRODUCTS HTML
    // ======================================

    let productsHTML = "";


    orders.forEach(function (product) {

        productsHTML += `

            <div class="detail-product">

                <img
                    src="./images/${product.product_image}"
                    alt="${product.product_name}"
                >


                <div class="detail-product-info">

                    <h2>
                        ${product.product_name}
                    </h2>


                    <p>
                        Price:
                        ₹${Number(
                            product.product_price
                        ).toLocaleString()}
                    </p>


                    <p>
                        Quantity:
                        ${product.quantity}
                    </p>


                    <p>
                        Product Total:
                        ₹${(
                            Number(product.product_price) *
                            product.quantity
                        ).toLocaleString()}
                    </p>

                </div>

            </div>

        `;

    });


    // ======================================
    // DISPLAY COMPLETE ORDER
    // ======================================

    orderDetails.innerHTML = `

        <div class="order-detail-card">


            <!-- ORDER HEADER -->

            <div class="detail-order-header">

                <div>

                    <h2>
                        Order #${order.order_id}
                    </h2>

                    <p>
                        Ordered on:
                        ${orderDate}
                    </p>

                </div>


                <span class="order-status">
                    ${order.status}
                </span>

            </div>


            <!-- PRODUCTS -->

            <div class="detail-products">

                <h2>
                    Products
                </h2>

                ${productsHTML}

            </div>


            <!-- PRICE -->

            <div class="detail-price">

                <h2>
                    Order Summary
                </h2>


                <p>

                    Total Amount:

                    <strong>
                        ₹${Number(
                            order.total_amount
                        ).toLocaleString()}
                    </strong>

                </p>

            </div>


            <!-- BACK BUTTON -->

            <a
                href="orders.html"
                class="back-orders-btn">

                ← Back to My Orders

            </a>


        </div>

    `;

}


// ==========================================
// START
// ==========================================

loadOrderDetails();