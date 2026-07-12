const cartItems = document.getElementById("cartItems");
const cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.forEach(function(product, index){

    const card = document.createElement("div");

    card.classList.add("cart-card");

   card.innerHTML = `
    <img src="${product.image}">

    <div class="cart-details">
        <h2>${product.name}</h2>

        <p class="cart-price">${product.price}</p>

        <div class="quantity-box">

    <button class="minus-btn" data-index="${index}">-</button>

    <span>${product.quantity}</span>

    <button class="plus-btn" data-index="${index}">+</button>

   </div>

        <button class="remove-btn" data-index="${index}">
            Remove
        </button>
    </div>
`;

    cartItems.appendChild(card);

});
const plusButtons = document.querySelectorAll(".plus-btn");

plusButtons.forEach(function(button){

    button.addEventListener("click", function(){

        const index = button.dataset.index;

        cart[index].quantity++;

        localStorage.setItem("cart", JSON.stringify(cart));

        location.reload();

    });

});

const minusButtons = document.querySelectorAll(".minus-btn");

minusButtons.forEach(function(button){

    button.addEventListener("click", function(){

        const index = button.dataset.index;

        if(cart[index].quantity > 1){

    cart[index].quantity--;

}

        localStorage.setItem("cart", JSON.stringify(cart));

        location.reload();

    });

});

const removeButtons = document.querySelectorAll(".remove-btn");
let totalItems = 0;

let totalPrice = 0;

cart.forEach(function(product){

    totalItems += product.quantity;

    const price = Number(product.price.replace(/[₹,]/g,""));

    totalPrice += price * product.quantity;

});

document.getElementById("totalItems").textContent = totalItems;

document.getElementById("totalPrice").textContent =
"₹" + totalPrice.toLocaleString();

document.getElementById("grandTotal").textContent =
"₹" + totalPrice.toLocaleString();

removeButtons.forEach(function(button){

    button.addEventListener("click", function(){

        const index = button.dataset.index;

        // 👇 REMOVE THE PRODUCT
        cart.splice(index, 1);

        // Save updated cart
        localStorage.setItem("cart", JSON.stringify(cart));

        // Reload page
        location.reload();

    });

});