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

// Shopping cart
let cart = [];
let categories = [];
let products = [];

// Strings for multilingual support
const strings = {
    addToCart: 'أضف إلى السلة',
    currency: 'د.إ',
    emptyCart: 'عربة التسوق فارغة',
    noCategories: 'لا توجد تصنيفات متاحة',
    noProducts: 'لا توجد منتجات في هذا التصنيف',
    confirmSend: 'هل تريد إرسال الطلب الآن؟',
    alertEmptyCart: 'عربة التسوق فارغة!',
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        fetch('Category.json').then(res => res.json()),
        fetch('Server.json').then(res => res.json())
    ])
    .then(([categoryData, productData]) => {
        categories = categoryData.categories || [];
        products = productData.products || [];

        loadCategories();
        loadProducts();
        if (document.getElementsByClassName("mySlides").length > 0) {
            initSlideshow();
        }
    })
    .catch(error => {
        console.error('Error loading data:', error);
        categoriesContainer.innerHTML = `<p>${strings.noCategories}</p>`;
        productsContainer.innerHTML = `<p>${strings.noProducts}</p>`;
    });

    cartButton.addEventListener('click', openCartModal);
    closeModal.addEventListener('click', closeCartModal);
    sendOrderBtn.addEventListener('click', sendOrderViaWhatsApp);

    window.addEventListener('click', function (event) {
        if (event.target === cartModal) {
            closeCartModal();
        }
    });
});

function loadCategories() {
    categoriesContainer.innerHTML = '';

    if (!categories || categories.length === 0) {
        categoriesContainer.innerHTML = `<p>${strings.noCategories}</p>`;
        return;
    }

    categories.forEach(category => {
        const el = document.createElement('div');
        el.className = 'category-item';
        el.innerHTML = `
            <img src="${category.image}" alt="${category.name}" class="category-img">
            <div class="category-name">${category.name}</div>
        `;
        el.addEventListener('click', () => filterProductsByCategory(category.name));
        categoriesContainer.appendChild(el);
    });
}

function loadProducts(category = null) {
    productsContainer.innerHTML = '';

    const filtered = category ? products.filter(p => p.category === category) : products;

    if (filtered.length === 0) {
        productsContainer.innerHTML = `<p>${strings.noProducts}</p>`;
        return;
    }

    filtered.forEach(product => {
        const el = document.createElement('div');
        el.className = 'product-card';
        el.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${strings.currency} ${product.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="add-to-cart" data-product='${JSON.stringify(product)}'>${strings.addToCart}</button>
            </div>
        `;
        productsContainer.appendChild(el);
    });

    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.nextElementSibling;
            if (parseInt(input.value) > 1) input.value--;
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            input.value = parseInt(input.value) + 1;
        });
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            const product = JSON.parse(this.dataset.product);
            const quantity = parseInt(this.closest('.product-card').querySelector('.quantity-input').value);
            addToCart(product, quantity);
        });
    });
}

function filterProductsByCategory(category) {
    productsTitle.textContent = category;
    loadProducts(category);
}

function addToCart(product, quantity) {
    const existing = cart.find(item => item.product.name === product.name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ product, quantity });
    }

    updateCartCount();
    showCartNotification();
}

function updateCartCount() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function showCartNotification() {
    cartButton.classList.add('pulse');
    setTimeout(() => cartButton.classList.remove('pulse'), 500);
}

function openCartModal() {
    renderCartItems();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p>${strings.emptyCart}</p>`;
        cartTotalPrice.textContent = '0.00';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">${strings.currency} ${(item.product.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn plus">+</button>
                    <span class="remove-item"><i class="fas fa-trash"></i></span>
                </div>
            </div>
        `;

        const minusBtn = el.querySelector('.quantity-btn.minus');
        const plusBtn = el.querySelector('.quantity-btn.plus');
        const quantityInput = el.querySelector('.quantity-input');
        const removeBtn = el.querySelector('.remove-item');

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
            const val = parseInt(quantityInput.value);
            if (val >= 1) {
                item.quantity = val;
                renderCartItems();
            }
        });

        removeBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            renderCartItems();
            updateCartCount();
        });

        cartItemsContainer.appendChild(el);
        total += item.product.price * item.quantity;
    });

    cartTotalPrice.textContent = total.toFixed(2);
}

function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert(strings.alertEmptyCart);
        return;
    }

    if (!confirm(strings.confirmSend)) return;

    let message = 'مرحبًا، أرغب في طلب المنتجات التالية:\n\n';

    cart.forEach(item => {
        message += `- ${item.product.name} (الكمية: ${item.quantity}) - ${strings.currency} ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\nالإجمالي: ${strings.currency} ${total.toFixed(2)}\n\nالرجاء تأكيد الطلب، وشكرًا.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/972569813333?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
}

// Slideshow
function initSlideshow() {
    let slideIndex = 1;
    showSlides(slideIndex);

    window.plusSlides = function (n) {
        showSlides(slideIndex += n);
    };

    window.currentSlide = function (n) {
        showSlides(slideIndex = n);
    };

    function showSlides(n) {
        let slides = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("dot");

        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length;

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }

    setInterval(() => plusSlides(1), 5000);
}