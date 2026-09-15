
const POS = {
    cart: [],
    discount: 0,
    customSellingPrice: 0,
    paymentMethod: 'cash',

    init() {
        console.log("POS Terminal Initializing...");
        try {
            this.setupListeners();
            this.renderProducts();
            this.updateSalesSummary();
            this.updateCartUI();
            this.initReturn();
        } catch (e) {
            console.error("POS Init Error:", e);
        }
    },

    setupListeners() {
        const searchInput = document.getElementById('pos-search');
        if (searchInput) {
            const debouncedSearch = UI.debounce((val) => this.renderProducts(val), 250);
            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }

        const categoryFilter = document.getElementById('pos-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.renderProducts());
        }

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        const confirmPrintBtn = document.getElementById('confirm-print-btn');
        if (confirmPrintBtn) {
            confirmPrintBtn.addEventListener('click', () => this.processSale(true));
        }

        const confirmNoPrintBtn = document.getElementById('confirm-no-print-btn');
        if (confirmNoPrintBtn) {
            confirmNoPrintBtn.addEventListener('click', () => this.processSale(false));
        }

        const discountBtn = document.getElementById('add-discount-btn');
        if (discountBtn) {
            discountBtn.addEventListener('click', () => this.handleDiscount());
        }

        const customPriceBtn = document.getElementById('custom-price-btn');
        if (customPriceBtn) {
            customPriceBtn.addEventListener('click', () => this.handleCustomPrice());
        }

        // Live preview in custom price modal
        const customPriceInput = document.getElementById('custom-price-input');
        if (customPriceInput) {
            customPriceInput.addEventListener('input', () => this.previewCustomPrice());
        }

        // Payment Method Selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                this.paymentMethod = method.dataset.method;

                const calc = document.getElementById('cash-calculator');
                if (calc) {
                    calc.style.display = (this.paymentMethod === 'cash') ? 'block' : 'none';
                }
            });
        });

        // Cash Calculator
        const cashInput = document.getElementById('cash-received');
        if (cashInput) {
            cashInput.addEventListener('input', () => this.updateBalance());
        }

        // Global QR/Barcode Scanner Listener
        let barcodeBuffer = '';
        let barcodeTimer = null;

        window.addEventListener('keydown', (e) => {
            // Only capture if we are on POS page and not typing in an input
            const currentPage = document.querySelector('.page.active')?.id;
            if (currentPage !== 'pos-page' && currentPage !== 'pos') return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || document.querySelector('.modal.active')) {
                return;
            }

            if (barcodeTimer) clearTimeout(barcodeTimer);

            if (e.key === 'Enter') {
                if (barcodeBuffer.length > 2) {
                    e.preventDefault();
                    this.processScannedBarcode(barcodeBuffer);
                }
                barcodeBuffer = '';
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }

            // Clear buffer if typing is slow (manual typing)
            barcodeTimer = setTimeout(() => {
                barcodeBuffer = '';
            }, 100);
        });

        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'pos') {
                this.renderProducts();
                this.updateSalesSummary();
                this.updateCartUI();
            }
        });

        window.addEventListener('inventoryUpdate', () => {
            this.renderProducts();
            this.updateSalesSummary();
        });
    },

    updateSalesSummary() {
        const todaySalesEl = document.getElementById('pos-today-sales');
        const yesterdaySalesEl = document.getElementById('pos-yesterday-sales');
        const allSales = Store.getFilteredSales() || [];

        if (todaySalesEl) {
            const today = new Date().toDateString();
            const totalTodaySales = allSales
                .filter(sale => new Date(sale.timestamp).toDateString() === today)
                .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
            todaySalesEl.textContent = UI.formatCurrency(totalTodaySales);
        }

        if (yesterdaySalesEl) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toDateString();
            const totalYesterdaySales = allSales
                .filter(sale => new Date(sale.timestamp).toDateString() === yesterdayStr)
                .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
            yesterdaySalesEl.textContent = UI.formatCurrency(totalYesterdaySales);
        }
    },

    processScannedBarcode(barcode) {
        const products = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const product = products.find(p => p.id === barcode);
        
        if (product) {
            this.addToCart(product.id);
            UI.showToast(`Added ${product.name} to cart via scanner.`, 'success');
        } else {
            UI.showToast(`Product with QR Code ${barcode} not found!`, 'error');
            // Play error sound optionally
        }
    },

    renderProducts(filter = '') {
        const grid = document.getElementById('pos-product-grid');
        if (!grid) return;

        try {
            const products = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
            const category = document.getElementById('pos-category-filter')?.value || 'All';

            // Filter out null/undefined elements
            let filtered = products.filter(p => p !== null && p !== undefined);

            if (category !== 'All') {
                filtered = filtered.filter(p => p.type === category);
            }

            if (filter) {
                const searchStr = filter.toLowerCase();
                filtered = filtered.filter(p => {
                    const name = p.name ? String(p.name).toLowerCase() : '';
                    const color = p.color ? String(p.color).toLowerCase() : '';
                    return name.includes(searchStr) || color.includes(searchStr);
                });
            }

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-search" style="font-size: 2rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                        No products found.
                    </div>`;
                return;
            }

            // Group by base product name
            const grouped = {};
            filtered.forEach(p => {
                const name = p.name || 'Unnamed Product';
                if (!grouped[name]) {
                    grouped[name] = {
                        name: name,
                        type: p.type || 'General',
                        style: p.style || 'Plain',
                        price: p.price || 0,
                        variants: []
                    };
                }
                grouped[name].variants.push(p);
            });

            const groupedList = Object.values(grouped);

            grid.innerHTML = groupedList.map(product => {


                // Total cart items for all variants of this product combined
                let totalCartQty = 0;
                product.variants.forEach(v => {
                    totalCartQty += this.getCartQty(v.id);
                });

                const safeName = (product.name || '').replace(/"/g, '&quot;');
                const imageSrc = product.variants[0].image;

                return `
                    <div class="product-card" data-product-name="${safeName}" style="position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 0; border-radius: 16px; overflow: hidden;">
                        <div>
                            <div style="width: 100%; height: 120px; background: ${imageSrc ? 'transparent' : 'var(--bg-card-hover)'}; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${imageSrc ? `<img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-mobile-alt" style="font-size: 2.5rem; color: var(--text-muted); opacity: 0.3;"></i>`}
                            </div>
                            <div style="padding: 0.75rem 0.75rem 0;">
                                <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.25rem; word-break: break-word;">${product.name}</div>
                                <div style="color: var(--text-muted); font-size: 0.7rem; margin-bottom: 0.5rem;">
                                    ${product.type}
                                </div>
                            </div>
                        </div>

                        <div style="padding: 0 0.75rem 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 800; color: var(--text-main); font-size: 0.95rem;">${UI.formatCurrency(product.price)}</span>
                            </div>
                            <button class="btn btn-primary" style="width: 100%; border-radius: 10px; height: 32px; font-size: 0.75rem; justify-content: center; font-weight: 600; padding: 0;" 
                                onclick="POS.addSelectedToCart(this)">
                                <i class="fas fa-plus" style="margin-right: 0.25rem; font-size: 0.7rem;"></i> Add
                            </button>
                        </div>

                        ${totalCartQty > 0 ? `
                            <div style="position: absolute; top: -5px; right: -5px; width: 22px; height: 22px; background: var(--accent-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid var(--bg-sidebar); box-shadow: var(--shadow-sm);">
                                ${totalCartQty}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error("Render Products Error:", e);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; padding: 2rem; border-radius: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-danger); color: var(--accent-danger); font-family: monospace; white-space: pre-wrap;">
                    <strong>Error rendering products:</strong><br>${e.message}<br><br><strong>Stack Trace:</strong><br>${e.stack}
                </div>
            `;
        }
    },

    normalizeText(text) {
        return typeof text === 'string' ? text.trim().toLowerCase() : '';
    },

    sortSizes(sizeA, sizeB) {
        const order = { xs: 1, s: 2, m: 3, l: 4, xl: 5, xxl: 6, xxxl: 7 };
        const a = String(sizeA || '').trim().toLowerCase();
        const b = String(sizeB || '').trim().toLowerCase();
        if (order[a] !== undefined || order[b] !== undefined) {
            return (order[a] || 99) - (order[b] || 99);
        }
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b, undefined, { numeric: true });
    },

    getUniqueSortedSizes(variants) {
        const seen = new Set();
        const sizes = [];
        variants.forEach(v => {
            const size = String(v.size || '').trim();
            if (!size) return;
            const key = size.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                sizes.push(size);
            }
        });
        return sizes.sort((a, b) => this.sortSizes(a, b));
    },


    addSelectedToCart(buttonEl) {
        const card = buttonEl.closest('.product-card');
        const productName = card?.dataset.productName;
        if (!productName) return;

        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const product = allProducts.find(p => p.name === productName);

        if (!product) {
            alert('Product not found!');
            return;
        }

        this.addToCart(product.id);
    },

    isInCart(id) {
        return this.cart.some(item => item.id === id);
    },

    getCartQty(id) {
        const item = this.cart.find(i => i.id === id);
        return item ? item.quantity : 0;
    },

    addToCart(productId) {
        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity <= 0) {
            alert('Out of stock!');
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            if (cartItem.quantity < product.quantity) {
                cartItem.quantity++;
            } else {
                alert('Maximum stock reached!');
            }
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.customSellingPrice = 0; // Reset custom price when cart changes
        this.updateCartUI();
        this.renderProducts(document.getElementById('pos-search')?.value || '');
    },

    updateCartQty(id, delta) {
        const item = this.cart.find(i => i.id === id);
        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const product = allProducts.find(p => p.id === id);

        if (!item) return;

        if (delta > 0) {
            if (item.quantity < product.quantity) {
                item.quantity++;
            } else {
                alert('No more stock available!');
            }
        } else {
            item.quantity--;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(i => i.id !== id);
            }
        }

        this.customSellingPrice = 0; // Reset custom price when cart changes
        this.updateCartUI();
        this.renderProducts(document.getElementById('pos-search')?.value || '');
    },

    clearCart() {
        if (this.cart.length > 0 && confirm('Empty current order?')) {
            this.cart = [];
            this.discount = 0;
            this.customSellingPrice = 0;
            const cashInput = document.getElementById('cash-received');
            if (cashInput) cashInput.value = '';
            this.updateCartUI();
            this.renderProducts();
        }
    },

    updateCartUI() {
        const cartList = document.getElementById('cart-items');
        if (!cartList) return;

        if (this.cart.length === 0) {
            cartList.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">
                    <i class="fas fa-shopping-basket" style="font-size: 3rem; opacity: 0.1; margin-bottom: 1rem; display: block;"></i>
                    <p>Select products to start</p>
                </div>`;
            this.updateTotals(0);
            return;
        }

        cartList.innerHTML = this.cart.map(item => {
            const discountedPrice = item.price * (1 - (this.discount / 100));
            return `
            <div class="cart-item" style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border); flex-wrap: wrap; gap: 10px;">
                <div style="flex: 1 1 150px; min-width: 0;">
                    <div style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.name}">${item.name}</div>
                    <div style="color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        ${item.size} | ${UI.getColorBadge(item.color)}
                    </div>
                    ${this.discount > 0 ? `<div style="font-size: 0.7rem; color: var(--accent-danger); font-weight: 600; margin-top: 2px;">${this.discount}% discount applied (Original: ${UI.formatCurrency(item.price)})</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex: 1 0 auto;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-main); padding: 0.4rem; border-radius: 10px; border: 1px solid var(--glass-border);">
                        <button class="cart-item-qty-btn" onclick="window.updateCartQty('${item.id}', -1)">-</button>
                        <span style="font-weight: 700; min-width: 24px; text-align: center; color: var(--text-main);">${item.quantity}</span>
                        <button class="cart-item-qty-btn" onclick="window.updateCartQty('${item.id}', 1)">+</button>
                    </div>
                    <span style="font-weight: 800; min-width: 80px; text-align: right; color: var(--text-main);">${UI.formatCurrency(discountedPrice * item.quantity)}</span>
                </div>
            </div>
            `;
        }).join('');

        const subtotalOriginal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.updateTotals(subtotalOriginal);
    },

    handleDiscount() {
        if (this.cart.length === 0) return;
        const discountInput = document.getElementById('discount-input');
        if (discountInput) discountInput.value = this.discount || '';
        UI.showModal('discount-modal');
        setTimeout(() => discountInput && discountInput.focus(), 100);
    },

    applyDiscountFromModal() {
        const discountInput = document.getElementById('discount-input');
        if (discountInput) {
            let amount = parseFloat(discountInput.value) || 0;
            if (amount < 0) amount = 0;
            if (amount > 100) amount = 100;
            
            // Validate against Min Selling Price
            const violatingItem = this.cart.find(item => {
                const discountedPrice = item.price * (1 - (amount / 100));
                return discountedPrice < (item.minSellingPrice || 0);
            });

            if (violatingItem) {
                const minPriceAllowed = violatingItem.minSellingPrice || 0;
                alert(`Cannot sell below minimum price of Rs. ${minPriceAllowed} for ${violatingItem.name}. Please lower the discount.`);
                return;
            }

            this.discount = amount;
            this.customSellingPrice = 0; // Clear custom price when using % discount
            
            this.updateCartUI();
            UI.hideModal('discount-modal');
        }
    },

    handleCustomPrice() {
        if (this.cart.length === 0) return;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Show original total
        const origEl = document.getElementById('custom-price-original');
        if (origEl) origEl.textContent = UI.formatCurrency(subtotal);
        
        // Show min floor price
        let totalMinPrice = 0;
        let hasMinPrice = false;
        this.cart.forEach(item => {
            if (item.minSellingPrice) {
                totalMinPrice += (parseFloat(item.minSellingPrice) * item.quantity);
                hasMinPrice = true;
            }
        });
        const minRow = document.getElementById('custom-price-min-row');
        const floorEl = document.getElementById('custom-price-floor');
        if (minRow && floorEl) {
            if (hasMinPrice) {
                minRow.style.display = 'flex';
                floorEl.textContent = UI.formatCurrency(totalMinPrice);
            } else {
                minRow.style.display = 'none';
            }
        }
        
        // Pre-fill with current custom price or subtotal
        const input = document.getElementById('custom-price-input');
        if (input) {
            input.value = this.customSellingPrice > 0 ? this.customSellingPrice : '';
            input.placeholder = `e.g. ${Math.round(subtotal * 0.9)}`;
        }
        
        // Reset previews
        const savingsEl = document.getElementById('custom-price-savings');
        const errorEl = document.getElementById('custom-price-error');
        if (savingsEl) savingsEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        
        UI.showModal('custom-price-modal');
        setTimeout(() => input && input.focus(), 100);
    },

    previewCustomPrice() {
        const input = document.getElementById('custom-price-input');
        const savingsEl = document.getElementById('custom-price-savings');
        const savingsAmountEl = document.getElementById('custom-price-savings-amount');
        const errorEl = document.getElementById('custom-price-error');
        if (!input) return;
        
        const price = parseFloat(input.value) || 0;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate floor
        let totalMinPrice = 0;
        let hasMinPrice = false;
        this.cart.forEach(item => {
            if (item.minSellingPrice) {
                totalMinPrice += (parseFloat(item.minSellingPrice) * item.quantity);
                hasMinPrice = true;
            }
        });
        
        if (price <= 0) {
            if (savingsEl) savingsEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
            return;
        }
        
        if (hasMinPrice && price < totalMinPrice) {
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = `⚠️ Cannot sell below floor price of ${UI.formatCurrency(totalMinPrice)}`;
            }
            if (savingsEl) savingsEl.style.display = 'none';
        } else if (price > subtotal) {
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = `Price is higher than original total`;
            }
            if (savingsEl) savingsEl.style.display = 'none';
        } else {
            if (errorEl) errorEl.style.display = 'none';
            const savings = subtotal - price;
            if (savingsEl && savingsAmountEl && savings > 0) {
                savingsEl.style.display = 'block';
                savingsAmountEl.textContent = UI.formatCurrency(savings);
            } else if (savingsEl) {
                savingsEl.style.display = 'none';
            }
        }
    },

    applyCustomPrice() {
        const input = document.getElementById('custom-price-input');
        if (!input) return;
        
        const price = parseFloat(input.value) || 0;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (price <= 0) {
            alert('Please enter a valid price');
            return;
        }
        
        if (price > subtotal) {
            alert('Selling price cannot be higher than original total');
            return;
        }
        
        // Validate against floor price
        let totalMinPrice = 0;
        let hasMinPrice = false;
        this.cart.forEach(item => {
            if (item.minSellingPrice) {
                totalMinPrice += (parseFloat(item.minSellingPrice) * item.quantity);
                hasMinPrice = true;
            }
        });
        
        if (hasMinPrice && price < totalMinPrice) {
            alert(`Cannot sell below minimum floor price of ${UI.formatCurrency(totalMinPrice)}`);
            return;
        }
        
        // Calculate equivalent discount percentage
        const discountPercent = ((subtotal - price) / subtotal) * 100;
        
        this.customSellingPrice = price;
        this.discount = Math.round(discountPercent * 100) / 100;
        
        this.updateCartUI();
        UI.hideModal('custom-price-modal');
    },

    updateTotals(subtotalOriginal) {
        let total;
        let discountAmount;
        
        if (this.customSellingPrice > 0) {
            // Custom selling price mode
            total = this.customSellingPrice;
            discountAmount = subtotalOriginal - total;
        } else {
            discountAmount = subtotalOriginal * (this.discount / 100);
            total = Math.max(0, subtotalOriginal - discountAmount);
        }

        const subEl = document.getElementById('cart-subtotal');
        if (subEl) subEl.textContent = UI.formatCurrency(subtotalOriginal);

        const discountRow = document.getElementById('discount-row');
        const discountEl = document.getElementById('cart-discount');
        if (discountRow && discountEl) {
            if (this.discount > 0 || this.customSellingPrice > 0) {
                discountRow.style.display = 'flex';
                if (this.customSellingPrice > 0) {
                    discountEl.textContent = `- ${UI.formatCurrency(discountAmount)} (Selling @ ${UI.formatCurrency(this.customSellingPrice)})`;
                } else {
                    discountEl.textContent = `- ${this.discount}% (${UI.formatCurrency(discountAmount)})`;
                }
            } else {
                discountRow.style.display = 'none';
            }
        }

        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = UI.formatCurrency(total);

        // Update Minimum Floor Price Hint
        let totalMinPrice = 0;
        let hasMinPrice = false;
        this.cart.forEach(item => {
            if (item.minSellingPrice) {
                totalMinPrice += (parseFloat(item.minSellingPrice) * item.quantity);
                hasMinPrice = true;
            } else {
                totalMinPrice += (item.price * item.quantity);
            }
        });
        
        const minHintContainer = document.getElementById('cart-min-price-hint');
        const minHintValue = document.getElementById('cart-min-price-value');
        if (minHintContainer && minHintValue) {
            if (hasMinPrice) {
                minHintContainer.style.display = 'block';
                minHintValue.textContent = UI.formatCurrency(totalMinPrice);
            } else {
                minHintContainer.style.display = 'none';
            }
        }

        this.updateBalance();
    },

    updateBalance() {
        const subtotalOriginal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let total;
        if (this.customSellingPrice > 0) {
            total = this.customSellingPrice;
        } else {
            const discountAmount = subtotalOriginal * (this.discount / 100);
            total = Math.max(0, subtotalOriginal - discountAmount);
        }
        const cashReceived = parseFloat(document.getElementById('cash-received')?.value || 0);
        const balance = Math.max(0, cashReceived - total);

        const balanceEl = document.getElementById('cash-balance');
        if (balanceEl) balanceEl.textContent = UI.formatCurrency(balance);
    },

    handleCheckout() {
        if (this.cart.length === 0) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = subtotal * (this.discount / 100);
        const total = Math.max(0, subtotal - discountAmount);
        const cashReceived = parseFloat(document.getElementById('cash-received')?.value || 0);
        const balance = Math.max(0, cashReceived - total);

        const itemsHtml = this.cart.map(item => {
            const discountedPrice = item.price * (1 - (this.discount / 100));
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem; gap: 0.5rem;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${item.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        ${item.size && item.size !== 'undefined' ? `Size: ${item.size} | ` : ''}${item.color && item.color !== 'undefined' ? `Color: ${item.color} | ` : ''}Qty: ${item.quantity}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
                    <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${UI.formatCurrency(discountedPrice * item.quantity)}</span>
                    <button onclick="POS.removeFromConfirmation('${item.id}')" title="Remove item" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: var(--accent-danger); width: 26px; height: 26px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');

        const detailsEl = document.getElementById('confirmation-details');
        if (detailsEl) {
            detailsEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.8rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
                    <div style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                        Items In Order
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        ${itemsHtml}
                    </div>
                    
                    <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid var(--glass-border); padding-top: 0.75rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">Total Units:</span>
                            <span style="font-weight: 700; color: var(--text-main);">${this.cart.reduce((s, i) => s + i.quantity, 0)} Units</span>
                        </div>
                        ${this.discount > 0 ? `
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">Discount:</span>
                            <span style="font-weight: 700; color: var(--accent-danger);">${this.discount}% (-${UI.formatCurrency(discountAmount)})</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; font-size: 1.25rem; margin: 0.5rem 0; padding: 0.5rem 0; border-top: 1px dashed var(--glass-border); border-bottom: 1px dashed var(--glass-border);">
                            <span>Total Due:</span>
                            <span style="font-weight: 800; color: var(--text-main);">${UI.formatCurrency(total)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">Payment:</span>
                            <span style="font-weight: 600; text-transform: uppercase; color: var(--text-main);">${this.paymentMethod}</span>
                        </div>
                        ${this.paymentMethod === 'cash' ? `
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-muted);">Received:</span>
                                <span style="font-weight: 600; color: var(--text-main);">${UI.formatCurrency(cashReceived)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; color: var(--accent-success);">
                                <span style="font-weight: 600;">Balance:</span>
                                <span style="font-weight: 800;">${UI.formatCurrency(balance)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            UI.showModal('order-confirmation-modal');
        }
    },

    removeFromConfirmation(itemId) {
        this.cart = this.cart.filter(i => i.id !== itemId);
        if (this.cart.length === 0) {
            UI.hideModal('order-confirmation-modal');
            this.updateCartUI();
            return;
        }
        this.handleCheckout(); // re-render confirmation with updated cart
    },

    processSale(shouldPrint) {
        const subtotalOriginal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let effectiveDiscount = this.discount;
        if (this.customSellingPrice > 0 && subtotalOriginal > 0) {
            effectiveDiscount = ((subtotalOriginal - this.customSellingPrice) / subtotalOriginal) * 100;
        }

        // Apply discount to each item individually so it gets stored correctly
        const discountedItems = this.cart.map(item => {
            const discountedPrice = item.price * (1 - (effectiveDiscount / 100));
            return {
                ...item,
                originalPrice: item.price,
                price: discountedPrice
            };
        });

        const total = discountedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = subtotalOriginal - total;

        const sale = {
            items: discountedItems,
            subtotal: subtotalOriginal,
            discountPercent: Math.round(effectiveDiscount * 100) / 100,
            discount: discountAmount,
            total: total,
            paymentMethod: this.paymentMethod,
            timestamp: new Date().toISOString(),
            shop: (localStorage.getItem('active_shop') === 'All Shops' ? 'Shop 1' : localStorage.getItem('active_shop')) || 'Shop 1'
        };

        const completedSale = Store.addSale(sale);
        UI.hideModal('order-confirmation-modal');

        if (shouldPrint) {
            this.generateReceipt(completedSale);
        } else {
            alert('Sale completed successfully!');
        }

        // Reset POS
        this.cart = [];
        this.discount = 0;
        this.customSellingPrice = 0;
        const cashInput = document.getElementById('cash-received');
        if (cashInput) cashInput.value = '';
        this.updateCartUI();
        this.renderProducts();

        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    },

    generateReceipt(sale) {
        let printFrame = document.getElementById('receipt-print-frame');
        if (!printFrame) {
            printFrame = document.createElement('iframe');
            printFrame.id = 'receipt-print-frame';
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = '0';
            document.body.appendChild(printFrame);
        }
        const itemsHtml = sale.items.map(item => {
            const variantInfo = [];
            if (item.size && item.size !== 'N/A' && item.size.trim() !== '') variantInfo.push(item.size);
            if (item.color && item.color !== 'N/A' && String(item.color).trim() !== '') variantInfo.push(item.color);
            const variantText = variantInfo.length > 0 ? ` (${variantInfo.join('/')})` : '';
            
            return `
                <tr style="border-bottom: 1px dotted #ccc; vertical-align: top;">
                    <td style="padding: 4px 0; font-weight: 700; text-align: left; font-size: 11px; width: 35px; font-family: Arial, sans-serif; color: #000;">${item.quantity}</td>
                    <td style="padding: 4px 0; text-align: left; padding-left: 4px;">
                        <div style="font-weight: 700; font-size: 11px; color: #000; font-family: Arial, sans-serif; line-height: 1.15;">${item.name || 'Item'}${variantText}</div>
                    </td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 700; font-size: 11px; width: 100px; font-family: Arial, sans-serif; color: #000;">
                        ${UI.formatCurrency(item.price * item.quantity)}
                    </td>
                </tr>
            `;
        }).join('');

        const totalItemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);

        const doc = printFrame.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Order #${sale.id.toString().slice(-8).toUpperCase()}</title>
                    <style>
                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        html, body {
                            width: 80mm;
                            background: #ffffff;
                            margin: 0;
                            padding: 0;
                        }
                        body {
                            padding: 3mm 4mm;
                            display: block;
                        }
                        .receipt-container {
                            width: 100%;
                            max-width: 72mm;
                            margin: 0 auto;
                            font-family: Arial, sans-serif;
                            color: #000000;
                            line-height: 1.3;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <!-- Top Meta Header -->
                        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; font-family: Arial, sans-serif; width: 100%; padding-bottom: 3px; border-bottom: 1px solid #000; text-transform: uppercase; color: #000;">
                            <span>${new Date(sale.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>Sales</span>
                        </div>

                        <!-- Main bold title block -->
                        <div style="text-align: center; margin: 6px 0 4px 0;">
                            <img src="../assets/ihm_logo.jpg" style="max-height: 60px; margin-bottom: 5px; filter: grayscale(100%);"><br>
                            <h1 style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #000; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0;">IHM Shop</h1>
                            <hr style="border: 0; border-top: 1.5px solid #000000; margin-top: 3px; margin-bottom: 4px;">
                        </div>

                        <!-- Store Branding Details -->
                        <div style="text-align: center; font-size: 10px; line-height: 1.3; margin-bottom: 6px; font-family: Arial, sans-serif; color: #000;">
                            <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">IHM Shop - ${sale.shop || 'Shop 1'}</div>
                            <div style="font-weight: 600;">Main Street, City Center</div>
                            <div style="font-size: 9.5px; font-weight: 500; margin-top: 2px;">ihm.irfan@gmail.com | 03128106948</div>
                        </div>

                        <!-- Customer Details Block -->
                        <div style="width: 100%; font-size: 10px; line-height: 1.35; margin-bottom: 6px; display: flex; justify-content: center; color: #000; font-family: Arial, sans-serif;">
                            <table style="border-collapse: collapse; margin: 0 auto; width: 100%;">
                                <tr>
                                    <td style="text-align: left; color: #000; font-weight: 600; padding-right: 4px; font-size: 10px; text-transform: uppercase; white-space: nowrap; width: 35%;">SOLD TO:</td>
                                    <td style="text-align: right; font-weight: 700; color: #000; font-size: 10px; width: 65%;">Walk-in Customer</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: #000; font-weight: 600; padding-right: 4px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">DATE:</td>
                                    <td style="text-align: right; font-weight: 700; color: #000; font-size: 10px;">${new Date(sale.timestamp).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; color: #000; font-weight: 600; padding-right: 4px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">INVOICE:</td>
                                    <td style="text-align: right; font-weight: 700; color: #000; font-size: 10px; text-transform: uppercase; font-family: monospace;">#${sale.displayId || sale.id.toString().substring(0,8).toUpperCase()}</td>
                                </tr>
                            </table>
                        </div>
                        <hr style="border: 0; border-top: 1px solid #000; width: 100%; margin-top: 4px; margin-bottom: 4px;">

                        <!-- Items Purchase Table Grid -->
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #000; margin-bottom: 6px; font-family: Arial, sans-serif;">
                            <thead>
                                <tr style="border-bottom: 1.5px solid #000; font-weight: 800; font-size: 11px;">
                                    <th style="text-align: left; padding-bottom: 3px; width: 35px; font-weight: 800;">Qty</th>
                                    <th style="text-align: left; padding-bottom: 3px; font-weight: 800; padding-left: 4px;">Item</th>
                                    <th style="text-align: right; padding-bottom: 3px; width: 100px; font-weight: 800;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <!-- Quantity Summary Divider Block -->
                        <div style="text-align: center; border-bottom: 1.5px solid #000000; padding-bottom: 3px; margin-bottom: 6px; font-weight: 800; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, sans-serif; color: #000;">
                            ${totalItemsCount} ${totalItemsCount === 1 ? 'ITEM' : 'ITEMS'} SOLD
                        </div>

                        <!-- Totals Section -->
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #000; margin-bottom: 6px; font-family: Arial, sans-serif;">
                            <tr style="font-weight: 700; font-size: 11px; line-height: 1.45;">
                                <td style="text-align: left; padding: 2px 0;">Subtotal:</td>
                                <td style="text-align: right; font-weight: 700; padding: 2px 0;">${UI.formatCurrency(sale.total || sale.subtotal)}</td>
                            </tr>
                            ${sale.discount > 0 ? `
                                <tr style="color: #000; font-weight: 700; line-height: 1.45;">
                                    <td style="text-align: left; padding: 2px 0;">Discount:</td>
                                    <td style="text-align: right; font-weight: 700; padding: 2px 0;">-${UI.formatCurrency(sale.discount)}</td>
                                </tr>
                            ` : ''}
                            <tr style="font-weight: 800; font-size: 14px; border-top: 1.5px dashed #000; border-bottom: 1.5px dashed #000;">
                                <td style="text-align: left; padding: 4px 0; color: #000;">TOTAL DUE:</td>
                                <td style="text-align: right; padding: 4px 0; font-weight: 900; color: #000;">${UI.formatCurrency(sale.netTotal || sale.total)}</td>
                            </tr>
                            <tr style="color: #000; font-size: 10px; font-weight: 700;">
                                <td style="text-align: left; padding-top: 4px;">PAYMENT MODE:</td>
                                <td style="text-align: right; padding-top: 4px; font-weight: 800; text-transform: uppercase;">${sale.paymentMethod}</td>
                            </tr>
                        </table>

                        <!-- Footnote Address Block -->
                        <div style="text-align: center; font-size: 10px; color: #000; margin-top: 8px; line-height: 1.3; border-top: 1px dashed #000; padding-top: 5px; font-family: Arial, sans-serif;">
                            <div style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">THANK YOU FOR SHOPPING AT IHM SHOP</div>
                            <div style="font-weight: 600; font-size: 9px; margin-top: 4px;">Exchange possible within 3 days with receipt.</div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        doc.close();
        printFrame.contentWindow.focus();
        setTimeout(() => printFrame.contentWindow.print(), 500);
    },

    initReturn() {
        const returnBtn = document.getElementById('pos-return-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('return-search-input');
                const errDiv = document.getElementById('return-search-error');
                const detailsDiv = document.getElementById('return-receipt-details');
                if (searchInput) searchInput.value = '';
                if (errDiv) { errDiv.style.display = 'none'; errDiv.textContent = ''; }
                if (detailsDiv) detailsDiv.style.display = 'none';
                
                // Show recent 10 receipts when opening
                this.renderReturnSearchResults('');
                UI.showModal('return-order-modal');
            });
        }

        const searchBtn = document.getElementById('return-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchReturnInvoice());
        }

        const searchInput = document.getElementById('return-search-input');
        if (searchInput) {
            const debouncedSearch = UI.debounce((val) => {
                if (val.trim().length > 0) {
                    this.renderReturnSearchResults(val);
                } else {
                    document.getElementById('return-search-results').innerHTML = '';
                }
            }, 250);
            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchReturnInvoice();
                }
            });
        }
    },

    renderReturnSearchResults(filter = '') {
        const resultsDiv = document.getElementById('return-search-results');
        if (!resultsDiv) return;

        const sales = Store.getFilteredSales() || [];
        // Sort sales by timestamp descending so newest show up first
        const sortedSales = [...sales].sort((a, b) => {
            const timeA = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });

        const query = filter.trim().toUpperCase();
        let matchedSales = sortedSales;

        if (query) {
            matchedSales = sortedSales.filter(sale => {
                if (!sale) return false;
                const saleId = (sale.id || '').toUpperCase();
                const cleanQuery = query.startsWith('INV-') ? query : 'INV-' + query;
                const dateStr = sale.timestamp ? new Date(sale.timestamp).toLocaleDateString().toUpperCase() : '';
                const totalStr = String(sale.total || '');
                
                // Check if search query matches sale ID, date, total, or any item name
                const matchesId = saleId.includes(query) || saleId.includes(cleanQuery);
                const matchesDate = dateStr.includes(query);
                const matchesTotal = totalStr.includes(query);
                const matchesItems = sale.items && sale.items.some(item => 
                    item && (item.name || '').toUpperCase().includes(query)
                );

                return matchesId || matchesDate || matchesTotal || matchesItems;
            });
        } else {
            // Default: show 10 recent receipts
            matchedSales = matchedSales.slice(0, 10);
        }

        if (matchedSales.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.8rem; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px solid var(--glass-border);">
                    No matching receipts found.
                </div>`;
            return;
        }

        resultsDiv.innerHTML = matchedSales.map(sale => {
            const itemsCount = (sale.items || []).reduce((sum, item) => sum + (item ? parseInt(item.quantity || 0) : 0), 0);
            return `
                <div class="return-search-item" onclick="POS.selectReturnReceipt('${sale.id}')" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer; transition: all 0.2s ease; margin-bottom: 0.25rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; flex: 1;">
                        <span style="font-family: monospace; font-weight: 700; color: var(--text-main); font-size: 0.85rem;">
                            #${sale.id || 'Unknown'}
                        </span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">
                            ${sale.timestamp ? new Date(sale.timestamp).toLocaleString() : 'N/A'} • ${itemsCount} Items
                        </span>
                    </div>
                    <div style="text-align: right; flex-shrink: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; color: var(--accent-success); font-size: 0.85rem;">
                            ${UI.formatCurrency(sale.total || 0)}
                        </span>
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.5;"></i>
                    </div>
                </div>
            `;
        }).join('');

        // Add hover styles dynamically
        const items = resultsDiv.getElementsByClassName('return-search-item');
        for (let item of items) {
            item.addEventListener('mouseenter', () => {
                item.style.borderColor = 'var(--accent-primary)';
                item.style.background = 'var(--bg-card-hover)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.borderColor = 'var(--glass-border)';
                item.style.background = 'var(--bg-card)';
            });
        }
    },

    selectReturnReceipt(saleId) {
        const searchInput = document.getElementById('return-search-input');
        if (searchInput) {
            searchInput.value = saleId;
        }
        this.searchReturnInvoice();
        
        // Clear suggestions once selected
        const resultsDiv = document.getElementById('return-search-results');
        if (resultsDiv) resultsDiv.innerHTML = '';
    },

    searchReturnInvoice() {
        const searchInput = document.getElementById('return-search-input');
        const errDiv = document.getElementById('return-search-error');
        const detailsDiv = document.getElementById('return-receipt-details');
        
        if (!searchInput || !errDiv || !detailsDiv) return;

        const query = (searchInput.value || '').trim().toUpperCase();
        if (!query) {
            errDiv.textContent = 'Please enter an Invoice ID.';
            errDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
            return;
        }

        // Search in local sales
        const sales = Store.getFilteredSales() || [];
        const cleanQuery = query.startsWith('INV-') ? query : 'INV-' + query;
        
        // Exact match first, then partial match
        let sale = sales.find(s => s && s.id && (s.id.toUpperCase() === query || s.id.toUpperCase() === cleanQuery));
        if (!sale) {
            sale = sales.find(s => s && s.id && (s.id.toUpperCase().includes(query) || s.id.toUpperCase().includes(cleanQuery)));
        }

        if (!sale) {
            errDiv.textContent = `Invoice "${query}" not found.`;
            errDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
            return;
        }

        // Found the sale! Render details
        errDiv.style.display = 'none';
        
        const receiptIdEl = document.getElementById('return-receipt-id');
        const receiptDateEl = document.getElementById('return-receipt-date');
        const itemsListEl = document.getElementById('return-receipt-items-list');

        if (receiptIdEl) receiptIdEl.textContent = `Invoice: #${sale.id}`;
        if (receiptDateEl) receiptDateEl.textContent = `Date: ${new Date(sale.timestamp).toLocaleDateString()}`;

        if (itemsListEl) {
            if (!sale.items || sale.items.length === 0) {
                itemsListEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No items in this order.</div>';
            } else {
                itemsListEl.innerHTML = sale.items.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="flex: 1; min-width: 0; padding-right: 0.5rem;">
                            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; margin-top: 0.15rem;">
                                <span>Size: ${item.size}</span>
                                <span style="height: 6px; width: 1px; background: var(--glass-border);"></span>
                                <span>${item.color}</span>
                                <span style="height: 6px; width: 1px; background: var(--glass-border);"></span>
                                <span style="font-weight: 600; color: var(--text-main);">Qty: ${item.quantity}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
                            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${UI.formatCurrency(item.price)}</span>
                            <button class="btn btn-ghost" style="color: var(--accent-danger); border: 1px solid rgba(239, 68, 68, 0.25); font-size: 0.7rem; padding: 0.25rem 0.5rem; height: auto; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 600; background: rgba(239, 68, 68, 0.03);" 
                                onclick="POS.returnItemClick('${sale.id}', '${item.id}', ${item.quantity})"
                                onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'"
                                onmouseout="this.style.background='rgba(239, 68, 68, 0.03)'">
                                <i class="fas fa-undo"></i> Return
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        detailsDiv.style.display = 'block';
    },

    returnItemClick(saleId, productId, currentQty) {
        const qtyStr = prompt(`How many units of this item would you like to return? (1 - ${currentQty}):`, "1");
        if (qtyStr === null) return; // Cancelled
        
        const qtyToReturn = parseInt(qtyStr);
        if (isNaN(qtyToReturn) || qtyToReturn <= 0 || qtyToReturn > currentQty) {
            alert(`Invalid quantity. Please enter a number between 1 and ${currentQty}.`);
            return;
        }

        if (confirm(`Confirm returning ${qtyToReturn} unit(s) of this item to stock?`)) {
            this.processReturn(saleId, productId, qtyToReturn);
        }
    },

    async processReturn(saleId, productId, qtyToReturn) {
        const data = Store.getData();
        const saleIndex = data.sales.findIndex(s => s.id === saleId);
        if (saleIndex === -1) {
            alert('Error: Sale not found.');
            return;
        }

        const sale = data.sales[saleIndex];
        const itemIndex = sale.items.findIndex(i => i.id === productId);
        if (itemIndex === -1) {
            alert('Error: Item not found in sale.');
            return;
        }

        const item = sale.items[itemIndex];
        
        // 1. Auto add to stock
        let product = data.inventory.find(p => p.id === productId);
        let isAccessory = false;
        if (!product && data.accessories) {
            product = data.accessories.find(a => a.id === productId);
            if (product) isAccessory = true;
        }

        if (product) {
            product.quantity = (parseInt(product.quantity) || 0) + qtyToReturn;
            console.log(`Updated stock of existing product "${product.name}": ${product.quantity}`);
        } else {
            // Restore deleted variant back to inventory
            const restoredProd = {
                id: productId,
                name: item.name,
                type: item.type || 'Round Neck',
                style: item.style || 'Plain',
                size: item.size || 'M',
                color: item.color || 'Black',
                quantity: qtyToReturn,
                price: parseFloat(item.price) || 0,
                costPrice: parseFloat(item.costPrice || item.cost_price || 0) || (parseFloat(item.price) * 0.6),
                lowStock: 5
            };

            // Remove from deletedIds if present so it doesn't get filtered out
            if (data.deletedIds) {
                data.deletedIds = data.deletedIds.filter(id => id !== productId);
            }

            const accessoryTypes = ['Watches', 'Belt', 'Chains', 'Bracelett', 'Socks', 'Arms Sleves', 'Underwears', 'Wallet', 'Glasses', 'Perfume'];
            if (item.type && accessoryTypes.includes(item.type)) {
                if (!data.accessories) data.accessories = [];
                data.accessories.push(restoredProd);
                console.log(`Restored deleted accessory:`, item.name);
            } else {
                data.inventory.push(restoredProd);
                console.log(`Restored deleted product:`, item.name);
            }
        }

        // 2. Update sale items and totals
        item.quantity -= qtyToReturn;
        


        if (item.quantity <= 0) {
            sale.items = sale.items.filter(i => i.id !== productId);
        }

        if (sale.items.length === 0) {
            // No items left, remove sale entirely
            data.sales = data.sales.filter(s => s.id !== saleId);
            
            // Track deleted sale ID to prevent cloud re-sync resurrection
            if (!data.deletedSaleIds) data.deletedSaleIds = [];
            if (!data.deletedSaleIds.includes(saleId)) {
                data.deletedSaleIds.push(saleId);
            }


            console.log(`Sale ${saleId} completely deleted (all items returned).`);
            UI.hideModal('return-order-modal');
            alert('Success: All items returned. Sale invoice has been voided.');
        } else {
            // Re-calculate financial totals
            sale.subtotal = sale.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            sale.discount = sale.subtotal * ((parseFloat(sale.discountPercent) || 0) / 100);
            sale.total = Math.max(0, sale.subtotal - sale.discount);
            console.log(`Sale ${saleId} updated totals: subtotal=${sale.subtotal}, total=${sale.total}`);
            
            // Re-render return panel
            setTimeout(() => {
                this.searchReturnInvoice();
            }, 100);
            alert('Success: Item(s) returned and stock updated!');
        }

        // Save data and dispatch update
        Store.saveData(data);
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));


    }
};

window.addToCart = (id) => POS.addToCart(id);
window.updateCartQty = (id, delta) => POS.updateCartQty(id, delta);

window.POS = POS;
