// ==========================================
// ADMIN PANEL
// ==========================================


// ==========================================
// GET LOGGED USER
// ==========================================

const loggedUser =
    JSON.parse(localStorage.getItem("loggedUser"));


// ==========================================
// CHECK LOGIN
// ==========================================

if (!loggedUser) {

    alert("Please login first");

    window.location.href = "login.html";

    throw new Error("User not logged in");

}


// ==========================================
// CHECK ADMIN ROLE
// ==========================================

if (loggedUser.role !== "ADMIN") {

    alert("Access denied. Admin only.");

    window.location.href = "index.html";

    throw new Error("User is not admin");

}


// ==========================================
// DISPLAY ADMIN NAME
// ==========================================

const adminNameElement =
    document.getElementById("adminName");

if (adminNameElement) {

    adminNameElement.textContent =
        loggedUser.name;

}


// ==========================================
// API URLS
// ==========================================

const PRODUCTS_API =
    "https://flipkart-clone-91e6.onrender.com/api/admin/products";

const USERS_API =
    "https://flipkart-clone-91e6.onrender.com/api/admin/users";

const DASHBOARD_API =
    "https://flipkart-clone-91e6.onrender.com/api/admin/dashboard";

const ORDERS_API =
    "https://flipkart-clone-91e6.onrender.com/api/admin/orders";

const DELIVERY_PARTNERS_API =
    "https://flipkart-clone-91e6.onrender.com/api/admin/delivery-partners";


// ==========================================
// EDITING PRODUCT ID
// ==========================================

let editingProductId = null;


// ==========================================
// PRODUCT ELEMENTS
// ==========================================

const productsContainer =
    document.getElementById("productsContainer");

const addProductBtn =
    document.getElementById("addProductBtn");

const productModal =
    document.getElementById("productModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const saveProductBtn =
    document.getElementById("saveProductBtn");

const modalTitle =
    document.getElementById("modalTitle");


// ==========================================
// PRODUCT FORM INPUTS
// ==========================================

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productCategory =
    document.getElementById("productCategory");

const productImage =
    document.getElementById("productImage");

const productRating =
    document.getElementById("productRating");

const productDelivery =
    document.getElementById("productDelivery");


// ==========================================
// USERS ELEMENTS
// ==========================================

const usersSection =
    document.getElementById("usersSection");

const usersTableBody =
    document.getElementById("usersTableBody");


// ==========================================
// ORDERS ELEMENTS
// ==========================================

const ordersSection =
    document.getElementById("ordersSection");

const adminOrdersContainer =
    document.getElementById("adminOrdersContainer");


// ==========================================
// DELIVERY SECTION
// ==========================================

const deliverySection =
    document.getElementById("deliverySection");


// ==========================================
// DELIVERY PARTNER ELEMENTS
// ==========================================

const deliveryPartnersContainer =
    document.getElementById(
        "deliveryPartnersContainer"
    );

const addDeliveryPartnerBtn =
    document.getElementById(
        "addDeliveryPartnerBtn"
    );

const deliveryPartnerModal =
    document.getElementById(
        "deliveryPartnerModal"
    );

const closeDeliveryPartnerBtn =
    document.getElementById(
        "closeDeliveryPartnerBtn"
    );

const saveDeliveryPartnerBtn =
    document.getElementById(
        "saveDeliveryPartnerBtn"
    );


// ==========================================
// MENU BUTTONS
// ==========================================

const dashboardMenuBtn =
    document.getElementById(
        "dashboardMenuBtn"
    );

const productsMenuBtn =
    document.getElementById(
        "productsMenuBtn"
    );

const usersMenuBtn =
    document.getElementById(
        "usersMenuBtn"
    );

const ordersMenuBtn =
    document.getElementById(
        "ordersMenuBtn"
    );

const deliveryMenuBtn =
    document.getElementById(
        "deliveryMenuBtn"
    );


// ==========================================
// SECTIONS
// ==========================================

const dashboardSection =
    document.getElementById(
        "dashboardSection"
    );

const productsSection =
    document.getElementById(
        "productsSection"
    );


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            window.location.href =
                "login.html";

            return;

        }


        const response =
            await fetch(
                DASHBOARD_API,
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
                "Unable to load dashboard"
            );

        }


        const totalUsers =
            document.getElementById(
                "totalUsers"
            );

        const totalProducts =
            document.getElementById(
                "totalProducts"
            );

        const totalOrders =
            document.getElementById(
                "totalOrders"
            );

        const totalRevenue =
            document.getElementById(
                "totalRevenue"
            );


        if (totalUsers) {

            totalUsers.textContent =
                data.totalUsers;

        }


        if (totalProducts) {

            totalProducts.textContent =
                data.totalProducts;

        }


        if (totalOrders) {

            totalOrders.textContent =
                data.totalOrders;

        }


        if (totalRevenue) {

            totalRevenue.textContent =
                "₹" +
                Number(
                    data.totalRevenue
                ).toLocaleString();

        }


    } catch (error) {

        console.log(
            "Dashboard error:",
            error
        );

    }

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        const response =
            await fetch(
                PRODUCTS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const products =
            await response.json();


        if (!response.ok) {

            throw new Error(
                products.message ||
                "Unable to load products"
            );

        }


        displayProducts(products);


    } catch (error) {

        console.log(error);


        if (productsContainer) {

            productsContainer.innerHTML = `

                <p>
                    ${error.message}
                </p>

            `;

        }

    }

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(products) {

    if (!productsContainer) {

        return;

    }


    productsContainer.innerHTML = "";


    if (products.length === 0) {

        productsContainer.innerHTML = `

            <p>
                No products available.
            </p>

        `;

        return;

    }


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "product-card"
            );


            card.innerHTML = `

                <img
                    src="./images/${product.image}"
                    alt="${product.name}"
                >


                <h3>
                    ${product.name}
                </h3>


                <p class="product-price">

                    ₹${Number(
                        product.price
                    ).toLocaleString()}

                </p>


                <p>

                    Category:
                    ${product.category}

                </p>


                <p>

                    Rating:
                    ⭐${product.rating}

                </p>


                <p>

                    ${product.delivery}

                </p>


                <div class="product-actions">

                    <button
                        class="edit-btn"
                        data-id="${product.id}"
                    >

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-id="${product.id}"
                    >

                        Delete

                    </button>

                </div>

            `;


            productsContainer.appendChild(
                card
            );

        }
    );


    addProductButtonEvents();

}


// ==========================================
// PRODUCT BUTTON EVENTS
// ==========================================

function addProductButtonEvents() {

    const editButtons =
        document.querySelectorAll(
            ".edit-btn"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    startEditProduct(
                        productId
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-btn"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const productId =
                        button.dataset.id;


                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this product?"
                        );


                    if (!confirmDelete) {

                        return;

                    }


                    const token =
                        localStorage.getItem(
                            "token"
                        );


                    try {

                        const response =
                            await fetch(
                                `${PRODUCTS_API}/${productId}`,
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


                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                "Unable to delete product"
                            );

                        }


                        alert(
                            "Product deleted successfully ✅"
                        );


                        loadProducts();

                        loadDashboard();


                    } catch (error) {

                        console.log(error);


                        alert(
                            error.message ||
                            "Unable to delete product"
                        );

                    }

                }
            );

        }
    );

}


// ==========================================
// CLEAR PRODUCT FORM
// ==========================================

function clearProductForm() {

    if (productName)
        productName.value = "";

    if (productPrice)
        productPrice.value = "";

    if (productCategory)
        productCategory.value = "";

    if (productImage)
        productImage.value = "";

    if (productRating)
        productRating.value = "";

    if (productDelivery)
        productDelivery.value = "";

}


// ==========================================
// OPEN ADD PRODUCT MODAL
// ==========================================

if (addProductBtn) {

    addProductBtn.addEventListener(
        "click",
        function () {

            editingProductId = null;

            clearProductForm();

            if (modalTitle)
                modalTitle.textContent =
                    "Add Product";

            if (saveProductBtn)
                saveProductBtn.textContent =
                    "Save Product";

            if (productModal)
                productModal.style.display =
                    "flex";

        }
    );

}


// ==========================================
// START EDIT PRODUCT
// ==========================================

function startEditProduct(productId) {

    loadProductForEdit(productId);

}


// ==========================================
// LOAD PRODUCT FOR EDIT
// ==========================================

async function loadProductForEdit(
    productId
) {

    try {

        const token =
            localStorage.getItem("token");


        const response =
            await fetch(
                PRODUCTS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const products =
            await response.json();


        if (!response.ok) {

            throw new Error(
                products.message ||
                "Unable to load product"
            );

        }


        const product =
            products.find(
                function (item) {

                    return Number(item.id) ===
                        Number(productId);

                }
            );


        if (!product) {

            alert(
                "Product not found"
            );

            return;

        }


        editingProductId =
            product.id;


        productName.value =
            product.name;

        productPrice.value =
            product.price;

        productCategory.value =
            product.category;

        productImage.value =
            product.image;

        productRating.value =
            product.rating;

        productDelivery.value =
            product.delivery;


        modalTitle.textContent =
            "Edit Product";

        saveProductBtn.textContent =
            "Update Product";

        productModal.style.display =
            "flex";


    } catch (error) {

        console.log(error);


        alert(
            error.message ||
            "Unable to load product"
        );

    }

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        function () {

            productModal.style.display =
                "none";

            editingProductId = null;

        }
    );

}


// ==========================================
// SAVE / UPDATE PRODUCT
// ==========================================

if (saveProductBtn) {

    saveProductBtn.addEventListener(
        "click",
        async function () {

            const name =
                productName.value.trim();

            const price =
                productPrice.value;

            const category =
                productCategory.value.trim();

            const image =
                productImage.value.trim();

            const rating =
                productRating.value;

            const delivery =
                productDelivery.value.trim();


            if (
                !name ||
                !price ||
                !category ||
                !image ||
                !rating ||
                !delivery
            ) {

                alert(
                    "Please fill all product details"
                );

                return;

            }


            const token =
                localStorage.getItem("token");


            const productData = {

                name: name,

                price:
                    Number(price),

                category:
                    category,

                image:
                    image,

                rating:
                    Number(rating),

                delivery:
                    delivery

            };


            try {

                let response;


                if (
                    editingProductId !== null
                ) {

                    response =
                        await fetch(
                            `${PRODUCTS_API}/${editingProductId}`,
                            {

                                method:
                                    "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`

                                },

                                body:
                                    JSON.stringify(
                                        productData
                                    )

                            }
                        );

                } else {

                    response =
                        await fetch(
                            PRODUCTS_API,
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
                                    JSON.stringify(
                                        productData
                                    )

                            }
                        );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to save product"
                    );

                }


                alert(
                    editingProductId !== null
                        ? "Product updated successfully ✅"
                        : "Product added successfully ✅"
                );


                productModal.style.display =
                    "none";

                editingProductId = null;

                loadProducts();

                loadDashboard();


            } catch (error) {

                console.log(error);


                alert(
                    error.message ||
                    "Unable to save product"
                );

            }

        }
    );

}


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    try {

        const token =
            localStorage.getItem("token");


        const response =
            await fetch(
                USERS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const users =
            await response.json();


        if (!response.ok) {

            throw new Error(
                users.message ||
                "Unable to load users"
            );

        }


        displayUsers(users);


    } catch (error) {

        console.log(error);


        if (usersTableBody) {

            usersTableBody.innerHTML = `

                <tr>

                    <td colspan="4">

                        ${error.message}

                    </td>

                </tr>

            `;

        }

    }

}


// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(users) {

    if (!usersTableBody) {

        return;

    }


    usersTableBody.innerHTML = "";


    if (users.length === 0) {

        usersTableBody.innerHTML = `

            <tr>

                <td colspan="4">

                    No users found.

                </td>

            </tr>

        `;

        return;

    }


    users.forEach(
        function (user) {

            const row =
                document.createElement(
                    "tr"
                );


            const roleClass =
                user.role === "ADMIN"
                    ? "admin"
                    : user.role === "CUSTOMER"
                        ? "customer"
                        : "delivery";


            row.innerHTML = `

                <td>
                    ${user.id}
                </td>

                <td>
                    ${user.name}
                </td>

                <td>
                    ${user.email}
                </td>

                <td>

                    <span
                        class="user-role ${roleClass}"
                    >

                        ${user.role}

                    </span>

                </td>

            `;


            usersTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// LOAD ADMIN ORDERS
// ==========================================

async function loadAdminOrders() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        adminOrdersContainer.innerHTML = `

            <p>
                Loading orders...
            </p>

        `;


        const response =
            await fetch(
                ORDERS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const orders =
            await response.json();


        if (!response.ok) {

            throw new Error(
                orders.message ||
                "Unable to load orders"
            );

        }


        console.log(
            "ADMIN ORDERS:",
            orders
        );


        displayAdminOrders(
            orders
        );


    } catch (error) {

        console.log(error);


        adminOrdersContainer.innerHTML = `

            <div class="admin-order-card">

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        const response =
            await fetch(
                `${ORDERS_API}/${orderId}/status`,
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
                                newStatus

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


        alert(
            "Order status updated successfully ✅"
        );


        loadAdminOrders();

        loadDashboard();


    } catch (error) {

        console.log(error);


        alert(
            error.message ||
            "Unable to update order status"
        );

    }

}


// ==========================================
// GET AVAILABLE DELIVERY PARTNERS
// ==========================================

async function getAvailableDeliveryPartners() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            throw new Error(
                "Session expired"
            );

        }


        // ======================================
        // USE EXISTING DELIVERY PARTNER API
        // ======================================

        const response =
            await fetch(
                DELIVERY_PARTNERS_API,
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


        console.log(
            "ALL DELIVERY PARTNERS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load delivery partners"
            );

        }


        if (!Array.isArray(data)) {

            console.log(
                "Unexpected delivery partner response:",
                data
            );

            return [];

        }


        // ======================================
        // FILTER AVAILABLE RIDERS
        // ======================================

        const availablePartners =
            data.filter(
                function (partner) {

                    return String(
                        partner.status
                    ).toUpperCase() ===
                        "AVAILABLE";

                }
            );


        console.log(
            "AVAILABLE DELIVERY PARTNERS:",
            availablePartners
        );


        return availablePartners;


    } catch (error) {

        console.log(
            "Available riders error:",
            error
        );


        return [];

    }

}


// ==========================================
// ASSIGN ORDER TO DELIVERY PARTNER
// ==========================================

async function assignOrderToPartner(
    orderId,
    deliveryPartnerId
) {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        const response =
            await fetch(
                `${ORDERS_API}/${orderId}/assign`,
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

                            delivery_partner_id:
                                Number(
                                    deliveryPartnerId
                                )

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "ASSIGN RIDER RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to assign delivery partner"
            );

        }


        alert(
            "Delivery partner assigned successfully ✅"
        );


        // Reload everything
        await loadAdminOrders();

        await loadDashboard();

        await loadDeliveryPartners();


    } catch (error) {

        console.log(
            "Assign order error:",
            error
        );


        alert(
            error.message ||
            "Unable to assign delivery partner"
        );

    }

}


// ==========================================
// LOAD RIDERS INTO ORDER DROPDOWN
// ==========================================

async function loadPartnersIntoOrder(
    orderCard,
    order
) {

    const select =
        orderCard.querySelector(
            ".delivery-partner-select"
        );

    const assignButton =
        orderCard.querySelector(
            ".assign-partner-btn"
        );

    const assignmentMessage =
        orderCard.querySelector(
            ".assignment-message"
        );


    if (
        !select ||
        !assignButton
    ) {

        console.log(
            "Assignment elements not found"
        );

        return;

    }


    // ======================================
    // ALREADY ASSIGNED
    // ======================================

    if (
        order.delivery_partner_id !== null &&
        order.delivery_partner_id !== undefined &&
        order.delivery_partner_id !== ""
    ) {

        select.innerHTML = `

            <option value="">
                Rider Already Assigned
            </option>

        `;

        select.disabled = true;

        assignButton.disabled = true;


        if (assignmentMessage) {

            assignmentMessage.innerHTML = `

                🚴 Assigned to
                Partner #${order.delivery_partner_id}

            `;

        }


        return;

    }


    // ======================================
    // ONLY PACKED ORDERS CAN BE ASSIGNED
    // ======================================

    if (
        String(order.status).toUpperCase() !==
        "PACKED"
    ) {

        select.innerHTML = `

            <option value="">
                Available after PACKED
            </option>

        `;

        select.disabled = true;

        assignButton.disabled = true;

        return;

    }


    // ======================================
    // GET AVAILABLE RIDERS
    // ======================================

    const partners =
        await getAvailableDeliveryPartners();


    console.log(
        `Order #${order.order_id} available riders:`,
        partners
    );


    // ======================================
    // NO RIDERS
    // ======================================

    if (partners.length === 0) {

        select.innerHTML = `

            <option value="">
                No Available Riders
            </option>

        `;

        select.disabled = true;

        assignButton.disabled = true;

        return;

    }


    // ======================================
    // CLEAR DROPDOWN
    // ======================================

    select.innerHTML = `

        <option value="">
            Select Available Rider
        </option>

    `;


    // ======================================
    // ADD AVAILABLE RIDERS
    // ======================================

    partners.forEach(
        function (partner) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                partner.id;


            option.textContent =
                `${partner.name} - ${partner.vehicle_type} (${partner.vehicle_number})`;


            select.appendChild(
                option
            );

        }
    );


    select.disabled = false;

    assignButton.disabled = false;


    // ======================================
    // ASSIGN BUTTON
    // ======================================

    assignButton.onclick =
        async function () {

            const partnerId =
                select.value;


            if (!partnerId) {

                alert(
                    "Please select an available rider"
                );

                return;

            }


            const selectedPartner =
                select.options[
                    select.selectedIndex
                ].textContent;


            const confirmed =
                confirm(
                    `Assign Order #${order.order_id} to ${selectedPartner}?`
                );


            if (!confirmed) {

                return;

            }


            await assignOrderToPartner(
                order.order_id,
                partnerId
            );

        };

}


// ==========================================
// DISPLAY ADMIN ORDERS
// ==========================================

async function displayAdminOrders(
    orders
) {

    adminOrdersContainer.innerHTML = "";


    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        adminOrdersContainer.innerHTML = `

            <div class="admin-order-card">

                <h3>
                    No orders found.
                </h3>

            </div>

        `;

        return;

    }


    // ======================================
    // GROUP PRODUCTS BY ORDER
    // ======================================

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

                    // IMPORTANT
                    delivery_partner_id:
                        order.delivery_partner_id ??
                        null,

                    products: []

                };

            }


            groupedOrders[
                order.order_id
            ].products.push({

                product_id:
                    order.product_id,

                product_name:
                    order.product_name,

                product_price:
                    order.product_price,

                product_image:
                    order.product_image,

                quantity:
                    order.quantity

            });

        }
    );


    // ======================================
    // CREATE ORDER CARDS
    // ======================================

    Object.values(
        groupedOrders
    ).forEach(
        function (order) {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.classList.add(
                "admin-order-card"
            );


            // ==================================
            // PRODUCTS HTML
            // ==================================

            let productsHTML = "";


            order.products.forEach(
                function (product) {

                    const productTotal =
                        Number(
                            product.product_price
                        ) *
                        Number(
                            product.quantity
                        );


                    productsHTML += `

                        <div
                            class="admin-order-product"
                        >

                            <img
                                src="./images/${product.product_image}"
                                alt="${product.product_name}"
                            >


                            <div
                                class="admin-order-product-details"
                            >

                                <h4>
                                    ${product.product_name}
                                </h4>


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
                                    ₹${productTotal.toLocaleString()}
                                </p>

                            </div>

                        </div>

                    `;

                }
            );


            // ==================================
            // EXISTING ASSIGNMENT MESSAGE
            // ==================================

            let assignmentText = "";


            if (
                order.delivery_partner_id
            ) {

                assignmentText = `

                    🚴 Assigned to
                    Partner #${order.delivery_partner_id}

                `;

            }


            // ==================================
            // ORDER CARD HTML
            // ==================================

            orderCard.innerHTML = `

                <div
                    class="admin-order-header"
                >

                    <div>

                        <h3>
                            Order #${order.order_id}
                        </h3>


                        <p>

                            Current Status:

                            <strong>
                                ${order.status}
                            </strong>

                        </p>

                    </div>


                    <span
                        class="admin-order-status ${String(
                            order.status
                        ).toLowerCase()}"
                    >

                        ${order.status}

                    </span>

                </div>


                <!-- CUSTOMER -->

                <div
                    class="admin-customer-details"
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
                            User ID:
                        </strong>

                        ${order.user_id}

                    </p>

                </div>


                <!-- STATUS CONTROL -->

                <div
                    class="order-status-control"
                >

                    <label>
                        Change Order Status:
                    </label>


                    <select
                        class="order-status-select"
                        data-order-id="${order.order_id}"
                    >

                        <option
                            value="PLACED"
                            ${
                                order.status ===
                                "PLACED"
                                    ? "selected"
                                    : ""
                            }
                        >
                            PLACED
                        </option>


                        <option
                            value="CONFIRMED"
                            ${
                                order.status ===
                                "CONFIRMED"
                                    ? "selected"
                                    : ""
                            }
                        >
                            CONFIRMED
                        </option>


                        <option
                            value="PACKED"
                            ${
                                order.status ===
                                "PACKED"
                                    ? "selected"
                                    : ""
                            }
                        >
                            PACKED
                        </option>


                        <option
                            value="OUT_FOR_DELIVERY"
                            ${
                                order.status ===
                                "OUT_FOR_DELIVERY"
                                    ? "selected"
                                    : ""
                            }
                        >
                            OUT FOR DELIVERY
                        </option>


                        <option
                            value="DELIVERED"
                            ${
                                order.status ===
                                "DELIVERED"
                                    ? "selected"
                                    : ""
                            }
                        >
                            DELIVERED
                        </option>


                        <option
                            value="CANCELLED"
                            ${
                                order.status ===
                                "CANCELLED"
                                    ? "selected"
                                    : ""
                            }
                        >
                            CANCELLED
                        </option>

                    </select>


                    <button
                        class="update-status-btn"
                        data-order-id="${order.order_id}"
                    >

                        Update Status

                    </button>

                </div>


                <!-- ==================================
                     DELIVERY PARTNER ASSIGNMENT
                =================================== -->

                <div
                    class="order-assignment-control"
                >

                    <label>
                        Delivery Partner:
                    </label>


                    <select
                        class="delivery-partner-select"
                        data-order-id="${order.order_id}"
                    >

                        <option value="">
                            Loading riders...
                        </option>

                    </select>


                    <button
                        class="assign-partner-btn"
                        data-order-id="${order.order_id}"
                    >

                        Assign Rider

                    </button>


                    <p
                        class="assignment-message"
                    >

                        ${assignmentText}

                    </p>

                </div>


                <!-- PRODUCTS -->

                <div
                    class="admin-order-products"
                >

                    ${productsHTML}

                </div>


                <!-- FOOTER -->

                <div
                    class="admin-order-footer"
                >

                    <p
                        class="admin-order-total"
                    >

                        Total:

                        ₹${Number(
                            order.total_amount
                        ).toLocaleString()}

                    </p>

                </div>

            `;


            adminOrdersContainer.appendChild(
                orderCard
            );


            // ==================================
            // LOAD RIDERS
            // ==================================

            loadPartnersIntoOrder(
                orderCard,
                order
            );


            // ==================================
            // STATUS EVENT
            // ==================================

            const updateStatusButton =
                orderCard.querySelector(
                    ".update-status-btn"
                );


            const statusSelect =
                orderCard.querySelector(
                    ".order-status-select"
                );


            if (
                updateStatusButton &&
                statusSelect
            ) {

                updateStatusButton.addEventListener(
                    "click",
                    function () {

                        const orderId =
                            updateStatusButton.dataset
                                .orderId;


                        const newStatus =
                            statusSelect.value;


                        if (
                            newStatus ===
                            order.status
                        ) {

                            alert(
                                "Order is already " +
                                newStatus
                            );

                            return;

                        }


                        const confirmation =
                            confirm(
                                `Change Order #${orderId} status to ${newStatus}?`
                            );


                        if (!confirmation) {

                            return;

                        }


                        updateOrderStatus(
                            orderId,
                            newStatus
                        );

                    }
                );

            }

        }
    );

}


// ==========================================
// LOAD DELIVERY PARTNERS
// ==========================================

async function loadDeliveryPartners() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        if (deliveryPartnersContainer) {

            deliveryPartnersContainer.innerHTML = `

                <p>
                    Loading delivery partners...
                </p>

            `;

        }


        const response =
            await fetch(
                DELIVERY_PARTNERS_API,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const partners =
            await response.json();


        if (!response.ok) {

            throw new Error(
                partners.message ||
                "Unable to load delivery partners"
            );

        }


        displayDeliveryPartners(
            partners
        );


    } catch (error) {

        console.log(
            "Delivery partner error:",
            error
        );


        if (deliveryPartnersContainer) {

            deliveryPartnersContainer.innerHTML = `

                <p>
                    ${error.message}
                </p>

            `;

        }

    }

}


// ==========================================
// DISPLAY DELIVERY PARTNERS
// ==========================================

function displayDeliveryPartners(
    partners
) {

    if (!deliveryPartnersContainer) {

        return;

    }


    deliveryPartnersContainer.innerHTML =
        "";


    if (partners.length === 0) {

        deliveryPartnersContainer.innerHTML = `

            <div class="delivery-empty">

                <h3>
                    No delivery partners
                </h3>


                <p>
                    Add your first delivery partner.
                </p>

            </div>

        `;

        return;

    }


    partners.forEach(
        function (partner) {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "delivery-partner-card"
            );


            const statusClass =
                String(
                    partner.status ||
                    "OFFLINE"
                ).toLowerCase();


            card.innerHTML = `

                <div
                    class="delivery-partner-header"
                >

                    <div>

                        <h3>
                            ${partner.name}
                        </h3>


                        <p>
                            ${partner.email}
                        </p>

                    </div>


                    <span
                        class="delivery-partner-status ${statusClass}"
                    >

                        ${partner.status}

                    </span>

                </div>


                <div
                    class="delivery-partner-details"
                >

                    <p>

                        <strong>
                            📞 Phone:
                        </strong>

                        ${partner.phone}

                    </p>


                    <p>

                        <strong>
                            🛵 Vehicle:
                        </strong>

                        ${partner.vehicle_type}

                    </p>


                    <p>

                        <strong>
                            🔢 Vehicle Number:
                        </strong>

                        ${partner.vehicle_number}

                    </p>


                    <p>

                        <strong>
                            Partner ID:
                        </strong>

                        ${partner.id}

                    </p>

                </div>

            `;


            deliveryPartnersContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// OPEN DELIVERY PARTNER MODAL
// ==========================================

if (addDeliveryPartnerBtn) {

    addDeliveryPartnerBtn.addEventListener(
        "click",
        function () {

            if (deliveryPartnerModal) {

                deliveryPartnerModal.style.display =
                    "flex";

            }

        }
    );

}


// ==========================================
// CLOSE DELIVERY PARTNER MODAL
// ==========================================

if (closeDeliveryPartnerBtn) {

    closeDeliveryPartnerBtn.addEventListener(
        "click",
        function () {

            if (deliveryPartnerModal) {

                deliveryPartnerModal.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// CREATE DELIVERY PARTNER
// ==========================================

if (saveDeliveryPartnerBtn) {

    saveDeliveryPartnerBtn.addEventListener(
        "click",
        async function () {

            const name =
                document.getElementById(
                    "deliveryPartnerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "deliveryPartnerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "deliveryPartnerPassword"
                ).value.trim();


            const phone =
                document.getElementById(
                    "deliveryPartnerPhone"
                ).value.trim();


            const vehicleType =
                document.getElementById(
                    "deliveryPartnerVehicleType"
                ).value.trim();


            const vehicleNumber =
                document.getElementById(
                    "deliveryPartnerVehicleNumber"
                ).value.trim();


            if (
                !name ||
                !email ||
                !password ||
                !phone ||
                !vehicleType ||
                !vehicleNumber
            ) {

                alert(
                    "Please fill all delivery partner details"
                );

                return;

            }


            try {

                const token =
                    localStorage.getItem("token");


                if (!token) {

                    alert(
                        "Session expired. Please login again."
                    );

                    window.location.href =
                        "login.html";

                    return;

                }


                const response =
                    await fetch(
                        DELIVERY_PARTNERS_API,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password,

                                    phone:
                                        phone,

                                    vehicle_type:
                                        vehicleType,

                                    vehicle_number:
                                        vehicleNumber

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to create delivery partner"
                    );

                }


                alert(
                    "Delivery partner created successfully ✅"
                );


                if (deliveryPartnerModal) {

                    deliveryPartnerModal.style.display =
                        "none";

                }


                document.getElementById(
                    "deliveryPartnerName"
                ).value = "";


                document.getElementById(
                    "deliveryPartnerEmail"
                ).value = "";


                document.getElementById(
                    "deliveryPartnerPassword"
                ).value = "";


                document.getElementById(
                    "deliveryPartnerPhone"
                ).value = "";


                document.getElementById(
                    "deliveryPartnerVehicleType"
                ).value = "";


                document.getElementById(
                    "deliveryPartnerVehicleNumber"
                ).value = "";


                loadDeliveryPartners();

                loadDashboard();


            } catch (error) {

                console.log(error);


                alert(
                    error.message ||
                    "Unable to create delivery partner"
                );

            }

        }
    );

}


// ==========================================
// SET ACTIVE MENU
// ==========================================

function setActiveMenu(
    activeButton
) {

    const menuButtons =
        document.querySelectorAll(
            ".menu-btn"
        );


    menuButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }

}


// ==========================================
// HIDE ALL SECTIONS
// ==========================================

function hideAllSections() {

    if (dashboardSection)
        dashboardSection.style.display =
            "none";


    if (productsSection)
        productsSection.style.display =
            "none";


    if (usersSection)
        usersSection.style.display =
            "none";


    if (ordersSection)
        ordersSection.style.display =
            "none";


    if (deliverySection)
        deliverySection.style.display =
            "none";

}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    hideAllSections();

    if (dashboardSection)
        dashboardSection.style.display =
            "block";

    setActiveMenu(
        dashboardMenuBtn
    );

    loadDashboard();

}


// ==========================================
// SHOW PRODUCTS
// ==========================================

function showProducts() {

    hideAllSections();

    if (productsSection)
        productsSection.style.display =
            "block";

    setActiveMenu(
        productsMenuBtn
    );

    loadProducts();

}


// ==========================================
// SHOW USERS
// ==========================================

function showUsers() {

    hideAllSections();

    if (usersSection)
        usersSection.style.display =
            "block";

    setActiveMenu(
        usersMenuBtn
    );

    loadUsers();

}


// ==========================================
// SHOW ORDERS
// ==========================================

function showOrders() {

    hideAllSections();

    if (ordersSection)
        ordersSection.style.display =
            "block";

    setActiveMenu(
        ordersMenuBtn
    );

    loadAdminOrders();

}


// ==========================================
// SHOW DELIVERY
// ==========================================

function showDelivery() {

    hideAllSections();

    if (deliverySection)
        deliverySection.style.display =
            "block";

    setActiveMenu(
        deliveryMenuBtn
    );

    loadDeliveryPartners();

}


// ==========================================
// MENU EVENTS
// ==========================================

if (dashboardMenuBtn) {

    dashboardMenuBtn.addEventListener(
        "click",
        showDashboard
    );

}


if (productsMenuBtn) {

    productsMenuBtn.addEventListener(
        "click",
        showProducts
    );

}


if (usersMenuBtn) {

    usersMenuBtn.addEventListener(
        "click",
        showUsers
    );

}


if (ordersMenuBtn) {

    ordersMenuBtn.addEventListener(
        "click",
        showOrders
    );

}


if (deliveryMenuBtn) {

    deliveryMenuBtn.addEventListener(
        "click",
        showDelivery
    );

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
// START APPLICATION
// ==========================================

showDashboard();