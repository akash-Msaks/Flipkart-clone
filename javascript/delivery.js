// ==========================================
// DELIVERY PARTNER DASHBOARD
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
// CHECK DELIVERY PARTNER ROLE
// ==========================================

if (
    loggedUser.role !==
    "DELIVERY_PARTNER"
) {

    alert(
        "Access denied. Delivery partners only."
    );

    window.location.href =
        "index.html";

    throw new Error(
        "User is not a delivery partner"
    );

}


// ==========================================
// API
// ==========================================

const DELIVERY_ORDERS_API =
    "https://flipkart-clone-91e6.onrender.com/api/delivery/orders";


const DELIVERY_STATUS_API =
    "https://flipkart-clone-91e6.onrender.com/api/delivery/orders";


// ==========================================
// ELEMENTS
// ==========================================

const deliveryPartnerName =
    document.getElementById(
        "deliveryPartnerName"
    );


const partnerStatus =
    document.getElementById(
        "partnerStatus"
    );


const assignedOrders =
    document.getElementById(
        "assignedOrders"
    );


const activeOrders =
    document.getElementById(
        "activeOrders"
    );


const deliveredOrders =
    document.getElementById(
        "deliveredOrders"
    );


const deliveryOrdersContainer =
    document.getElementById(
        "deliveryOrdersContainer"
    );


// ==========================================
// DISPLAY PARTNER NAME
// ==========================================

if (deliveryPartnerName) {

    deliveryPartnerName.textContent =
        loggedUser.name;

}


// ==========================================
// LOAD MY ORDERS
// ==========================================

async function loadMyOrders() {

    try {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        if (deliveryOrdersContainer) {

            deliveryOrdersContainer.innerHTML = `

                <p>
                    Loading orders...
                </p>

            `;

        }


        const response =
            await fetch(
                DELIVERY_ORDERS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load orders"
            );

        }


        // ==================================
        // PARTNER STATUS
        // ==================================

        if (partnerStatus) {

            partnerStatus.textContent =
                data.partner.status;


            partnerStatus.className =
                "partner-status " +
                String(
                    data.partner.status
                ).toLowerCase();

        }


        // ==================================
        // DISPLAY ORDERS
        // ==================================

        displayOrders(
            data.orders
        );


    } catch (error) {

        console.log(
            "Delivery orders error:",
            error
        );


        if (deliveryOrdersContainer) {

            deliveryOrdersContainer.innerHTML = `

                <div class="delivery-error">

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    }

}


// ==========================================
// GROUP ORDERS
// ==========================================

function groupOrders(orders) {

    const grouped = {};


    orders.forEach(
        function (order) {

            if (
                !grouped[
                    order.order_id
                ]
            ) {

                grouped[
                    order.order_id
                ] = {

                    order_id:
                        order.order_id,

                    user_id:
                        order.user_id,

                    customer_name:
                        order.customer_name,

                    customer_email:
                        order.customer_email,

                    total_amount:
                        order.total_amount,

                    status:
                        order.status,

                    created_at:
                        order.created_at,

                    products: []

                };

            }


            grouped[
                order.order_id
            ].products.push({

                product_id:
                    order.product_id,

                product_name:
                    order.product_name,

                product_image:
                    order.product_image,

                quantity:
                    order.quantity,

                price:
                    order.order_item_price

            });

        }
    );


    return Object.values(
        grouped
    );

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

    if (!deliveryOrdersContainer) {

        return;

    }


    deliveryOrdersContainer.innerHTML =
        "";


    // ======================================
    // NO ORDERS
    // ======================================

    if (
        !orders ||
        orders.length === 0
    ) {

        deliveryOrdersContainer.innerHTML = `

            <div class="delivery-empty">

                <h3>
                    No orders assigned
                </h3>

                <p>
                    You currently have no delivery orders.
                </p>

            </div>

        `;


        updateStats([]);

        return;

    }


    // ======================================
    // GROUP
    // ======================================

    const groupedOrders =
        groupOrders(orders);


    // ======================================
    // UPDATE STATS
    // ======================================

    updateStats(
        groupedOrders
    );


    // ======================================
    // CREATE ORDER CARDS
    // ======================================

    groupedOrders.forEach(
        function (order) {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.classList.add(
                "delivery-order-card"
            );


            // ==================================
            // PRODUCTS
            // ==================================

            let productsHTML = "";


            order.products.forEach(
                function (product) {

                    const productTotal =
                        Number(
                            product.price
                        ) *
                        Number(
                            product.quantity
                        );


                    productsHTML += `

                        <div
                            class="delivery-product"
                        >

                            <img
                                src="./images/${product.product_image}"
                                alt="${product.product_name}"
                            >


                            <div>

                                <h4>
                                    ${product.product_name}
                                </h4>


                                <p>
                                    Quantity:
                                    ${product.quantity}
                                </p>


                                <p>
                                    Price:
                                    ₹${Number(
                                        product.price
                                    ).toLocaleString()}
                                </p>


                                <p>
                                    Total:
                                    ₹${productTotal.toLocaleString()}
                                </p>

                            </div>

                        </div>

                    `;

                }
            );


            // ==================================
            // ACTION BUTTON
            // ==================================

            const actionButton =
                getActionButton(
                    order.status
                );


            // ==================================
            // ORDER CARD
            // ==================================

            orderCard.innerHTML = `

                <div
                    class="delivery-order-header"
                >

                    <div>

                        <h3>
                            Order #${order.order_id}
                        </h3>


                        <p>
                            Customer:
                            ${order.customer_name}
                        </p>

                    </div>


                    <span
                        class="delivery-order-status ${String(
                            order.status
                        ).toLowerCase()}"
                    >

                        ${formatStatus(
                            order.status
                        )}

                    </span>

                </div>


                <div
                    class="delivery-customer"
                >

                    <p>

                        <strong>
                            Customer:
                        </strong>

                        ${order.customer_name}

                    </p>


                    <p>

                        <strong>
                            Email:
                        </strong>

                        ${order.customer_email}

                    </p>


                    <p>

                        <strong>
                            Order ID:
                        </strong>

                        #${order.order_id}

                    </p>

                </div>


                <div
                    class="delivery-products"
                >

                    <h3>
                        Products
                    </h3>


                    ${productsHTML}

                </div>


                <div
                    class="delivery-order-footer"
                >

                    <strong>

                        Total:
                        ₹${Number(
                            order.total_amount
                        ).toLocaleString()}

                    </strong>


                    <div
                        class="delivery-order-action"
                    >

                        ${actionButton}

                    </div>

                </div>

            `;


            deliveryOrdersContainer.appendChild(
                orderCard
            );


            // ==================================
            // ADD ACTION EVENT
            // ==================================

            const statusButton =
                orderCard.querySelector(
                    ".delivery-status-btn"
                );


            if (statusButton) {

                statusButton.addEventListener(
                    "click",
                    function () {

                        handleStatusUpdate(
                            order.order_id,
                            order.status
                        );

                    }
                );

            }

        }
    );

}


// ==========================================
// GET ACTION BUTTON
// ==========================================

function getActionButton(
    status
) {

    // ======================================
    // PACKED
    // ======================================

    if (
        status ===
        "PACKED"
    ) {

        return `

            <button
                class="delivery-status-btn accept-order-btn"
            >

                Accept Order

            </button>

        `;

    }


    // ======================================
    // ACCEPTED
    // ======================================

    if (
        status ===
        "ACCEPTED"
    ) {

        return `

            <button
                class="delivery-status-btn pickup-order-btn"
            >

                Pick Up Order

            </button>

        `;

    }


    // ======================================
    // PICKED UP
    // ======================================

    if (
        status ===
        "PICKED_UP"
    ) {

        return `

            <button
                class="delivery-status-btn out-delivery-btn"
            >

                Out for Delivery

            </button>

        `;

    }


    // ======================================
    // OUT FOR DELIVERY
    // ======================================

    if (
        status ===
        "OUT_FOR_DELIVERY"
    ) {

        return `

            <button
                class="delivery-status-btn delivered-order-btn"
            >

                Mark Delivered

            </button>

        `;

    }


    // ======================================
    // DELIVERED
    // ======================================

    if (
        status ===
        "DELIVERED"
    ) {

        return `

            <span
                class="delivery-completed"
            >

                ✅ Delivered

            </span>

        `;

    }


    return "";

}


// ==========================================
// GET NEXT STATUS
// ==========================================

function getNextStatus(
    currentStatus
) {

    if (
        currentStatus ===
        "PACKED"
    ) {

        return "ACCEPTED";

    }


    if (
        currentStatus ===
        "ACCEPTED"
    ) {

        return "PICKED_UP";

    }


    if (
        currentStatus ===
        "PICKED_UP"
    ) {

        return "OUT_FOR_DELIVERY";

    }


    if (
        currentStatus ===
        "OUT_FOR_DELIVERY"
    ) {

        return "DELIVERED";

    }


    return null;

}


// ==========================================
// HANDLE STATUS UPDATE
// ==========================================

async function handleStatusUpdate(
    orderId,
    currentStatus
) {

    const nextStatus =
        getNextStatus(
            currentStatus
        );


    if (!nextStatus) {

        return;

    }


    // ======================================
    // CONFIRM ACTION
    // ======================================

    const confirmed =
        confirm(
            `Change Order #${orderId} status from ${formatStatus(currentStatus)} to ${formatStatus(nextStatus)}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        // ==================================
        // API REQUEST
        // ==================================

        const response =
            await fetch(
                `${DELIVERY_STATUS_API}/${orderId}/status`,
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

                            status:
                                nextStatus

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update order status"
            );

        }


        // ==================================
        // SUCCESS
        // ==================================

        alert(
            `Order #${orderId} updated to ${formatStatus(nextStatus)} ✅`
        );


        // Reload orders
        loadMyOrders();


    } catch (error) {

        console.log(
            "Status update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update order status"
        );

    }

}


// ==========================================
// FORMAT STATUS
// ==========================================

function formatStatus(
    status
) {

    if (
        status ===
        "OUT_FOR_DELIVERY"
    ) {

        return "OUT FOR DELIVERY";

    }


    if (
        status ===
        "PICKED_UP"
    ) {

        return "PICKED UP";

    }


    if (
        status ===
        "ACCEPTED"
    ) {

        return "ACCEPTED";

    }


    if (
        status ===
        "PACKED"
    ) {

        return "PACKED";

    }


    if (
        status ===
        "DELIVERED"
    ) {

        return "DELIVERED";

    }


    return status;

}


// ==========================================
// UPDATE DASHBOARD STATS
// ==========================================

function updateStats(
    orders
) {

    let assigned = 0;

    let active = 0;

    let delivered = 0;


    orders.forEach(
        function (order) {

            const status =
                String(
                    order.status
                ).toUpperCase();


            // ==================================
            // ASSIGNED
            // ==================================
            // Order has been assigned to rider
            // but rider has NOT accepted yet.
            //
            // PACKED = waiting for acceptance
            // ==================================

            if (
                status ===
                "PACKED"
            ) {

                assigned++;

            }


            // ==================================
            // ACTIVE
            // ==================================
            // Rider has accepted the order
            // and delivery is in progress.
            // ==================================

            if (
                status ===
                    "ACCEPTED" ||

                status ===
                    "PICKED_UP" ||

                status ===
                    "OUT_FOR_DELIVERY"
            ) {

                active++;

            }


            // ==================================
            // DELIVERED
            // ==================================

            if (
                status ===
                "DELIVERED"
            ) {

                delivered++;

            }

        }
    );


    // ======================================
    // UPDATE HTML
    // ======================================

    if (assignedOrders) {

        assignedOrders.textContent =
            assigned;

    }


    if (activeOrders) {

        activeOrders.textContent =
            active;

    }


    if (deliveredOrders) {

        deliveredOrders.textContent =
            delivered;

    }

}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "loggedUser"
            );


            localStorage.removeItem(
                "token"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// START
// ==========================================

loadMyOrders();