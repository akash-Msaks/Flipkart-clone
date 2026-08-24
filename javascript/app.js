// ==========================================
// LOGIN CHECK
// ==========================================

const loginSection =
    document.getElementById("loginSection");

const loggedUser =
    JSON.parse(localStorage.getItem("loggedUser"));


// ==========================================
// GET ACCESS TOKEN
// ==========================================

function getAccessToken() {

    // Main token location
    const token =
        localStorage.getItem("token");

    // Fallbacks in case your login code
    // uses another common name
    if (token) {
        return token;
    }

    const accessToken =
        localStorage.getItem("accessToken");

    if (accessToken) {
        return accessToken;
    }

    const jwtToken =
        localStorage.getItem("jwtToken");

    if (jwtToken) {
        return jwtToken;
    }

    // In case token was stored inside loggedUser
    const currentUser =
        JSON.parse(
            localStorage.getItem("loggedUser")
        );

    if (
        currentUser &&
        currentUser.token
    ) {

        return currentUser.token;

    }

    return null;

}


// ==========================================
// DISPLAY LOGGED USER
// ==========================================

if (loggedUser && loginSection) {

    loginSection.innerHTML = `

        <span class="user-name">
            👤 ${loggedUser.name}
        </span>

        <button id="logoutBtn">
            Logout
        </button>

    `;

}


// ==========================================
// PRODUCTS
// ==========================================

let allProducts = [];

const productContainer =
    document.getElementById(
        "productContainer"
    );


// ==========================================
// LOAD PRODUCTS FROM BACKEND
// ==========================================

async function loadProducts() {

    try {

        const response =
            await fetch(
                "http://https://flipkart-clone-91e6.onrender.com/api/products"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        allProducts =
            await response.json();


        displayProducts(
            allProducts
        );


    } catch (error) {

        console.log(error);

        if (productContainer) {

            productContainer.innerHTML =
                "<p>Unable to load products</p>";

        }

    }

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(products) {

    if (!productContainer) {
        return;
    }


    productContainer.innerHTML = "";


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

                <p class="price">
                    ₹${Number(
                        product.price
                    ).toLocaleString()}
                </p>

                <h3>
                    ${product.name}
                </h3>

                <p class="rating">
                    ${"⭐".repeat(
                        Math.round(
                            product.rating
                        )
                    )}
                </p>

                <p class="delivery">
                    ${product.delivery}
                </p>

             <button
    class="cart-btn"
    data-product-id="${product.id}"
>
    Add to cart
</button>
            `;


            productContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function () {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filteredProducts =
                allProducts.filter(
                    function (product) {

                        return product.name
                            .toLowerCase()
                            .includes(
                                searchValue
                            );

                    }
                );


            displayProducts(
                filteredProducts
            );

        }
    );

}


// ==========================================
// ADD PRODUCT TO CART
// ==========================================

if (productContainer) {

    productContainer.addEventListener(
        "click",
        async function (event) {


            // ==================================
            // CHECK ADD TO CART BUTTON
            // ==================================

            if (
                !event.target.classList.contains(
                    "cart-btn"
                )
            ) {

                return;

            }


            // ==================================
            // CHECK LOGIN
            // ==================================

            const currentUser =
                JSON.parse(
                    localStorage.getItem(
                        "loggedUser"
                    )
                );


            if (!currentUser) {

                alert(
                    "Please login before adding products to cart"
                );


                window.location.href =
                    "login.html";


                return;

            }


            // ==================================
            // GET JWT TOKEN
            // ==================================

            const token =
                getAccessToken();


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


                localStorage.removeItem(
                    "accessToken"
                );


                localStorage.removeItem(
                    "jwtToken"
                );


                window.location.href =
                    "login.html";


                return;

            }


            // ==================================
            // GET PRODUCT
            // ==================================

            const button =
                event.target;


            const productId =
    Number(button.dataset.productId);

const product =
    allProducts.find(
        function (item) {

            return Number(item.id) ===
                productId;

        }
    );

            if (!product) {

                alert(
                    "Product not found"
                );


                return;

            }


            // ==================================
            // SEND PRODUCT TO BACKEND
            // ==================================

            try {

                const response =
                    await fetch(
                        "http://https://flipkart-clone-91e6.onrender.com/api/cart",
                        {

                            method: "POST",


                            headers: {

                                "Content-Type":
                                    "application/json",


                                // 🔐 JWT TOKEN
                                "Authorization":
                                    `Bearer ${token}`

                            },


                            body: JSON.stringify({

                                user_id:
                                    currentUser.id,


                                product_id:
                                    product.id,


                                quantity: 1

                            })

                        }
                    );


                const data =
                    await response.json();


                // ==================================
                // CHECK RESPONSE
                // ==================================

                if (!response.ok) {

                    // JWT expired / invalid
                    if (
                        response.status ===
                        401
                    ) {

                        alert(
                            "Your session has expired. Please login again."
                        );


                        localStorage.removeItem(
                            "loggedUser"
                        );


                        localStorage.removeItem(
                            "token"
                        );


                        localStorage.removeItem(
                            "accessToken"
                        );


                        localStorage.removeItem(
                            "jwtToken"
                        );


                        window.location.href =
                            "login.html";


                        return;

                    }


                    throw new Error(
                        data.message ||
                        "Unable to add product"
                    );

                }


                // ==================================
                // SUCCESS
                // ==================================

                alert(
                    "Product added to cart 🛒"
                );


                loadCartCount();


            } catch (error) {

                console.log(
                    "Add to cart error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to add product to cart"
                );

            }

        }
    );

}


// ==========================================
// LOAD CART COUNT
// ==========================================

async function loadCartCount() {


    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "loggedUser"
            )
        );


    if (!currentUser) {

        return;

    }


    // ==================================
    // GET JWT
    // ==================================

    const token =
        getAccessToken();


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://https://flipkart-clone-91e6.onrender.com/api/cart/count/${currentUser.id}`,
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


        // ==================================
        // AUTH ERROR
        // ==================================

        if (
            response.status ===
            401
        ) {

            console.log(
                "Cart count authentication failed"
            );

            return;

        }


        // ==================================
        // AUTHORIZATION ERROR
        // ==================================

        if (
            response.status ===
            403
        ) {

            console.log(
                "Cart count authorization failed"
            );

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load cart count"
            );

        }


        const cartCounter =
            document.getElementById(
                "cartCount"
            );


        if (cartCounter) {

            cartCounter.textContent =
                data.totalItems;

        }


    } catch (error) {

        console.log(
            "Unable to load cart count",
            error
        );

    }

}


// ==========================================
// HERO SLIDER
// ==========================================

const banners = [

    {

        image:
            "./images/mobile2.jpg",

        title:
            "Big Billion Days",

        text:
            "Up to 80% OFF on Mobiles, Electronics and Fashion"

    },

    {

        image:
            "./images/laptop.jpg",

        title:
            "Laptop Sale",

        text:
            "Up to 50% OFF on Laptops"

    },

    {

        image:
            "./images/headphone.jpg",

        title:
            "Electronics Festival",

        text:
            "Best Deals on Electronics"

    }

];


// ==========================================
// HERO ELEMENTS
// ==========================================

const heroImage =
    document.querySelector(
        ".hero-right img"
    );


const heroTitle =
    document.querySelector(
        ".hero-left h1"
    );


const heroText =
    document.querySelector(
        ".hero-left p"
    );


let currentBanner = 0;


// ==========================================
// CHANGE BANNER
// ==========================================

function changeBanner() {

    if (
        !heroImage ||
        !heroTitle ||
        !heroText
    ) {

        return;

    }


    heroImage.src =
        banners[
            currentBanner
        ].image;


    heroTitle.textContent =
        banners[
            currentBanner
        ].title;


    heroText.textContent =
        banners[
            currentBanner
        ].text;


    currentBanner++;


    if (
        currentBanner >=
        banners.length
    ) {

        currentBanner = 0;

    }

}


// ==========================================
// START SLIDER
// ==========================================

changeBanner();


setInterval(
    changeBanner,
    3000
);


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


            // Remove user
            localStorage.removeItem(
                "loggedUser"
            );


            // 🔐 Remove JWT
            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "accessToken"
            );


            localStorage.removeItem(
                "jwtToken"
            );


            alert(
                "Logged Out"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// START APPLICATION
// ==========================================

loadProducts();

loadCartCount();