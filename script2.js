 // DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products");
    const cartPanel = document.getElementById("cart-panel");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartBtn = document.getElementById("cart-button");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const cartCount = document.getElementById("cart-count");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const filterBtn = document.getElementById("filter-btn");
    const filterDropdown = document.getElementById("filter-dropdown");
    const filterCategories = document.getElementById("filter-categories");
    const wishlistPanel = document.getElementById("wishlist-panel");
    const wishlistOverlay = document.getElementById("wishlist-overlay");
    const wishlistBtn = document.getElementById("wishlist-btn");
    const closeWishlistBtn = document.getElementById("close-wishlist");
    const wishlistItemsContainer = document.getElementById("wishlist-items");
    const wishlistCount = document.getElementById("wishlist-count");
    const categoryTabsContainer = document.getElementById("categoryTabs");
     const historyBtn = document.getElementById("history-btn");
    const historyPanel = document.getElementById("history-panel");
    const historyOverlay = document.getElementById("history-overlay");
    const closeHistoryBtn = document.getElementById("close-history");
    const historyItemsContainer = document.getElementById("history-items");

    // State
    let products = [];
    let cart = JSON.parse(localStorage.getItem("cart")) || {};
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    let currentCategory = "all";
    let uniqueCategories = [];
    let activeTab = null; // Track the active tab

    // Initialize
    fetchProducts();
renderHistory();
    // Add event listeners
    cartBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    checkoutBtn.addEventListener("click", checkout);
    cartOverlay.addEventListener("click", closeCart);
    wishlistBtn.addEventListener("click", openWishlist);
    closeWishlistBtn.addEventListener("click", closeWishlist);
    wishlistOverlay.addEventListener("click", closeWishlist);
     historyBtn.addEventListener("click", openHistory);
    closeHistoryBtn.addEventListener("click", closeHistory);
    historyOverlay.addEventListener("click", closeHistory);
    
    // Search button functionality
    searchBtn.addEventListener("click", () => {
        handleSearch();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    // Filter button dropdown
    filterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle("hidden");
        
        if (!filterDropdown.classList.contains("hidden")) {
            // Refresh categories when opening
            populateFilterDropdown();
        }
    });

    // Close filter dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add("hidden");
        }
    });

    // Initialize counters
    updateCartCounter();
    updateWishlistCounter();
    renderCart();
    renderWishlist();

    // Fetch products from dummyjson
    async function fetchProducts() {
        try {
            const response = await fetch("https://dummyjson.com/products?limit=100");

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            // Process products - add sale info for demo purposes
            products = data.products.map((product) => ({
                ...product,
                salepercentage: Math.floor(Math.random() * 30) + 10, // Random 10-40% off
                previousprice: (product.price * 1.3).toFixed(2), // Add 30% for "original" price
                discount: (product.price * 0.3).toFixed(2), // Calculate discount
            }));

            // Extract unique categories for filter dropdown and category tabs
            uniqueCategories = [...new Set(products.map(product => product.category))];
            populateFilterDropdown();
            populateCategoryTabs();
            
            // Set "All Products" tab as active by default
            const allTab = document.querySelector('.category-tab[data-category="all"]');
            if (allTab) {
                activeTab = allTab; // Set the active tab
                allTab.classList.add("bg-sky-600", "text-white");
                allTab.classList.remove("bg-slate-100", "hover:bg-sky-100");
                
                const span = allTab.querySelector("span");
                if (span) {
                    span.classList.add("text-white");
                    span.classList.remove("text-neutral-800");
                }
            }
            
            renderProducts();
        } catch (error) {
            console.error("Error fetching products:", error);
            productsContainer.innerHTML =
                '<p class="text-center text-gray-500">Error loading products. Please try again later.</p>';
        }
    }

    // Populate category tabs based on API data
    function populateCategoryTabs() {
        // Keep the "All Products" tab and add the rest dynamically
        const allProductsTab = categoryTabsContainer.querySelector('[data-category="all"]');
        categoryTabsContainer.innerHTML = '';
        categoryTabsContainer.appendChild(allProductsTab);
        
        // Add tabs for each unique category
        uniqueCategories.forEach(category => {
            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
            
            const tab = document.createElement('div');
            tab.className = 'category-tab px-3.5 py-2 bg-slate-100 hover:bg-sky-100 rounded-2xl flex items-center gap-1.5 shrink-0 cursor-pointer';
            tab.dataset.category = category;
            tab.innerHTML = `
                <span class="text-neutral-800 text-sm font-medium font-sans leading-none">${formattedCategory}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    class="w-5 h-5 stroke-blue-500 stroke-2">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            `;
            
            categoryTabsContainer.appendChild(tab);
            
            // Add event listener to the tab
            tab.addEventListener("click", () => {
                // Store the active tab
                activeTab = tab;
                
                // Reset styles for all tabs
                document.querySelectorAll(".category-tab").forEach((t) => {
                    t.classList.remove("bg-sky-600", "text-white");
                    t.classList.add("bg-slate-100", "hover:bg-sky-100");

                    const svg = t.querySelector("svg");
                    const span = t.querySelector("span");

                    if (svg) {
                        svg.classList.remove("stroke-white");
                        svg.classList.add("stroke-blue-500");
                    }

                    if (span) {
                        span.classList.remove("text-white");
                        span.classList.add("text-neutral-800");
                    }
                });

                // Apply active styles to the clicked tab
                tab.classList.add("bg-sky-600", "text-white");
                tab.classList.remove("bg-slate-100", "hover:bg-sky-100");

                const activeSvg = tab.querySelector("svg");
                const activeSpan = tab.querySelector("span");

                if (activeSvg) {
                    activeSvg.classList.add("stroke-white");
                    activeSvg.classList.remove("stroke-blue-500");
                }

                if (activeSpan) {
                    activeSpan.classList.add("text-white");
                    activeSpan.classList.remove("text-neutral-800");
                }

                // Filter products by category
                const category = tab.dataset.category;
                filterByCategory(category);
            });
        });
        
        // Add event listener to the "All Products" tab
        allProductsTab.addEventListener("click", () => {
            activeTab = allProductsTab;
            
            // Reset styles for all tabs
            document.querySelectorAll(".category-tab").forEach((t) => {
                t.classList.remove("bg-sky-600", "text-white");
                t.classList.add("bg-slate-100", "hover:bg-sky-100");

                const svg = t.querySelector("svg");
                const span = t.querySelector("span");

                if (svg) {
                    svg.classList.remove("stroke-white");
                    svg.classList.add("stroke-blue-500");
                }

                if (span) {
                    span.classList.remove("text-white");
                    span.classList.add("text-neutral-800");
                }
            });

            // Apply active styles to the clicked tab
            allProductsTab.classList.add("bg-sky-600", "text-white");
            allProductsTab.classList.remove("bg-slate-100", "hover:bg-sky-100");

            const activeSpan = allProductsTab.querySelector("span");
            if (activeSpan) {
                activeSpan.classList.add("text-white");
                activeSpan.classList.remove("text-neutral-800");
            }

            // Filter products by category
            filterByCategory("all");
        });
    }

    // Populate filter dropdown with categories
    function populateFilterDropdown() {
        let html = `
            <div class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer flex items-center" data-category="all">
                <span class="w-3 h-3 rounded-full ${currentCategory === "all" ? "bg-blue-500" : "bg-gray-200"} mr-2"></span>
                All Products
            </div>
        `;
        
        uniqueCategories.forEach(category => {
            const isActive = currentCategory === category;
            html += `
            <div class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer flex items-center" data-category="${category}">
                <span class="w-3 h-3 rounded-full ${isActive ? "bg-blue-500" : "bg-gray-200"} mr-2"></span>
                ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
            </div>
        `;
        });
        
        filterCategories.innerHTML = html;
        
        // Add event listeners to filter dropdown items
        const filterItems = filterCategories.querySelectorAll('div');
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                filterDropdown.classList.add('hidden');
                
                // Update active tab in the category tabs
                const tabToActivate = document.querySelector(`.category-tab[data-category="${category}"]`);
                if (tabToActivate) {
                    tabToActivate.click();
                } else {
                    // If no matching tab, just filter by category
                    filterByCategory(category);
                    
                    // Update the active indicator in the dropdown
                    document.querySelectorAll('#filter-categories div').forEach(div => {
                        const dot = div.querySelector('span');
                        if (div.dataset.category === category) {
                            dot.classList.add('bg-blue-500');
                            dot.classList.remove('bg-gray-200');
                        } else {
                            dot.classList.remove('bg-blue-500');
                            dot.classList.add('bg-gray-200');
                        }
                    });
                }
            });
        });
    }

    // Render products grid
    function renderProducts(filteredProducts = null) {
        let productsToRender = filteredProducts || [...products];

        if (currentCategory !== "all") {
            productsToRender = productsToRender.filter(
                (product) =>
                    product.category.toLowerCase() === currentCategory.toLowerCase()
            );
        }

        if (!productsToRender.length) {
            productsContainer.innerHTML =
                '<p class="text-center text-gray-500">No products available</p>';
            return;
        }

        productsContainer.innerHTML = productsToRender
            .map((product) => {
                // Check if product is in wishlist
                const isInWishlist = wishlist.some(item => item.id === product.id);
                
                // Use the product's stock
                const stock = product.stock;
                const isOutOfStock = stock === 0;
                const discountPercentage = product.discountPercentage || 0;
                const discountedPrice = product.price
                    ? (product.price - product.price * (discountPercentage / 100)).toFixed(2)
                    : product.price;

                return `
                    <div class="relative bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div class="flex justify-center items-center h-48 p-4 bg-gray-100">
                            <img class="h-full object-contain" src="${
                                product.thumbnail
                            }" alt="${product.title}" loading="lazy" />
                        </div>

                        <div class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                            ${product.salepercentage}% OFF
                        </div>

                        <div class="absolute top-0 left-0 text-xs font-semibold px-2 py-1 rounded-br-lg 
                                    ${
                                        isOutOfStock
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                    }">
                            ${isOutOfStock ? "Out of Stock" : `${stock} in stock`}
                        </div>

                        <div class="p-4">
                            <h3 class="text-gray-800 font-semibold text-lg mb-2 line-clamp-2">${
                                product.title
                            }</h3>
                            
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-gray-900 font-bold text-lg">$${
                                    product.price
                                }</span>
                                <span class="text-gray-500 text-sm line-through">$${
                                    product.previousprice
                                }</span>
                            </div>

                            <div class="text-green-600 text-sm mb-4">Save $${
                                product.discount
                            }</div>
                            <div class="flex items-center mb-2">
                                ${renderRating(product.rating)}
                            </div>

                            <div class="flex gap-2">
                                ${
                                    isOutOfStock
                                        ? `<button 
                                            class="flex-1 flex items-center justify-center gap-2 bg-pink-100 text-pink-600 py-2 rounded-md border border-pink-300 hover:bg-pink-200 transition"
                                            onclick="addToWishlist(${product.id})"
                                        >
                                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.42 3.42 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.58 5 20 6.42 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                            Add to Wishlist
                                        </button>`
                                        : `<button 
                                            onclick="addToCart(${product.id})" 
                                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200"
                                        >
                                            Add to Cart
                                        </button>
                                        <button 
                                            onclick="addToWishlist(${product.id})" 
                                            class="w-10 h-10 flex items-center justify-center rounded-md border ${isInWishlist ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-gray-100 border-gray-300 text-gray-600'} hover:bg-pink-100 hover:border-pink-300 hover:text-pink-600 transition-colors"
                                            title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                                        >
                                            <svg class="w-5 h-5 ${isInWishlist ? 'fill-current' : 'stroke-current fill-none'}" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.42 3.42 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.58 5 20 6.42 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" ${isInWishlist ? '' : 'stroke-width="2"'}/>
                                            </svg>
                                        </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    // Helper function to render star ratings
    function renderRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = "";

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += `<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        }

        // Half star
        if (hasHalfStar) {
            stars += `<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><defs><linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#D1D5DB"/></linearGradient></defs><path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += `<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        }

        return stars;
    }

    // Update cart counter
    function updateCartCounter() {
        const count = Object.values(cart).reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        cartCount.textContent = count;
        cartCount.classList.toggle("hidden", count === 0);
    }

    // Add product to cart
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        
        // Check if product exists and has stock
        if (!product || product.stock <= 0) {
            showFeedback('Product is out of stock!', 'red');
            return;
        }

        // Add or update the item in the cart
        if (!cart[productId]) {
            cart[productId] = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.thumbnail || product.images?.[0] || "",
                quantity: 1,
                stock: product.stock - 1 // Track remaining stock
            };
            // Decrease the product stock
            product.stock--;
        } else {
            // Check if adding more would exceed available stock
            if (product.stock <= 0) {
                showFeedback('No more stock available!', 'red');
                return;
            }
            
            cart[productId].quantity++;
            cart[productId].stock = product.stock - 1;
            // Decrease the product stock
            product.stock--;
        }

        saveCartToStorage();
        renderCart();
        updateCartCounter();
        
        // Re-render products to update stock display
        renderCurrentView();

        // Show feedback
        showFeedback('Item added to cart!', 'green');
    };

    // Remove product from cart
    window.removeFromCart = function(id) {
        // Restore stock to the product
        const product = products.find(p => p.id === parseInt(id));
        if (product) {
            product.stock += cart[id].quantity;
        }
        
        delete cart[id];
        saveCartToStorage();
        renderCart();
        updateCartCounter();
        
        // Re-render products to update stock display
        renderCurrentView();
    };

    // Change quantity in cart
    window.changeQuantity = function(id, qty) {
        const product = products.find(p => p.id === parseInt(id));
        const currentQty = cart[id].quantity;
        
        if (qty <= 0) {
            // Restore stock when removing item
            if (product) {
                product.stock += currentQty;
            }
            removeFromCart(id);
            return;
        }
        
        if (qty > currentQty) {
            // Increasing quantity - check stock
            if (product && product.stock <= 0) {
                showFeedback('No more stock available!', 'red');
                return;
            }
            
            // Decrease product stock
            if (product) {
                product.stock--;
            }
        } else if (qty < currentQty) {
            // Decreasing quantity - restore stock
            if (product) {
                product.stock += (currentQty - qty);
            }
        }
        
        cart[id].quantity = qty;
        saveCartToStorage();
        renderCart();
        updateCartCounter();
        
        // Re-render products to update stock display
        renderCurrentView();
    };

    // Calculate total price
    function calculateTotal() {
        return Object.values(cart).reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

    // Render cart panel contents
    function renderCart() {
        const items = Object.values(cart);

        if (items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p class="text-lg">Your cart is empty</p>
                    <p class="text-sm mt-1">Start shopping to add items</p>
                </div>
            `;
            cartTotal.textContent = "$0.00";
            checkoutBtn.disabled = true;
            return;
        }

        cartItemsContainer.innerHTML = items
            .map(
                (item) => `
                <div class="flex items-center gap-4 py-4 border-b">
                    <img src="${item.image}" alt="${
                    item.title
                }" class="w-16 h-16 object-contain rounded" loading="lazy" />
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800 line-clamp-1">${
                            item.title
                        }</h4>
                        <p class="text-blue-600 font-bold">$${item.price.toFixed(2)}</p>
                        <div class="flex items-center mt-2 gap-2">
                            <button onclick="changeQuantity(${item.id}, ${
                    item.quantity - 1
                })" 
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                                -
                            </button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button onclick="changeQuantity(${item.id}, ${
                    item.quantity + 1
                })" 
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                                +
                            </button>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${item.id})" 
                        class="text-gray-500 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `
            )
            .join("");

        cartTotal.textContent = "$" + calculateTotal().toFixed(2);
        checkoutBtn.disabled = false;
    }

    // Cart visibility functions
    function openCart() {
        cartPanel.classList.remove("translate-x-full");
        cartOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeCart() {
        cartPanel.classList.add("translate-x-full");
        cartOverlay.classList.add("hidden");
        document.body.style.overflow = "";
    }

    // Checkout button handler
    function checkout() {
        const items = Object.values(cart);
        if (items.length === 0) return;

        const total = calculateTotal().toFixed(2);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
// Save purchase to local storage
    const bought = {
    items: items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
    })),
    total: total,
    itemCount: itemCount,
    boughtDate: new Date().toISOString(), // Store date for reference
};
// Retrieve existing bought items or initialize empty array
let boughtItems = JSON.parse(localStorage.getItem("boughtItems")) || [];
// Append new purchase
boughtItems.push(bought);
// Save back to local storage
localStorage.setItem("boughtItems", JSON.stringify(boughtItems));
        // Create a nicer looking alert
        const alertDiv = document.createElement("div");
        alertDiv.className =
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
        alertDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-pop-in">
                <div class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Thank you for your purchase!</h3>
                    <p class="text-gray-600 mb-4">${itemCount} item(s) - Total: $${total}</p>
                    <p class="text-gray-600">Your order has been placed successfully.</p>
                </div>
                <div class="mt-6">
                    <button onclick="this.closest('div.fixed').remove()" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // Clear cart
        cart = {};
        saveCartToStorage();
        renderCart();
        closeCart();
        updateCartCounter();
         renderHistory();
    }
    
// History visibility functions
    function openHistory() {
        historyPanel.classList.remove("translate-x-full");
        historyOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderHistory();
    }

    function closeHistory() {
        historyPanel.classList.add("translate-x-full");
        historyOverlay.classList.add("hidden");
        document.body.style.overflow = "";
    }

    // Render history panel contents
    function renderHistory() {
        const boughtItems = JSON.parse(localStorage.getItem("boughtItems")) || [];

        if (boughtItems.length === 0) {
            historyItemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14V6a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2z" />
                    </svg>
                    <p class="text-lg">Your purchase history is empty</p>
                    <p class="text-sm mt-1">Complete a purchase to see it here</p>
                </div>
            `;
            return;
        }

        boughtItems.sort((a, b) => new Date(b.boughtDate) - new Date(a.boughtDate));
        historyItemsContainer.innerHTML = boughtItems
            .map((purchase, index) => `
                <div class="border-b py-4">
                    <h4 class="font-bold text-gray-800 mb-2">Purchase #${index + 1} - ${new Date(purchase.boughtDate).toLocaleString()}</h4>
                    <p class="text-gray-600 mb-2">Total: $${purchase.total} | ${purchase.itemCount} item(s)</p>
                    ${purchase.items.map(item => `
                        <div class="flex items-center gap-4 py-2">
                            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded" loading="lazy" />
                            <div class="flex-1">
                                <h5 class="font-medium text-gray-800 line-clamp-1">${item.title}</h5>
                                <p class="text-blue-600 font-bold">$${item.price.toFixed(2)}</p>
                                <p class="text-gray-600 text-sm">Quantity: ${item.quantity}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `)
            .join("");
    }
    // Wishlist Functions
    window.addToWishlist = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const index = wishlist.findIndex(item => item.id === productId);
        
        if (index === -1) {
            // Add to wishlist
            wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.thumbnail,
                rating: product.rating,
                category: product.category
            });
            showFeedback('Added to wishlist!', 'blue');
        } else {
            // Remove from wishlist
            wishlist.splice(index, 1);
            showFeedback('Removed from wishlist!', 'gray');
        }
        
        saveWishlistToStorage();
        updateWishlistCounter();
        
        // Update the current view without changing category
        renderCurrentView();
        
        renderWishlist();
    };

    // Function to render the current view without changing category
    function renderCurrentView() {
        renderProducts();
        
        // Restore active tab styling if needed
        if (activeTab) {
            // This ensures the active tab stays highlighted
            document.querySelectorAll(".category-tab").forEach(tab => {
                if (tab === activeTab) {
                    tab.classList.add("bg-sky-600", "text-white");
                    tab.classList.remove("bg-slate-100", "hover:bg-sky-100");
                    
                    const svg = tab.querySelector("svg");
                    const span = tab.querySelector("span");
                    
                    if (svg) {
                        svg.classList.add("stroke-white");
                        svg.classList.remove("stroke-blue-500");
                    }
                    
                    if (span) {
                        span.classList.add("text-white");
                        span.classList.remove("text-neutral-800");
                    }
                }
            });
        }
    }

    function updateWishlistCounter() {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.classList.toggle("hidden", wishlist.length === 0);
    }

    function saveWishlistToStorage() {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }

    function renderWishlist() {
        if (!wishlist.length) {
            wishlistItemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <p class="text-lg">Your wishlist is empty</p>
                    <p class="text-sm mt-1">Save your favorite items here</p>
                </div>
            `;
            return;
        }

        wishlistItemsContainer.innerHTML = wishlist.map(item => `
            <div class="flex items-center gap-4 py-4 border-b">
                <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded" loading="lazy" />
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800 line-clamp-1">${item.title}</h4>
                    <p class="text-blue-600 font-bold">$${item.price.toFixed(2)}</p>
                    <div class="flex items-center mt-2 gap-2">
                        ${renderRating(item.rating)}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="addToCart(${item.id})" 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </button>
                    <button onclick="addToWishlist(${item.id})" 
                        class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function openWishlist() {
        wishlistPanel.classList.remove("translate-x-full");
        wishlistOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeWishlist() {
        wishlistPanel.classList.add("translate-x-full");
        wishlistOverlay.classList.add("hidden");
        document.body.style.overflow = "";
    }

    // Storage functions
    function saveCartToStorage() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Category filtering
    function filterByCategory(category) {
        currentCategory = category;
        renderProducts();
        
        // Update the filter dropdown indicators if it's open
        const filterItems = document.querySelectorAll('#filter-categories div');
        filterItems.forEach(item => {
            const dot = item.querySelector('span');
            if (item.dataset.category === category) {
                dot.classList.add('bg-blue-500');
                dot.classList.remove('bg-gray-200');
            } else {
                dot.classList.remove('bg-blue-500');
                dot.classList.add('bg-gray-200');
            }
        });
    }

    // Search function
    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Show visual feedback that search is being performed
        searchBtn.classList.add('bg-blue-100');
        setTimeout(() => searchBtn.classList.remove('bg-blue-100'), 300);
        
        if (!searchTerm) {
            renderProducts();
            return;
        }
        
        const filtered = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        
        if (filtered.length === 0) {
            productsContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900">No results found</h3>
                <p class="mt-1 text-gray-500">We couldn't find any products matching "${searchTerm}"</p>
                <button onclick="clearSearch()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Clear Search
                </button>
            </div>
        `;
        } else {
            renderProducts(filtered);
        }
        
        // Reset any active category tab styling
        document.querySelectorAll(".category-tab").forEach((tab) => {
            tab.classList.remove("bg-sky-600", "text-white");
            tab.classList.add("bg-slate-100", "hover:bg-sky-100");

            const svg = tab.querySelector("svg");
            const span = tab.querySelector("span");

            if (svg) {
                svg.classList.remove("stroke-white");
                svg.classList.add("stroke-blue-500");
            }

            if (span) {
                span.classList.remove("text-white");
                span.classList.add("text-neutral-800");
            }
        });
    }

    // Clear search function
    window.clearSearch = function() {
        searchInput.value = '';
        renderProducts();
        
        // Restore active tab if there was one
        if (activeTab) {
            activeTab.click();
        } else {
            // Default to "All Products" tab
            const allTab = document.querySelector('.category-tab[data-category="all"]');
            if (allTab) allTab.click();
        }
    };

    // Show feedback message
    function showFeedback(message, color) {
        const feedback = document.createElement("div");
        feedback.className = `fixed bottom-4 right-4 bg-${color}-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        setTimeout(() => {
            feedback.classList.add("animate-fade-out");
            setTimeout(() => feedback.remove(), 300);
        }, 1700);
    }

    // Make functions available globally
    window.filterByCategory = filterByCategory;
    window.openWishlist = openWishlist;
    window.closeWishlist = closeWishlist;
    window.handleSearch = handleSearch;
});

