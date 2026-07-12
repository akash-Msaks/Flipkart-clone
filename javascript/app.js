// ==========================
// LOGIN CHECK
// ==========================

const loginSection = document.getElementById("loginSection");

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if(loggedUser){

loginSection.innerHTML=`

<span class="user-name">

👤 ${loggedUser.name}

</span>

<button id="logoutBtn">

Logout

</button>

`;

}
// ---------------- SEARCH ----------------

const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll(".product-card");

searchInput.addEventListener("keyup", function () {

    let searchValue = searchInput.value.toLowerCase();

    productCards.forEach(function(card){

        let productName = card.querySelector("h3").textContent.toLowerCase();

        if(productName.includes(searchValue)){
            card.style.display = "flex";
        }
        else{
            card.style.display = "none";
        }

    });

});


// ---------------- CART ----------------

// ---------------- CART ----------------

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartCount = cart.length;

const cartButtons = document.querySelectorAll(".cart-btn");
const cartCounter = document.getElementById("cartCount");

// Show saved cart count when page loads
cartCounter.textContent = cartCount;

cartButtons.forEach(function(button){

    button.addEventListener("click", function(){

        // Increase cart count
        cartCount++;
        cartCounter.textContent = cartCount;

        // Get current product card
        const productCard = button.parentElement;

        // Get product details
        const productName = productCard.querySelector("h3").textContent;
        const productPrice = productCard.querySelector("p").textContent;
        const productImage = productCard.querySelector("img").src;

        // Create product object
        const existingProduct = cart.find(function(item){
    return item.name === productName;
});

if(existingProduct){
    existingProduct.quantity++;
}
else{
    const product = {
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
    };

    cart.push(product);
}

localStorage.setItem("cart", JSON.stringify(cart));
cartCounter.textContent = cart.reduce(function(total, item){
    return total + item.quantity;
}, 0);
// ---------------- HERO SLIDER ----------------
});
});
const banners = [
    {
        image: "./images/mobile2.jpg",
        title: "Big Billion Days",
        text: "Up to 80% OFF on Mobiles, Electronics and Fashion"
    },
    {
        image: "./images/laptop.jpg",
        title: "Laptop Sale",
        text: "Up to 50% OFF on Laptops"
    },
    {
        image: "./images/headphone.jpg",
        title: "Electronics Festival",
        text: "Best Deals on Electronics"
    }
];

const heroImage = document.querySelector(".hero-right img");
const heroTitle = document.querySelector(".hero-left h1");
const heroText = document.querySelector(".hero-left p");

let currentBanner = 0;

function changeBanner() {

    heroImage.src = banners[currentBanner].image;
    heroTitle.textContent = banners[currentBanner].title;
    heroText.textContent = banners[currentBanner].text;

    currentBanner++;

    if (currentBanner >= banners.length) {
        currentBanner = 0;
    }
}

changeBanner();

setInterval(changeBanner, 3000);
// ==========================
// LOGOUT
// ==========================

const logoutBtn=document.getElementById("logoutBtn");

if(logoutBtn){

logoutBtn.addEventListener("click",function(){

localStorage.removeItem("loggedUser");

alert("Logged Out");

window.location.reload();

});

}