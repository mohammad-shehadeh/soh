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
                    'Add to Cart';
            });
        },

        showToast: (message) => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
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
            li.querySelector('.decrement').addEventListener('click', () => Cart.decreaseQuantity(index));
            li.querySelector('.increment').addEventListener('click', () => Cart.increaseQuantity(index));
            li.querySelector('.quantity-input').addEventListener('change', (e) => Cart.updateQuantity(index, e.target.value));
            li.querySelector('.remove-item').addEventListener('click', () => Cart.removeItem(index));
            
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
        },

        loadProducts: () => {
            elements.productsContainer.innerHTML = '';
            const filteredProducts = currentCategory ? 
                products.filter(p => p.category === currentCategory) : 
                products;

            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">₪${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.name}"></button>
                `;
                productCard.querySelector('.add-to-cart').addEventListener('click', () => Cart.addItem(product));
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
    let slideIndex = 1;
let slideInterval;

document.addEventListener("DOMContentLoaded", () => {
  // تحميل روابط الصور من advertisement.md
  fetch("advertisement.md")
    .then((response) => response.text())
    .then((data) => {
      const urls = data
        .split("\n")
        .map((line) => line.trim().split("-")[1])
        .filter((url) => url?.startsWith("http"));

      const slideshowContainer = document.querySelector(".slideshow-container");
      const dotsContainer = document.querySelector(".dots-container");

      urls.forEach((url, index) => {
        // إنشاء شريحة
        const slide = document.createElement("div");
        slide.className = "mySlides fade";
        slide.innerHTML = `<img src="${url}" alt="شريحة ${index + 1}" style="width:100%" />`;
        slideshowContainer.appendChild(slide);

        // إنشاء نقطة
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.setAttribute("aria-label", `الشريحة ${index + 1}`);
        dot.setAttribute("onclick", `currentSlide(${index + 1})`);
        dotsContainer.appendChild(dot);
      });

      showSlides(slideIndex);
      startSlideInterval();
      enableTouchAndMouseSwipe(slideshowContainer);
    });

  Products.loadCategories();
  Products.loadProducts();
  Cart.update();
});

// عرض شريحة محددة
function showSlides() {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");

  if (slides.length === 0) return;

  slideIndex = slideIndex > slides.length ? 1 : slideIndex < 1 ? slides.length : slideIndex;

  Array.from(slides).forEach((slide) => (slide.style.display = "none"));
  Array.from(dots).forEach((dot) => dot.classList.remove("active"));

  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].classList.add("active");
}

function plusSlides(n) {
  slideIndex += n;
  showSlides();
}

function currentSlide(n) {
  slideIndex = n;
  showSlides();
}

function startSlideInterval() {
  clearInterval(slideInterval);
  setTimeout(() => {
    plusSlides(1);
    slideInterval = setInterval(() => plusSlides(1), 3000);
  }, 50);
}

// دعم اللمس والفأرة
function enableTouchAndMouseSwipe(container) {
  let startX = 0;
  let isMouseDown = false;

  // للموبايل
  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    handleSwipe(startX, endX);
  });

  // للماوس
  container.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    startX = e.clientX;
  });

  container.addEventListener("mouseup", (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const endX = e.clientX;
    handleSwipe(startX, endX);
  });

  function handleSwipe(start, end) {
    const diff = start - end;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        plusSlides(1); // سحب لليسار
      } else {
        plusSlides(-1); // سحب لليمين
      }
    }
  }
}
    // التهيئة الأولية
    Products.loadCategories();
    Products.loadProducts();
    Cart.update();
    startSlideInterval();
});