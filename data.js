// --- Firebase Integration ---
const USE_FIREBASE = typeof firebase !== 'undefined';

// Initial Menu Data (Fallback)
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
    { id: 10, name: "Zinger Cheese", price: 330, category: "Shawarma", description: "Zinger shawarma with melted cheese.", image: "" }
];

const DEFAULT_CONFIG = {
    heroTitle: "Shahbaz <span class=\"highlight\">Bhai</span>",
    heroSubtitle: "Authentic Taste",
    heroDescription: "Experience the finest burgers and shawarmas in town, crafted with passion and premium ingredients.",
    contactPhone: "0312-7631617",
    contactAddress: "E 2 market, WAPDA Town Lahore, Pakistan",
    shopName: "Shahbaz <span class=\"highlight\">Bhai</span>",
    heroImage: "",
    logoImage: ""
};

const DEFAULT_REVIEWS = [
    { name: "Jamal Zahid", rating: 5, text: "Outstanding experience. The food was exceptional; I tried their chicken burger, and I can confidently say it’s the best burger in Lahore." },
    { name: "M. Ilyas Rasheed", rating: 5, text: "Fantastic spot for anyone looking to enjoy delicious fast food without breaking the bank." },
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
    // --- FIREBASE SYNC METHODS ---
    async syncFromFirebase() {
        if (!USE_FIREBASE) return;
        try {
            // 1. Sync Products
            const prodSnap = await db.collection('products').get();
            if (prodSnap.empty) {
                // Cloud is empty! Auto-upload defaults so the user doesn't have to type them
                console.log("Cloud empty, uploading defaults...");
                for (let item of DEFAULT_MENU) {
                    await db.collection('products').doc(item.id.toString()).set(item);
                }
                localStorage.setItem('shahbaz_menu', JSON.stringify(DEFAULT_MENU));
            } else {
                const prods = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                localStorage.setItem('shahbaz_menu', JSON.stringify(prods));
            }

            // 2. Sync Config
            const confSnap = await db.collection('settings').doc('siteConfig').get();
            if (!confSnap.exists) {
                await db.collection('settings').doc('siteConfig').set(DEFAULT_CONFIG);
                localStorage.setItem('shahbaz_config', JSON.stringify(DEFAULT_CONFIG));
            } else {
                localStorage.setItem('shahbaz_config', JSON.stringify(confSnap.data()));
            }
        } catch (e) { console.error("Firebase Sync Error:", e); }
    },

    // --- PRODUCTS ---
    getProducts: function () {
        const stored = localStorage.getItem('shahbaz_menu');
        return stored ? JSON.parse(stored) : DEFAULT_MENU;
    },
    saveProducts: async function (products) {
        localStorage.setItem('shahbaz_menu', JSON.stringify(products));
        if (USE_FIREBASE) {
            // This is a simplified approach: overwriting products in Firebase might be slow
            // Better to update individual docs, but for "Easy" we keep it mirrored
        }
    },
    addProduct: async function (product) {
        // Optimistic UI: Update local first
        if (!product.id) product.id = 'temp_' + Date.now();
        let p = this.getProducts();
        p.push(product);
        localStorage.setItem('shahbaz_menu', JSON.stringify(p));

        if (USE_FIREBASE) {
            const docRef = await db.collection('products').add(product);
            // Replace temp ID with real ID in background
            product.id = docRef.id;
            let list = this.getProducts();
            const idx = list.findIndex(x => x.id === 'temp_' + (product.id.split('_')[1] || ''));
            if (idx !== -1) {
                list[idx].id = docRef.id;
                localStorage.setItem('shahbaz_menu', JSON.stringify(list));
            }
        }
    },
    updateProduct: async function (u) {
        // Update local immediately
        let p = this.getProducts();
        const i = p.findIndex(x => x.id == u.id);
        if (i !== -1) {
            p[i] = u;
            localStorage.setItem('shahbaz_menu', JSON.stringify(p));
        }

        if (USE_FIREBASE) {
            await db.collection('products').doc(u.id.toString()).set(u, { merge: true });
        }
    },
    deleteProduct: async function (id) {
        // Update local immediately
        let p = this.getProducts();
        p = p.filter(x => x.id != id);
        localStorage.setItem('shahbaz_menu', JSON.stringify(p));

        if (USE_FIREBASE) {
            await db.collection('products').doc(id.toString()).delete();
        }
    },

    // --- CONFIG ---
    getConfig: function () {
        const stored = localStorage.getItem('shahbaz_config');
        return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
    },
    saveConfig: async function (c) {
        localStorage.setItem('shahbaz_config', JSON.stringify(c));
        if (USE_FIREBASE) {
            await db.collection('settings').doc('siteConfig').set(c);
        }
    },

    // --- ADMIN PASSWORD ---
    getAdminPassword: function () {
        return localStorage.getItem('shahbaz_admin_pass') || 'admin123';
    },
    saveAdminPassword: function (p) {
        localStorage.setItem('shahbaz_admin_pass', p);
    },

    // --- REVIEWS ---
    getReviews: function () { return DEFAULT_REVIEWS; },

    // --- DELIVERY ---
    getDeliveryFees: function () { return DELIVERY_FEES; },

    // --- ORDERS ---
    getOrders: function () {
        const s = localStorage.getItem('shahbaz_orders');
        return s ? JSON.parse(s) : [];
    },
    saveOrder: async function (o) {
        o.date = new Date().toLocaleString();
        o.status = 'Pending';
        o.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        let list = this.getOrders();

        if (USE_FIREBASE) {
            const docRef = await db.collection('orders').add(o);
            o.id = docRef.id;
        } else {
            o.id = Date.now();
        }

        list.unshift(o);
        localStorage.setItem('shahbaz_orders', JSON.stringify(list));
    },
    deleteOrder: async function (id) {
        if (USE_FIREBASE) await db.collection('orders').doc(id.toString()).delete();
        let list = this.getOrders();
        list = list.filter(o => o.id != id);
        localStorage.setItem('shahbaz_orders', JSON.stringify(list));
    },
    updateOrderStatus: async function (id, s) {
        if (USE_FIREBASE) await db.collection('orders').doc(id.toString()).update({ status: s });
        let list = this.getOrders();
        const i = list.findIndex(o => o.id == id);
        if (i !== -1) {
            list[i].status = s;
            localStorage.setItem('shahbaz_orders', JSON.stringify(list));
        }
    },

    // Real-time listener for orders (Admin only)
    listenToOrders: function (callback) {
        if (!USE_FIREBASE) return;
        db.collection('orders').orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                localStorage.setItem('shahbaz_orders', JSON.stringify(orders));
                callback(orders);
            });
    }
};
