// ==========================================
// CUSTOMER ORDERS PAGE
// ==========================================


// ==========================================
// GET LOGGED USER
// ==========================================

const loggedUser =
    JSON.parse(
        localStorage.getItem("loggedUser")
    );


// ==========================================
// ORDERS CONTAINER
// ==========================================

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );


// ==========================================
// CHECK LOGIN
// ==========================================

if (!loggedUser) {

    alert(
        "Please login first"
    );

    window.location.href =
        "login.html";

    throw new Error(
        "User not logged in"
    );

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
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    try {

        const token =
            getToken();


        if (!token) {

            return;

        }


        const response =
            await fetch(
                `https://flipkart-clone-91e6.onrender.com/api/orders/${loggedUser.id}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const orders =
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
                orders.message ||
                "You can access only your own orders."
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
                orders.message ||
                "Unable to load orders"
            );

        }


        displayOrders(
            orders
        );


    } catch (error) {

        console.log(
            "Load orders error:",
            error
        );


        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <h2>
                    Unable to load your orders
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// ==========================================
// GROUP ORDERS
// ==========================================

function groupOrders(
    orders
) {

    const groupedOrders = {};


    orders.forEach(
        function (order) {

            if (
                !groupedOrders[
                    order.order_id
                ]
            ) {

                groupedOrders[
                    order.order_id
                ] = {

                    order_id:
                        order.order_id,

                    total_amount:
                        order.total_amount,

                    status:
                        order.status,

                    created_at:
                        order.created_at,

                    products: []

                };

            }


            groupedOrders[
                order.order_id
            ].products.push({

                name:
                    order.product_name,

                price:
                    order.product_price,

                image:
                    order.product_image,

                quantity:
                    order.quantity

            });

        }
    );


    return Object.values(
        groupedOrders
    );

}


// ==========================================
// GET STATUS STEP
// ==========================================

function getStatusStep(
    status
) {

    const steps = {

        PLACED: 1,

        CONFIRMED: 2,

        PACKED: 3,

        ACCEPTED: 4,

        PICKED_UP: 5,

        OUT_FOR_DELIVERY: 6,

        DELIVERED: 7

    };


    return (
        steps[status] || 1
    );

}


// ==========================================
// STATUS TEXT
// ==========================================

function formatStatus(
    status
) {

    const statusNames = {

        PLACED:
            "Order Placed",

        CONFIRMED:
            "Confirmed",

        PACKED:
            "Packed",

        ACCEPTED:
            "Accepted by Delivery Partner",

        PICKED_UP:
            "Picked Up",

        OUT_FOR_DELIVERY:
            "Out for Delivery",

        DELIVERED:
            "Delivered",

        CANCELLED:
            "Cancelled"

    };


    return (
        statusNames[status] ||
        status
    );

}


// ==========================================
// CREATE TRACKING HTML
// ==========================================

function createTrackingHTML(
    status
) {

    // ======================================
    // CANCELLED
    // ======================================

    if (
        status ===
        "CANCELLED"
    ) {

        return `

            <div class="order-tracking cancelled-tracking">

                <h3>
                    Order Tracking
                </h3>


                <div class="tracking-cancelled">

                    ❌ Order Cancelled

                </div>

            </div>

        `;

    }


    const currentStep =
        getStatusStep(
            status
        );


    const steps = [

        {
            key:
                "PLACED",

            label:
                "Order Placed",

            icon:
                "🛒"

        },

        {
            key:
                "CONFIRMED",

            label:
                "Confirmed",

            icon:
                "✅"

        },

        {
            key:
                "PACKED",

            label:
                "Packed",

            icon:
                "📦"

        },

        {
            key:
                "ACCEPTED",

            label:
                "Accepted",

            icon:
                "🚴"

        },

        {
            key:
                "PICKED_UP",

            label:
                "Picked Up",

            icon:
                "📦"

        },

        {
            key:
                "OUT_FOR_DELIVERY",

            label:
                "Out for Delivery",

            icon:
                "🚴"

        },

        {
            key:
                "DELIVERED",

            label:
                "Delivered",

            icon:
                "🏠"

        }

    ];


    let trackingHTML = `

        <div class="order-tracking">

            <h3>
                Order Tracking
            </h3>


            <div class="tracking-steps">

    `;


    steps.forEach(
        function (
            step,
            index
        ) {

            const stepNumber =
                index + 1;


            let stepClass =
                "";


            // ==================================
            // COMPLETED
            // ==================================

            if (
                stepNumber <
                currentStep
            ) {

                stepClass =
                    "completed";

            }


            // ==================================
            // CURRENT
            // ==================================

            else if (
                stepNumber ===
                currentStep
            ) {

                stepClass =
                    "current";

            }


            // ==================================
            // FUTURE
            // ==================================

            else {

                stepClass =
                    "pending";

            }


            trackingHTML += `

                <div
                    class="tracking-step ${stepClass}"
                >

                    <div
                        class="tracking-icon"
                    >

                        ${
                            stepNumber <
                            currentStep
                                ? "✓"
                                : step.icon
                        }

                    </div>


                    <div
                        class="tracking-label"
                    >

                        ${step.label}

                    </div>

                </div>

            `;


            // ==================================
            // CONNECTOR
            // ==================================

            if (
                index <
                steps.length - 1
            ) {

                trackingHTML += `

                    <div
                        class="
                            tracking-line
                            ${
                                stepNumber <
                                currentStep
                                    ? "completed"
                                    : ""
                            }
                        "
                    ></div>

                `;

            }

        }
    );


    trackingHTML += `

            </div>

        </div>

    `;


    return trackingHTML;

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(
    orders
) {

    ordersContainer.innerHTML =
        "";


    // ======================================
    // EMPTY ORDERS
    // ======================================

    if (
        !orders ||
        orders.length === 0
    ) {

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <h2>
                    You haven't placed any orders yet 🛍️
                </h2>


                <a href="index.html">
                    Start Shopping
                </a>

            </div>

        `;

        return;

    }


    // ======================================
    // GROUP PRODUCTS
    // ======================================

    const groupedOrders =
        groupOrders(
            orders
        );


    // ======================================
    // DISPLAY EACH ORDER
    // ======================================

    groupedOrders.forEach(
        function (order) {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.classList.add(
                "order-card"
            );


            // ==================================
            // ORDER DATE
            // ==================================

            const orderDate =
                new Date(
                    order.created_at
                ).toLocaleString();


            // ==================================
            // PRODUCT HTML
            // ==================================

            let productsHTML =
                "";


            order.products.forEach(
                function (product) {

                    productsHTML += `

                        <div
                            class="order-product"
                        >

                            <img
                                src="./images/${product.image}"
                                alt="${product.name}"
                            >


                            <div
                                class="order-product-details"
                            >

                                <h3>
                                    ${product.name}
                                </h3>


                                <p>

                                    Price:
                                    ₹${Number(
                                        product.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </p>


                                <p>

                                    Quantity:
                                    ${product.quantity}

                                </p>

                            </div>

                        </div>

                    `;

                }
            );


            // ==================================
            // STATUS CLASS
            // ==================================

            const statusClass =
                order.status ===
                "CANCELLED"

                    ? "cancelled-status"

                    : String(
                        order.status
                    ).toLowerCase();


            // ==================================
            // TRACKING
            // ==================================

            const trackingHTML =
                createTrackingHTML(
                    order.status
                );


            // ==================================
            // CANCEL BUTTON
            // ==================================

            const cancelButton =
                order.status ===
                "PLACED"

                    ? `

                        <button
                            class="cancel-order-btn"
                            data-id="${order.order_id}"
                        >

                            Cancel Order

                        </button>

                    `

                    : "";


            // ==================================
            // COMPLETE CARD
            // ==================================

            orderCard.innerHTML = `

                <div
                    class="order-header"
                >

                    <h2>
                        Order #${order.order_id}
                    </h2>


                    <span
                        class="
                            order-status
                            ${statusClass}
                        "
                    >

                        ${formatStatus(
                            order.status
                        )}

                    </span>

                </div>


                <div
                    class="order-products"
                >

                    ${productsHTML}

                </div>


                <div
                    class="order-footer"
                >

                    <p>

                        <strong>
                            Total:
                        </strong>

                        ₹${Number(
                            order.total_amount
                        ).toLocaleString(
                            "en-IN"
                        )}

                    </p>


                    <p>

                        <strong>
                            Ordered on:
                        </strong>

                        ${orderDate}

                    </p>

                </div>


                ${trackingHTML}


                <div
                    class="order-actions"
                >

                    <button
                        class="view-order-btn"
                        data-id="${order.order_id}"
                    >

                        View Details

                    </button>


                    ${cancelButton}

                </div>

            `;


            ordersContainer.appendChild(
                orderCard
            );

        }
    );


    // ======================================
    // VIEW DETAILS
    // ======================================

    const viewButtons =
        document.querySelectorAll(
            ".view-order-btn"
        );


    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const orderId =
                        button.dataset.id;


                    window.location.href =
                        `order-details.html?id=${orderId}`;

                }
            );

        }
    );


    // ======================================
    // CANCEL ORDER
    // ======================================

    const cancelButtons =
        document.querySelectorAll(
            ".cancel-order-btn"
        );


    cancelButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const orderId =
                        button.dataset.id;


                    const confirmCancel =
                        confirm(
                            "Are you sure you want to cancel this order?"
                        );


                    if (
                        !confirmCancel
                    ) {

                        return;

                    }


                    try {

                        // ==================================
                        // GET JWT
                        // ==================================

                        const token =
                            getToken();


                        if (!token) {

                            return;

                        }


                        const response =
                            await fetch(
                                `https://flipkart-clone-91e6.onrender.com/api/orders/${loggedUser.id}/${orderId}/cancel`,
                                {

                                    method:
                                        "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        // 🔐 JWT TOKEN
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
                                "You can only cancel your own orders."
                            );


                            return;

                        }


                        // ==================================
                        // OTHER ERRORS
                        // ==================================

                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                data.message ||
                                "Unable to cancel order"
                            );

                        }


                        // ==================================
                        // SUCCESS
                        // ==================================

                        alert(
                            "Order cancelled successfully ✅"
                        );


                        loadOrders();


                    } catch (
                        error
                    ) {

                        console.log(
                            "Cancel order error:",
                            error
                        );


                        alert(
                            error.message ||
                            "Unable to cancel order"
                        );

                    }

                }
            );

        }
    );

}


// ==========================================
// AUTO REFRESH
// ==========================================

// Refresh every 10 seconds so the customer
// can see rider/order status changes.

setInterval(
    loadOrders,
    10000
);


// ==========================================
// START
// ==========================================

loadOrders();