document.addEventListener("DOMContentLoaded", function () {
    // Initialize Cart
    let cart = [];
    const cartIcon = document.getElementById("cart-icon");
    const cartCount = document.getElementById("cart-count");
    const cartSidebar = document.getElementById("cart-sidebar");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.querySelector(".cart-items");
    const clearCartButton = document.getElementById("clear-cart");
    const checkoutButton = document.getElementById("checkout-button");

    // Open Cart Sidebar on Click
    cartIcon.addEventListener("click", function (e) {
        e.preventDefault();
        cartSidebar.classList.toggle("open");
    });

    // Open Cart Sidebar on Hover
    cartIcon.addEventListener("mouseenter", function () {
        cartSidebar.classList.add("open");
    });

    // Close Cart Sidebar on Mouse Leave
    cartSidebar.addEventListener("mouseleave", function () {
        cartSidebar.classList.remove("open");
    });

    // Close Cart Sidebar on Close Button Click
    closeCart.addEventListener("click", function () {
        cartSidebar.classList.remove("open");
    });

    // Update Cart Count and Button States
    function updateCartUI() {
        // Update cart count
        cartCount.textContent = cart.length;

        // Disable buttons if cart is empty
        if (cart.length === 0) {
            clearCartButton.disabled = true;
            checkoutButton.disabled = true;
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
        } else {
            clearCartButton.disabled = false;
            checkoutButton.disabled = false;
        }
    }

    // Update Cart Display
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = "";
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
        } else {
            cart.forEach((item, index) => {
                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");
                cartItem.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R${item.price.toFixed(2)} | ${item.length}" | ${item.color}</p>
                    </div>
                    <button onclick="removeFromCart(${index})">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }
        updateCartUI();
    }

    // Remove Item from Cart
    window.removeFromCart = function (index) {
        const removedItem = cart.splice(index, 1)[0];
        updateCartDisplay();
        Swal.fire({
            title: "Item Removed",
            text: `${removedItem.name} has been removed from your cart.`,
            icon: "success",
            confirmButtonColor: "#000",
        });
    };

    // Add to Cart Functionality
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const productContainer = button.closest(".product-container");
            const productName = productContainer.querySelector(".product-description h6").innerText;
            const productImage = productContainer.querySelector(".image_main img").src;
            const productPrice = parseFloat(productContainer.querySelector(".price").innerText.replace("R", ""));
            const productLength = productContainer.querySelector(".length-value").innerText.replace(/"/g, "").trim();
            const productColor = productContainer.querySelector(".color-selector").value;

            const item = {
                name: productName,
                image: productImage,
                price: productPrice,
                length: productLength,
                color: productColor,
            };

            cart.push(item);
            updateCartDisplay();

            // SweetAlert for adding to cart
            Swal.fire({
                title: "Added to Cart",
                text: `${item.name} has been added to your cart.`,
                icon: "success",
                confirmButtonColor: "#000",
            });

            // Add animation to the button
            button.classList.add("active");
            setTimeout(() => {
                button.classList.remove("active");
            }, 500);
        });
    });

    // Update Price Based on Length Slider (Even Numbers Only)
    const lengthSliders = document.querySelectorAll(".length-slider");
    lengthSliders.forEach((slider) => {
        slider.addEventListener("input", function () {
            const value = parseInt(slider.value);

            // Ensure the value is even
            if (value % 2 !== 0) {
                slider.value = value + 1; // Round up to the next even number
            }

            // Update the displayed value
            const lengthValue = slider.closest(".product-container").querySelector(".length-value");
            lengthValue.innerHTML = `<strong>${slider.value}"</strong>`;

            // Update the price based on the new value
            const basePrice = parseFloat(slider.closest(".product-container").querySelector(".base-price").getAttribute("data-base-price"));
            const priceElement = slider.closest(".product-container").querySelector(".price");
            const priceMultiplier = slider.value / 16; // Calculate price multiplier based on base length (16")
            const price = basePrice * priceMultiplier; // Calculate new price
            priceElement.textContent = `R${price.toFixed(2)}`;
        });
    });

    // Clear Cart Functionality
    if (clearCartButton) {
        clearCartButton.addEventListener("click", function (e) {
            e.preventDefault();
            if (cart.length === 0) return;

            Swal.fire({
                title: "Clear Cart",
                text: "Are you sure you want to clear your cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#000",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, clear it!",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    cart = []; // Empty the cart array
                    updateCartDisplay(); // Update the cart display
                    Swal.fire({
                        title: "Cart Cleared",
                        text: "Your cart has been cleared.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                }
            });
        });
    }

    // Proceed to Checkout
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function (e) {
            e.preventDefault();
            if (cart.length === 0) {
                Swal.fire({
                    title: "Empty Cart",
                    text: "Your cart is empty. Please add items before checking out.",
                    icon: "info", // Changed to "info" for a softer tone
                    confirmButtonColor: "#000",
                });
                return;
            }

            // Save cart data to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // Redirect to the checkout page
            window.location.href = "checkout.html";
        });
    }

    // Initialize UI on page load
    updateCartUI();
});