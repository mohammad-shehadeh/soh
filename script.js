// script.js

// بيانات الفئات والمنتجات سيتم استيرادها من data.js
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة المتغيرات
    let currentCategory = null;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // عناصر DOM
    const categoriesContainer = document.getElementById('categories-container');
    const productsContainer = document.getElementById('products-container');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const closeCartBtn = document.querySelector('.close');

    // وظائف إدارة الفئات
    function loadCategories() {
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-card';
            categoryElement.innerHTML = `
                <img src="${category.image}" alt="${category.name}">
                <h3>${category.name}</h3>
            `;
            categoryElement.addEventListener('click', () => filterProductsByCategory(category.name));
            categoriesContainer.appendChild(categoryElement);
        });
    }

    // تصفية المنتجات حسب الفئة
    function filterProductsByCategory(categoryName) {
        currentCategory = categoryName;
        loadProducts();
    }

    // وظائف إدارة المنتجات
    function loadProducts() {
        productsContainer.innerHTML = '';
        const filteredProducts = currentCategory ? 
            products.filter(p => p.category === currentCategory) : 
            products;

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.name}">Add to Cart</button>
            `;
            productCard.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
            productsContainer.appendChild(productCard);
        });
    }

    // وظائف عربة التسوق
    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // تحديث واجهة عربة التسوق
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button class="remove-item" data-index="${index}">&times;</button>
            `;
            li.querySelector('.remove-item').addEventListener('click', () => removeFromCart(index));
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        });
        
        cartTotal.textContent = total.toFixed(2);
    }

    // أحداث الفتح/الإغلاق لعربة التسوق
    document.getElementById('cart-button').addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // إرسال الطلب عبر واتساب
    sendOrderBtn.addEventListener('click', () => {
        const message = cart.map(item => 
            `${item.name} - ${item.quantity} x $${item.price.toFixed(2)}`
        ).join('%0A') + '%0A%0ATotal: $' + cartTotal.textContent;

        window.open(`https://wa.me/972569813333?text=${message}`, '_blank');
    });

    // تهيئة السلايدر
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}
        
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        
        slides[slideIndex-1].style.display = "block";  
        dots[slideIndex-1].className += " active";
        setTimeout(showSlides, 5000); // تغيير الصورة كل 5 ثواني
    }

    // التهيئة الأولية
    loadCategories();
    loadProducts();
    updateCart();

    // أحداث السلايدر اليدوية
    window.plusSlides = function(n) {
        slideIndex += n;
        if (slideIndex > slides.length) {slideIndex = 1}
        if (slideIndex < 1) {slideIndex = slides.length}
        showSlides();
    };

    window.currentSlide = function(n) {
        slideIndex = n;
        showSlides();
    };
});