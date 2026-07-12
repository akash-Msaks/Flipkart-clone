console.log("checkout.js Loaded");
const cart = JSON.parse(localStorage.getItem("cart")) || [];

let totalItems = 0;
let totalPrice = 0;

cart.forEach(function(product){

    totalItems += product.quantity;

    const price = Number(product.price.replace(/[₹,]/g,""));

    totalPrice += price * product.quantity;

});

document.getElementById("checkoutItems").textContent = totalItems;

document.getElementById("checkoutPrice").textContent =
"₹" + totalPrice.toLocaleString();

document.getElementById("payNowBtn").addEventListener("click",function(){

    alert("🎉 Order Placed Successfully!");

    localStorage.removeItem("cart");

    window.location.href="index.html";

});