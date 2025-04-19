// script.js

document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = null;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // عناصر DOM
    const elements = {
        categoriesContainer: document.getElementById('categories-container'),
        productsContainer: document.getElementById('products-container'),
        cartCount: document.getElementById('cart-count'),
        cartModal: document.getElementById('cart-modal'),
        cartItems: document.getElementById('cart-items'),
        cartTotal: document.getElementById('cart-total-price'),
        sendOrderBtn: document.getElementById('send-order-btn'),
        closeCartBtn: document.querySelector('.close'),
        cartButton: document.getElementById('cart-button')
    };

    // تهيئة السلايدر
    let slideIndex = 0;
    let slideInterval;

    // وظائف إدارة الواجهة
  const UI = {
    updateAddToCartButtons: () => {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            const productName = button.dataset.id;
            const cartItem = cart.find(item => item.name === productName);
            button.innerHTML = cartItem ? 
                `<span class="quantity-controls">
                    <button class="decrement">-</button>
                    <span class="quantity">${cartItem.quantity}</span>
                    <button class="increment">+</button>
                </span>` : 
                'إضافة للسلة';
            
            // إعادة ربط الأحداث للأزرار الجديدة
            if (cartItem) {
                button.querySelector('.decrement').addEventListener('click', (e) => {
                    e.stopPropagation();
                    Cart.decreaseQuantity(cart.indexOf(cartItem));
                });
                
                button.querySelector('.increment').addEventListener('click', (e) => {
                    e.stopPropagation();
                    Cart.increaseQuantity(cart.indexOf(cartItem));
                });
            }
        });
    },

    showToast: (message) => {
    // تحويل الرسائل الإنجليزية إلى العربية
    const arabicMessages = {
        'added': 'تمت الإضافة إلى السلة',
        'removed': 'تم الحذف من السلة',
        'added to cart': 'تمت الإضافة إلى السلة',
        'removed from cart': 'تم الحذف من السلة'
    };

    // إذا كانت الرسالة موجودة في القاموس، نستخدم الترجمة العربية، وإلا نستخدم الرسالة كما هي
    const toastMessage = arabicMessages[message.toLowerCase()] || message;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = toastMessage;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }, 100);
},

    createCartItemElement: (item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="price-controls">
                    <div class="quantity-controls">
                        <button class="decrement">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                        <button class="increment">+</button>
                    </div>
                    <p class="item-total">₪${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
            <button class="remove-item">&times;</button>
        `;
        
        // إضافة الأحداث
        li.querySelector('.decrement').addEventListener('click', () => {
            Cart.decreaseQuantity(index);
        });
        
        li.querySelector('.increment').addEventListener('click', () => {
            Cart.increaseQuantity(index);
        });
        
        li.querySelector('.quantity-input').addEventListener('change', (e) => {
            Cart.updateQuantity(index, parseInt(e.target.value));
        });
        
        li.querySelector('.remove-item').addEventListener('click', () => {
            Cart.removeItem(index);
        });
        
        return li;
    }
};

    // وظائف عربة التسوق
    const Cart = {
        addItem: (product) => {
            const existingItem = cart.find(item => item.name === product.name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            Cart.update();
            UI.showToast(`${product.name} added to cart`);
        },

        removeItem: (index) => {
            const itemName = cart[index].name;
            cart.splice(index, 1);
            Cart.update();
            UI.showToast(`${itemName} removed from cart`);
        },

        increaseQuantity: (index) => {
            cart[index].quantity++;
            Cart.update();
        },

        decreaseQuantity: (index) => {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        Cart.update();
    } else {
        Cart.removeItem(index);
    }
},

        updateQuantity: (index, newQuantity) => {
            newQuantity = Math.max(1, parseInt(newQuantity) || 1);
            cart[index].quantity = newQuantity;
            Cart.update();
        },

        update: () => {
            localStorage.setItem('cart', JSON.stringify(cart));
            elements.cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            // تحديث واجهة السلة
            elements.cartItems.innerHTML = '';
            let total = 0;
            
            cart.forEach((item, index) => {
                elements.cartItems.appendChild(UI.createCartItemElement(item, index));
                total += item.price * item.quantity;
            });
            
            elements.cartTotal.textContent = total.toFixed(2);
            UI.updateAddToCartButtons();
        }
    };

    // وظائف المنتجات
    const Products = {
        loadCategories: () => {
            elements.categoriesContainer.innerHTML = '';
            categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category-card';
                categoryElement.innerHTML = `
                    <img src="${category.image}" alt="${category.name}">
                    <h3>${category.name}</h3>
                `;
                categoryElement.addEventListener('click', () => Products.filterByCategory(category.name));
                elements.categoriesContainer.appendChild(categoryElement);
            });
        },

        filterByCategory: (categoryName) => {
    currentCategory = categoryName;
    Products.loadProducts();
    
    setTimeout(() => {
        const firstProduct = document.querySelector('.product-card:first-child');
        if (firstProduct) {
            const yOffset = 50;
            const y = firstProduct.getBoundingClientRect().top + window.pageYOffset - yOffset;
            
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    }, 100);
},

        loadProducts: () => {
    elements.productsContainer.innerHTML = '';
    const filteredProducts = currentCategory ? 
        products.filter(p => p.category === currentCategory) : 
        products;

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const isAvailable = product.price > 0;
        const buttonText = isAvailable ? '' : 'غير متوفر';
        const buttonClass = isAvailable ? 'add-to-cart' : 'add-to-cart unavailable';
        
        productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p class="price ${isAvailable ? '' : 'unavailable'}" ${isAvailable ? '' : 'data-unavailable="true"'}>
        ${isAvailable ? `₪${product.price.toFixed(2)}` : 'غير متوفر حالياً'}
    </p>
    <button class="${buttonClass}" data-id="${product.name}" ${isAvailable ? '' : 'disabled'}>${buttonText}</button>
`;
        
        if (isAvailable) {
            productCard.querySelector('.add-to-cart').addEventListener('click', () => Cart.addItem(product));
        }
        
        elements.productsContainer.appendChild(productCard);
    });
    
    UI.updateAddToCartButtons();
}
    };

    // أحداث السلة
    elements.cartButton.addEventListener('click', () => {
        elements.cartModal.style.display = 'block';
        clearInterval(slideInterval);
    });

    elements.closeCartBtn.addEventListener('click', () => {
        elements.cartModal.style.display = 'none';
        startSlideInterval();
    });

    window.addEventListener('click', (e) => {
        if (e.target === elements.cartModal) {
            elements.cartModal.style.display = 'none';
            startSlideInterval();
        }
    });

    // إرسال الطلب عبر واتساب
    elements.sendOrderBtn.addEventListener('click', () => {
    const now = new Date();
    const date = now.toLocaleDateString('ar-EG');
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const itemsList = cart.map((item, index) => 
        `🔹 *${index + 1}. ${item.name}*\n` +
        `   - الكمية: ${item.quantity}\n` +
        `   - السعر: ₪${item.price.toFixed(2)}\n` +
        `   - الإجمالي: ₪${(item.price * item.quantity).toFixed(2)}`
    ).join('\n\n');

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const message = encodeURIComponent(
        `*⭐ معرض أبو عالية ⭐*\n` +
        `────────────────────────────\n` +
        `🗓️ *التاريخ:* ${date}\n` +
        `⏰ *الوقت:* ${time}\n` +
        `────────────────────────────\n` +
        `*تفاصيل الطلب:*\n\n` +
        `${itemsList}\n\n` +
        `💰 *المجموع الكلي:* ₪${totalAmount.toFixed(2)}\n` +
        `────────────────────────────\n` +
        `*الاسم:* ____________________\n` +
        `*العنوان:* __________________\n` +
        `*طريقة الدفع:* ______________\n` +
        `*ملاحظات:* _________________`
    );

    window.open(`https://wa.me/972569813333?text=${message}`, '_blank');
});

    // وظائف السلايدر
    function startSlideInterval() {
    // تغيير أول صورة بعد 500 مللي ثانية
    setTimeout(() => {
        plusSlides(1); // التبديل الأول
        // بعد التبديل الأول، نبدأ التبديل كل 2000 مللي ثانية
        slideInterval = setInterval(() => plusSlides(1), 3000);
    }, 50);
}

    function plusSlides(n) {
        slideIndex += n;
        showSlides();
    }

    function currentSlide(n) {
        slideIndex = n;
        showSlides();
    }

    function showSlides() {
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        
        slideIndex = slideIndex > slides.length ? 1 : slideIndex < 1 ? slides.length : slideIndex;
        
        Array.from(slides).forEach(slide => slide.style.display = "none");
        Array.from(dots).forEach(dot => dot.classList.remove("active"));
        
        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].classList.add("active");
    }

    // التهيئة الأولية
    Products.loadCategories();
    //Products.loadProducts();
    Cart.update();
    startSlideInterval();
});

 