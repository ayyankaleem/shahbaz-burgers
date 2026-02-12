document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant Render from Cache (No Lag)
    renderMenu();
    loadSiteConfig();
    renderReviews();
    setupOrderLogic();

    // 2. Background Sync from Cloud
    if (typeof dataManager !== 'undefined' && dataManager.syncFromFirebase) {
        dataManager.syncFromFirebase().then(() => {
            // Refresh with latest data from cloud
            renderMenu();
            loadSiteConfig();
        });
    }
});

let cart = []; // Now stores objects: { product, quantity }

function renderMenu() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';
    const products = dataManager.getProducts();

    const grouped = products.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
    }, {});

    for (const [category, items] of Object.entries(grouped)) {
        const title = document.createElement('h3');
        title.className = 'category-title';
        title.innerHTML = `${category} <span class="highlight">${getCategoryIcon(category)}</span>`;
        menuContainer.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'menu-grid';

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'menu-card';

            let imageContent = `<div class="image-placeholder"><i class="fas fa-utensils"></i></div>`;
            if (product.image && product.image.length > 10) {
                imageContent = `<div class="card-image"><img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;"> <span class="price-tag">Rs. ${product.price}</span></div>`;
            } else {
                let icon = 'fa-utensils';
                if (product.name.toLowerCase().includes('burger')) icon = 'fa-hamburger';
                if (product.name.toLowerCase().includes('shawarma')) icon = 'fa-scroll';
                if (product.name.toLowerCase().includes('fries')) icon = 'fa-french-fries';
                imageContent = `<div class="card-image"><div class="image-placeholder"><i class="fas ${icon}"></i></div><span class="price-tag">Rs. ${product.price}</span></div>`;
            }

            card.innerHTML = `
                ${imageContent}
                <div class="card-content">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <div class="card-footer">
                        <button class="btn-icon" onclick="addToCart(${product.id})"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        menuContainer.appendChild(grid);
    }
}

function getCategoryIcon(category) {
    if (category.includes('Burger')) return '🍔';
    if (category.includes('Shawarma')) return '🌯';
    if (category.includes('Sandwich')) return '🥪';
    if (category.includes('Rolls')) return '🍟';
    return '🍽️';
}

function loadSiteConfig() {
    const config = dataManager.getConfig();
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) heroTitle.innerHTML = config.heroTitle;
    const heroSub = document.querySelector('.hero-content .badge');
    if (heroSub) heroSub.innerText = config.heroSubtitle;
    const heroDesc = document.querySelector('.hero-content p');
    if (heroDesc) heroDesc.innerText = config.heroDescription;
    const footerLogo = document.querySelector('.footer-col h3');
    if (footerLogo) footerLogo.innerHTML = config.shopName;

    if (config.heroImage && config.heroImage.length > 10) {
        const heroImgContainer = document.querySelector('.hero-image');
        if (heroImgContainer) {
            heroImgContainer.innerHTML = `
                <div class="hero-blob"></div>
                <!-- Badge Removed -->
                <img src="${config.heroImage}" class="floating-img" style="width: 100%; max-width: 500px; position: relative; z-index: 2; transform: rotate(-5deg); filter: drop-shadow(0 20px 30px rgba(0,0,0,0.4));" alt="Premium Burger">
            `;
        }
    }

    if (config.logoImage && config.logoImage.length > 10) {
        // Only update Hero Logo Placeholder
        const heroLogo = document.getElementById('hero-logo-placeholder');
        if (heroLogo) {
            heroLogo.innerHTML = `<img src="${config.logoImage}" alt="Logo" style="height: 120px; object-fit: contain; display: block; margin-bottom: 20px;">`;
        }
    }
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return; // Guard clause
    const reviews = dataManager.getReviews();

    container.innerHTML = '';
    reviews.forEach(r => {
        const starCount = r.rating;
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < starCount ? '<i class="fas fa-star" style="color: gold;"></i>' : '<i class="far fa-star"></i>';
        }

        const div = document.createElement('div');
        div.className = 'review-card';
        div.style.cssText = 'background: #1E1E1E; padding: 20px; border-radius: 10px; min-width: 300px; margin-right: 20px; border: 1px solid #333;';
        div.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; color: var(--primary-color);">
                    ${r.name.charAt(0)}
                </div>
                <div>
                    <h4 style="margin: 0; color: #fff;">${r.name}</h4>
                    <span style="font-size: 0.8rem;">${stars}</span>
                </div>
            </div>
            <p style="color: #ccc; font-size: 0.9rem; margin: 0;">"${r.text}"</p>
        `;
        container.appendChild(div);
    });
}

function addToCart(id) {
    const product = dataManager.getProducts().find(p => p.id === id);
    if (product) {
        const existing = cart.find(item => item.product.id === id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ product: product, quantity: 1 });
        }
        updateCartUI();
        // Optional: toast notification
    }
}

function updateCartUI() {
    const fab = document.getElementById('cart-fab');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (count > 0) {
        fab.style.display = 'block';
        document.getElementById('cart-count').innerText = count;
    } else {
        fab.style.display = 'none';
    }
}

function setupOrderLogic() {
    const fab = document.createElement('div');
    fab.id = 'cart-fab';
    fab.style.cssText = 'position: fixed; bottom: 30px; right: 30px; background: var(--primary-color); color: #000; padding: 15px 25px; border-radius: 50px; font-weight: bold; cursor: pointer; display: none; box-shadow: 0 10px 20px rgba(0,0,0,0.3); z-index: 2000;';
    fab.innerHTML = '<i class="fas fa-shopping-cart"></i> View Order (<span id="cart-count">0</span>)';
    fab.onclick = showOrderModal;
    document.body.appendChild(fab);
}

// Global variable for delivery fee
let currentDeliveryFee = 0;

function showOrderModal() {
    const fees = dataManager.getDeliveryFees();
    currentDeliveryFee = fees['Wapda Town Phase 1']; // Default

    // Logic to calculate total
    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        return subtotal + currentDeliveryFee;
    }

    const renderCartItems = () => {
        return cart.map((item, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                <div>
                    <span style="color: #fff;">${item.product.name}</span>
                    <br><span style="font-size: 0.8rem; color: #888;">Rs. ${item.product.price} x ${item.quantity}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateQty(${index}, -1)" style="background: #444; color: white; border: none; width: 25px; height: 25px; border-radius: 5px;">-</button>
                    <span style="color: var(--primary-color); font-weight: bold;">${item.quantity}</span>
                    <button onclick="updateQty(${index}, 1)" style="background: var(--primary-color); color: black; border: none; width: 25px; height: 25px; border-radius: 5px;">+</button>
                </div>
            </div>
        `).join('');
    };

    const areasOptions = Object.keys(fees).map(area =>
        `<option value="${area}" ${area === 'Wapda Town Phase 1' ? 'selected' : ''}>${area} (+Rs. ${fees[area]})</option>`
    ).join('');

    const modalHTML = `
        <div id="order-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1E1E1E; padding: 25px; border-radius: 15px; width: 90%; max-width: 450px; color: #fff; max-height: 90vh; overflow-y: auto;">
                <h2 style="color: var(--primary-color); margin-top:0;">Your Bag</h2>
                
                <div id="modal-items-list" style="background: #252525; padding: 10px; border-radius: 5px; margin-bottom: 15px; max-height: 150px; overflow-y: auto;">
                    ${renderCartItems()}
                </div>

                <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <label>Delivery Area:</label>
                    <select id="delivery-area" onchange="updateDeliveryFee(this)" style="padding: 5px; background: #333; color: white; border: 1px solid #444; border-radius: 5px;">
                        ${areasOptions}
                    </select>
                </div>

                <div style="background: #252525; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <p style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>Rs. ${calculateTotal() - currentDeliveryFee}</span></p>
                    <p style="display: flex; justify-content: space-between;"><span>Delivery:</span> <span id="delivery-display" style="color: orange;">Rs. ${currentDeliveryFee}</span></p>
                    <hr style="border-color: #444;">
                    <p style="display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 5px; color: var(--primary-color);">
                        <strong>Total:</strong> <strong id="total-display">Rs. ${calculateTotal()}</strong>
                    </p>
                </div>
                
                <input type="text" id="ord-name" placeholder="Your Name" style="width: 100%; padding: 10px; margin-bottom: 10px; background: #333; border: 1px solid #444; color: white; border-radius: 5px;">
                <input type="text" id="ord-phone" placeholder="Phone Number" style="width: 100%; padding: 10px; margin-bottom: 10px; background: #333; border: 1px solid #444; color: white; border-radius: 5px;">
                <input type="text" id="ord-address" placeholder="Delivery Address" style="width: 100%; padding: 10px; margin-bottom: 15px; background: #333; border: 1px solid #444; color: white; border-radius: 5px;">
                <textarea id="ord-msg" placeholder="Special Instructions..." rows="2" style="width: 100%; padding: 10px; margin-bottom: 20px; background: #333; border: 1px solid #444; color: white; border-radius: 5px;"></textarea>

                <div style="display: flex; gap: 10px;">
                    <button onclick="submitOrder()" class="btn btn-primary" style="flex: 1;">Place Order</button>
                    <button onclick="closeModal()" class="btn btn-outline" style="flex: 1;">Cancel</button>
                </div>
            </div>
        </div>
    `;

    const existing = document.getElementById('order-modal');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div);
}

// Expose helper to window for inline onclick
window.updateQty = function (index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
    if (cart.length === 0) closeModal();
    else showOrderModal(); // Re-render modal
};

window.updateDeliveryFee = function (selectInfo) {
    const fees = dataManager.getDeliveryFees();
    currentDeliveryFee = fees[selectInfo.value];

    // Recalculate
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal + currentDeliveryFee;

    document.getElementById('delivery-display').innerText = `Rs. ${currentDeliveryFee}`;
    document.getElementById('total-display').innerText = `Rs. ${total}`;
};

function closeModal() {
    const m = document.getElementById('order-modal');
    if (m) m.remove();
}

function submitOrder() {
    const name = document.getElementById('ord-name').value;
    const phone = document.getElementById('ord-phone').value;
    const address = document.getElementById('ord-address').value;
    const message = document.getElementById('ord-msg').value;
    const area = document.getElementById('delivery-area').value;

    if (!name || !phone || !address) { alert('Please fill details!'); return; }

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const order = {
        customerName: name,
        phone: phone,
        address: `${address} (${area})`,
        message: message,
        items: cart.map(i => `${i.product.name} x${i.quantity}`).join(', '),
        total: subtotal + currentDeliveryFee
    };

    dataManager.saveOrder(order);
    alert('Thank you! Your order has been placed.');
    cart = [];
    updateCartUI();
    closeModal();
}
