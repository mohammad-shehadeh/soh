// Data from Server.md and Category.md would be loaded here
// For this example, we'll use sample data

// Sample categories data (would come from Category.md)
const categories = [
    { name: "Ceiling Lights", image: "https://via.placeholder.com/80x80?text=Ceiling+Lights" },
    { name: "Wall Lights", image: "https://via.placeholder.com/80x80?text=Wall+Lights" },
    { name: "Table Lamps", image: "https://via.placeholder.com/80x80?text=Table+Lamps" },
    { name: "Floor Lamps", image: "https://via.placeholder.com/80x80?text=Floor+Lamps" },
    { name: "Outdoor Lighting", image: "https://via.placeholder.com/80x80?text=Outdoor+Lighting" },
    { name: "Smart Lighting", image: "https://via.placeholder.com/80x80?text=Smart+Lighting" },
    { name: "LED Strips", image: "https://via.placeholder.com/80x80?text=LED+Strips" },
    { name: "Chandeliers", image: "https://via.placeholder.com/80x80?text=Chandeliers" }
];

// Sample products data (would come from Server.md)
const products = [
    {
        category: "Ceiling Lights",
        name: "Modern Flush Mount",
        price: 89.99,
        image: "https://via.placeholder.com/300x200?text=Modern+Flush+Mount"
    },
    {
        category: "Ceiling Lights",
        name: "Crystal Chandelier",
        price: 199.99,
        image: "https://via.placeholder.com/300x200?text=Crystal+Chandelier"
    },
    {
        category: "Wall Lights",
        name: "Sconce Wall Light",
        price: 49.99,
        image: "https://via.placeholder.com/300x200?text=Sconce+Wall+Light"
    },
    {
        category: "Table Lamps",
        name: "Ceramic Table Lamp",
        price: 59.99,
        image: "https://via.placeholder.com/300x200?text=Ceramic+Table+Lamp"
    },
    {
        category: "Floor Lamps",
        name: "Arc Floor Lamp",
        price: 129.99,
        image: "https://via.placeholder.com/300x200?text=Arc+Floor+Lamp"
    },
    {
        category: "Outdoor Lighting",
        name: "Weatherproof Wall Light",
        price: 79.99,
        image: "https://via.placeholder.com/300x200?text=Weatherproof+Wall+Light"
    },
    {
        category: "Smart Lighting",
        name: "Wi-Fi Smart Bulb",
        price: 24.99,
        image: "https://via.placeholder.com/300x200?text=Wi-Fi+Smart+Bulb"
    },
    {
        category: "LED Strips",
        name: "RGB LED Strip",
        price: 29.99,
        image: "https://via.placeholder.com/300x200?text=RGB+LED+Strip"
    }
];

// Shopping cart
let cart = [];

// DOM elements
const categoriesContainer = document.getElementById('categories-container');
const productsContainer = document.getElementById('products-container');
const productsTitle = document.getElementById('products-title');
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');
const sendOrderBtn = document.getElementById('send-order-btn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadProducts();
    initSlideshow();
    
    // Event listeners
    cartButton.addEventListener('click', openCartModal);
    closeModal.addEventListener('click', closeCartModal);
    sendOrderBtn.addEventListener('click', sendOrderViaWhatsApp);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCartModal();
        }
    });
});

// Load categories
function loadCategories() {
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <img src="${category.image}" alt="${category.name}" class="category-img">
            <div class="category-name">${category.name}</div>
        `;
        categoryElement.addEventListener('click', () => filterProductsByCategory(category.name));
        categoriesContainer.appendChild(categoryElement);
    });
}

// Load all products or filtered by category
function loadProducts(category = null) {
    productsContainer.innerHTML = '';
    
    let filteredProducts = category 
        ? products.filter(product => product.category === category)
        : products;
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="add-to-cart" data-product='${JSON.stringify(product)}'>Add to Cart</button>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.nextElementSibling;
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.value = parseInt(input.value) + 1;
        });
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = JSON.parse(this.getAttribute('data-product'));
            const quantity = parseInt(this.parentElement.querySelector('.quantity-input').value);
            addToCart(product, quantity);
        });
    });
}

// Filter products by category
function filterProductsByCategory(category) {
    productsTitle.textContent = category;
    loadProducts(category);
}

// Add product to cart
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.product.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ product, quantity });
    }
    
    updateCartCount();
    showCartNotification();
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Show cart notification
function showCartNotification() {
    cartButton.classList.add('pulse');
    setTimeout(() => {
        cartButton.classList.remove('pulse');
    }, 500);
}

// Open cart modal
function openCartModal() {
    renderCartItems();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close cart modal
function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Render cart items
function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalPrice.textContent = '0.00';
        return;
    }
    
    let totalPrice = 0;
    
    cart.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn plus">+</button>
                    <span class="remove-item"><i class="fas fa-trash"></i></span>
                </div>
            </div>
        `;
        
        // Add event listeners to quantity buttons
        const minusBtn = cartItemElement.querySelector('.quantity-btn.minus');
        const plusBtn = cartItemElement.querySelector('.quantity-btn.plus');
        const quantityInput = cartItemElement.querySelector('.quantity-input');
        const removeBtn = cartItemElement.querySelector('.remove-item');
        
        minusBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                quantityInput.value = item.quantity;
                renderCartItems();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            item.quantity++;
            quantityInput.value = item.quantity;
            renderCartItems();
        });
        
        quantityInput.addEventListener('change', () => {
            const newQuantity = parseInt(quantityInput.value);
            if (newQuantity >= 1) {
                item.quantity = newQuantity;
                renderCartItems();
            }
        });
        
        removeBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            renderCartItems();
            updateCartCount();
        });
        
        cartItemsContainer.appendChild(cartItemElement);
        totalPrice += item.product.price * item.quantity;
    });
    
    cartTotalPrice.textContent = totalPrice.toFixed(2);
}

// Send order via WhatsApp
function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    let message = 'Hello Lighting Store,\n\nI would like to order the following items:\n\n';
    
    cart.forEach(item => {
        message += `- ${item.product.name} (Qty: ${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\nTotal: $${cart.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}\n\n`;
    message += 'Please let me know the next steps. Thank you!';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/972569813333?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Slideshow functionality
function initSlideshow() {
    let slideIndex = 1;
    showSlides(slideIndex);
    
    window.plusSlides = function(n) {
        showSlides(slideIndex += n);
    };
    
    window.currentSlide = function(n) {
        showSlides(slideIndex = n);
    };
    
    function showSlides(n) {
        let i;
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        
        if (n > slides.length) { slideIndex = 1; }
        if (n < 1) { slideIndex = slides.length; }
        
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        
        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].className += " active";
    }
    
    // Auto slide change every 5 seconds
    setInterval(() => {
        plusSlides(1);
    }, 5000);
}
