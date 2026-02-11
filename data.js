// Initial Menu Data
const DEFAULT_MENU = [
    { id: 1, name: "Zinger Burger", price: 340, category: "Burgers", description: "Crispy fried chicken fillet with lettuce and mayo.", image: "" },
    { id: 2, name: "Zinger Cheese", price: 400, category: "Burgers", description: "Zinger burger topped with a slice of melted cheese.", image: "" },
    { id: 3, name: "Chicken Burger", price: 320, category: "Burgers", description: "Classic chicken patty burger with fresh veggies.", image: "" },
    { id: 4, name: "Chicken Cheese", price: 380, category: "Burgers", description: "Chicken burger with extra cheese.", image: "" },
    { id: 5, name: "Jumbo Burger", price: 370, category: "Burgers", description: "Big appetite? Try our double patty jumbo burger.", image: "" },
    { id: 6, name: "Shami Burger", price: 220, category: "Burgers", description: "Traditional lentil and chicken patty burger (Anda Shami).", image: "" },
    { id: 7, name: "Chicken Shawarma", price: 170, category: "Shawarma", description: "Juicy chicken strips with secret sauce and salad.", image: "" },
    { id: 8, name: "Chicken Cheese", price: 230, category: "Shawarma", description: "Classic shawarma loaded with cheese.", image: "" },
    { id: 9, name: "Zinger Shawarma", price: 270, category: "Shawarma", description: "Crispy zinger pieces wrapped in pita.", image: "" },
    { id: 10, name: "Zinger Cheese", price: 330, category: "Shawarma", description: "Zinger shawarma with melted cheese.", image: "" },
    { id: 11, name: "Chicken Paratha", price: 270, category: "Rolls & Sides", description: "Chicken wrapped in a crispy fried paratha roll.", image: "" },
    { id: 12, name: "Zinger Paratha", price: 330, category: "Rolls & Sides", description: "Crispy zinger wrapped in paratha.", image: "" },
    { id: 13, name: "Fries (Full)", price: 400, category: "Rolls & Sides", description: "Large serving of crispy golden fries.", image: "" },
    { id: 14, name: "Fries (Half)", price: 200, category: "Rolls & Sides", description: "Regular serving of crispy golden fries.", image: "" },
];

const DEFAULT_CONFIG = {
    heroTitle: "Shahbaz <span class=\"highlight\">Bhai</span>",
    heroSubtitle: "Authentic Taste",
    heroDescription: "Experience the finest burgers and shawarmas in town, crafted with passion and premium ingredients.",
    contactPhone: "0312-7631617",
    contactAddress: "E 2 market, WAPDA Town Lahore, Pakistan",
    shopName: "Shahbaz <span class=\"highlight\">Bhai</span>",
    heroImage: "",
    logoImage: "" // New Field
};

const DEFAULT_REVIEWS = [
    { name: "Jamal Zahid", rating: 5, text: "Outstanding experience. The food was exceptional; I tried their chicken burger, and I can confidently say it’s the best burger in Lahore. The flavors were rich, the chicken was perfectly cooked." },
    { name: "M. Ilyas Rasheed", rating: 5, text: "Fantastic spot for anyone looking to enjoy delicious fast food without breaking the bank. Everything from the chicken burger to the shawarma has a well-seasoned, authentic taste." },
    { name: "Rehan Afridi", rating: 4, text: "Good taste cheap and good quality. Service is excellent." }
];

const DELIVERY_FEES = {
    "Wapda Town Phase 1": 50,
    "Wapda Town Phase 2": 100,
    "Valencia Town": 150,
    "Other": 200
};

// Helper Functions
const dataManager = {
    // Products
    getProducts: function () {
        const stored = localStorage.getItem('shahbaz_menu');
        if (!stored) {
            localStorage.setItem('shahbaz_menu', JSON.stringify(DEFAULT_MENU));
            return DEFAULT_MENU;
        }
        return JSON.parse(stored);
    },
    saveProducts: function (products) { localStorage.setItem('shahbaz_menu', JSON.stringify(products)); },
    addProduct: function (product) { let p = this.getProducts(); product.id = Date.now(); p.push(product); this.saveProducts(p); },
    updateProduct: function (u) { let p = this.getProducts(); const i = p.findIndex(x => x.id === u.id); if (i !== -1) { p[i] = u; this.saveProducts(p); } },
    deleteProduct: function (id) { let p = this.getProducts(); p = p.filter(x => x.id !== id); this.saveProducts(p); },

    // Config
    getConfig: function () {
        const stored = localStorage.getItem('shahbaz_config');
        if (!stored) { localStorage.setItem('shahbaz_config', JSON.stringify(DEFAULT_CONFIG)); return DEFAULT_CONFIG; }
        return JSON.parse(stored);
    },
    saveConfig: function (c) { localStorage.setItem('shahbaz_config', JSON.stringify(c)); },

    // Admin Password
    getAdminPassword: function () {
        const stored = localStorage.getItem('shahbaz_admin_pass');
        return stored ? stored : 'admin123';
    },
    saveAdminPassword: function (p) { localStorage.setItem('shahbaz_admin_pass', p); },

    // Reviews
    getReviews: function () { return DEFAULT_REVIEWS; }, // Static for now, can make dynamic later if requested

    // Delivery
    getDeliveryFees: function () { return DELIVERY_FEES; },

    // Orders
    getOrders: function () { const s = localStorage.getItem('shahbaz_orders'); return s ? JSON.parse(s) : []; },
    saveOrder: function (o) { let list = this.getOrders(); o.id = Date.now(); o.date = new Date().toLocaleString(); o.status = 'Pending'; list.unshift(o); localStorage.setItem('shahbaz_orders', JSON.stringify(list)); },
    deleteOrder: function (id) { let list = this.getOrders(); list = list.filter(o => o.id !== id); localStorage.setItem('shahbaz_orders', JSON.stringify(list)); },
    updateOrderStatus: function (id, s) { let list = this.getOrders(); const i = list.findIndex(o => o.id === id); if (i !== -1) { list[i].status = s; localStorage.setItem('shahbaz_orders', JSON.stringify(list)); } }
};
