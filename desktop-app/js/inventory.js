
const Inventory = {
    init() {
        this.render();
        this.setupListeners();
    },

    render(filter = '') {
        const products = [...Store.getInventory(), ...Store.getAccessories()];
        this.populateProductSuggestions(products);
        let filtered = products;
        
        if (filter) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.type.toLowerCase().includes(filter.toLowerCase()) ||
                p.color.toLowerCase().includes(filter.toLowerCase())
            );
        }

        const tbody = document.querySelector('#inventory-table tbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">No products found</td></tr>`;
            return;
        }

        // Group by base product name
        const grouped = {};
        filtered.forEach(p => {
            if (!grouped[p.name]) {
                grouped[p.name] = {
                    name: p.name,
                    type: p.type,
                    style: p.style,
                    price: p.price,
                    variants: []
                };
            }
            grouped[p.name].variants.push(p);
        });

        const groupedList = Object.values(grouped);
        
        // Sort by type, then by name
        const typeOrder = { 
            'jeans': 1, 'trouser': 2, 'shorts': 3, 'tank top': 4, 'v-neck': 5, 'round neck': 6,
            'polo': 7, 'oversized': 8, 'dress shirt': 9, 'casual shirt': 10, 
            'watches': 20, 'belt': 21, 'chains': 22, 'bracelett': 23, 'socks': 24,
            'arms sleves': 25, 'underwears': 26, 'wallet': 27, 'glasses': 28, 'perfume': 29
        };
        const typeVal = (t) => typeOrder[t.toLowerCase()] || 99;
        
        groupedList.sort((a, b) => {
            const typeComp = typeVal(a.type) - typeVal(b.type);
            return typeComp !== 0 ? typeComp : a.name.localeCompare(b.name);
        });

        tbody.innerHTML = groupedList.map(product => {
            // Group variants by color
            const variantsByColor = {};
            const colorLabels = {};
            product.variants.forEach(v => {
                const col = v.color || 'Default';
                const colorKey = Store.normalizeVariantText(col) || 'default';
                if (!variantsByColor[colorKey]) {
                    variantsByColor[colorKey] = [];
                    colorLabels[colorKey] = col;
                }
                variantsByColor[colorKey].push(v);
            });

            const sortedColors = Object.keys(variantsByColor).sort((a, b) => colorLabels[a].localeCompare(colorLabels[b]));
            const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, 'N/A': 99 };
            const sizeVal = s => sizeOrder[s] !== undefined ? sizeOrder[s] : (parseFloat(s) || 98);

            const colorRowsHtml = sortedColors.map((color, idx) => {
                const colorVariants = [...variantsByColor[color]].sort((a, b) => sizeVal(a.size) - sizeVal(b.size));
                const colorLabel = colorLabels[color];

                const badgesHtml = colorVariants.map(v => `
                    <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: var(--bg-card); padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid var(--glass-border); font-size: 0.72rem;">
                        <span style="font-weight: 700; color: var(--text-main);">${v.size}</span>
                        <span style="height: 8px; width: 1px; background: var(--glass-border);"></span>
                        <span style="font-weight: 600; color: ${v.quantity <= (v.lowStock || 5) ? 'var(--accent-danger)' : 'var(--text-muted)'};">${v.quantity} units</span>
                    </div>
                `).join('');

                const isLast = idx === sortedColors.length - 1;
                return `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.4rem 0; width: 100%; border-bottom: ${isLast ? 'none' : '1px dashed var(--glass-border)'};">
                        <div style="width: 140px; flex-shrink: 0; display: flex; align-items: center;">
                            ${UI.getColorBadge(colorLabel)}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                            ${badgesHtml}
                        </div>
                    </div>
                `;
            }).join('');

            const totalQty = product.variants.reduce((sum, v) => sum + v.quantity, 0);

            return `
                <tr>
                    <td>
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                            ${product.name}
                            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-left: 0.5rem; background: var(--bg-card-hover); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid var(--glass-border);">
                                Total: ${totalQty}
                            </span>
                        </div>
                        <div style="margin-top: 0.4rem; display: flex; gap: 0.3rem;">
                            <button class="btn btn-ghost" style="color: var(--accent-success); font-size: 0.7rem; padding: 0.15rem 0.4rem; height: auto; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="window.quickAddStock('${product.name}')" title="Quick Add Color & Size">
                                <i class="fas fa-plus" style="font-size: 0.65rem;"></i> Quick Add
                            </button>
                            <button class="btn btn-ghost" style="color: var(--accent-primary); font-size: 0.7rem; padding: 0.15rem 0.4rem; height: auto; border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="window.masterEditProduct('${product.name}')" title="Edit Product Name & Price for All Variants">
                                <i class="fas fa-edit" style="font-size: 0.65rem;"></i> Master Edit
                            </button>
                            <button class="btn btn-ghost" style="color: var(--accent-danger); font-size: 0.7rem; padding: 0.15rem 0.4rem; height: auto; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="window.deleteProductGroup('${product.name}')" title="Delete Product and All Size/Color Variants">
                                <i class="fas fa-trash-alt" style="font-size: 0.65rem;"></i> Master Delete
                            </button>
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 0.8rem; color: var(--text-main);">${product.type}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${product.style}</div>
                    </td>
                    <td colspan="3" style="padding: 0.25rem 1rem; vertical-align: top;">
                        <div style="display: flex; flex-direction: column;">
                            ${colorRowsHtml}
                        </div>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: var(--text-main); font-size: 0.95rem;">
                        ${UI.formatCurrency(product.price)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    populateProductSuggestions(products) {
        const names = [...new Set(products.map(p => p.name))].sort();
        const datalist = document.getElementById('existing-products-list');
        if (!datalist) return;
        datalist.innerHTML = names.map(name => `<option value="${name.replace(/"/g, '&quot;')}">`).join('');
    },

    openAddModal(mode = 'clothing') {
        const form = document.getElementById('add-product-form');
        if (!form) return;

        form.reset();
        form.dataset.mode = mode;

        // Change modal header text
        const modal = document.getElementById('add-product-modal');
        const header = modal.querySelector('h2');
        if (header) {
            header.textContent = mode === 'clothing' ? 'Add New Product' : 'Add New Accessory';
        }

        // Change category dropdown options
        const typeSelect = form.elements['type'];
        const typeLabel = typeSelect.previousElementSibling;
        if (typeLabel) {
            typeLabel.textContent = mode === 'clothing' ? 'Article Type' : 'Accessory Type';
        }

        if (typeSelect) {
            if (mode === 'clothing') {
                typeSelect.innerHTML = `
                    <option>Round Neck</option>
                    <option>V-Neck</option>
                    <option>Polo</option>
                    <option>Oversized</option>
                    <option>Dress Shirt</option>
                    <option>Casual Shirt</option>
                    <option>Jeans</option>
                    <option>Trouser</option>
                    <option>Tank Top</option>
                    <option>Shorts</option>
                    <option>Leather Jacket</option>
                    <option>Suede Jacket</option>
                    <option>Fur Jacket</option>
                    <option>Puffer Jacket</option>
                    <option>Sweater</option>
                    <option>Half-Sleeve Sweater</option>
                `;
            } else {
                typeSelect.innerHTML = `
                    <option>Watches</option>
                    <option>Belt</option>
                    <option>Chains</option>
                    <option>Bracelett</option>
                    <option>Socks</option>
                    <option>Arms Sleves</option>
                    <option>Underwears</option>
                    <option>Wallet</option>
                    <option>Glasses</option>
                    <option>Perfume</option>
                `;
            }
        }

        // Change size options
        const sizeSelect = form.elements['size'];
        if (sizeSelect) {
            if (mode === 'clothing') {
                sizeSelect.innerHTML = `
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                `;
            } else {
                sizeSelect.innerHTML = `
                    <option>N/A</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                `;
            }
        }

        UI.showModal('add-product-modal');
    },

    setupListeners() {
        const addForm = document.getElementById('add-product-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct(addForm);
            });
        }

        const masterEditForm = document.getElementById('master-edit-product-form');
        if (masterEditForm) {
            masterEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMasterEditProduct(masterEditForm);
            });
        }

        const quickAddForm = document.getElementById('quick-add-stock-form');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickAddStock(quickAddForm);
            });
        }

        const nameInput = document.getElementById('add-product-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const enteredName = e.target.value;
                const products = [...Store.getInventory(), ...Store.getAccessories()];
                const existing = products.find(p => p.name.toLowerCase() === enteredName.toLowerCase());
                if (existing) {
                    const form = document.getElementById('add-product-form');
                    if (form) {
                        if (form.elements['type']) form.elements['type'].value = existing.type;
                        if (form.elements['style']) form.elements['style'].value = existing.style;
                        if (form.elements['price']) form.elements['price'].value = existing.price;
                        if (form.elements['costPrice']) form.elements['costPrice'].value = existing.costPrice || '';
                    }
                }
            });
        }

        const editForm = document.getElementById('edit-product-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateProduct(editForm);
            });
        }

        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.render(e.target.value));
        }
        
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'inventory') this.render();
        });

        window.addEventListener('inventoryUpdate', () => {
            this.render();
        });
    },

    editProduct(id) {
        const clothing = Store.getInventory().find(p => p.id === id);
        const accessory = Store.getAccessories().find(a => a.id === id);
        const item = clothing || accessory;
        if (!item) return;

        const isAccessory = !!accessory;

        const form = document.getElementById('edit-product-form');
        form.dataset.mode = isAccessory ? 'accessories' : 'clothing';
        
        // Update header
        const modal = document.getElementById('edit-product-modal');
        const header = modal.querySelector('h2');
        if (header) {
            header.textContent = isAccessory ? 'Edit Accessory' : 'Edit Product';
        }

        // Configure type dropdown options
        const typeSelect = form.elements['type'];
        const typeLabel = typeSelect.previousElementSibling;
        if (typeLabel) {
            typeLabel.textContent = isAccessory ? 'Accessory Type' : 'Article Type';
        }

        if (typeSelect) {
            if (isAccessory) {
                typeSelect.innerHTML = `
                    <option>Watches</option>
                    <option>Belt</option>
                    <option>Chains</option>
                    <option>Bracelett</option>
                    <option>Socks</option>
                    <option>Arms Sleves</option>
                    <option>Underwears</option>
                    <option>Wallet</option>
                    <option>Glasses</option>
                    <option>Perfume</option>
                `;
            } else {
                typeSelect.innerHTML = `
                    <option>V-Neck</option>
                    <option>Round Neck</option>
                    <option>Polo</option>
                    <option>Oversized</option>
                    <option>Dress Shirt</option>
                    <option>Casual Shirt</option>
                    <option>Jeans</option>
                    <option>Trouser</option>
                    <option>Tank Top</option>
                    <option>Shorts</option>
                    <option>Leather Jacket</option>
                    <option>Suede Jacket</option>
                    <option>Fur Jacket</option>
                    <option>Puffer Jacket</option>
                    <option>Sweater</option>
                    <option>Half-Sleeve Sweater</option>
                `;
            }
        }

        // Configure size options
        const sizeSelect = form.elements['size'];
        if (sizeSelect) {
            if (isAccessory) {
                sizeSelect.innerHTML = `
                    <option>N/A</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                `;
            } else {
                sizeSelect.innerHTML = `
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                `;
            }
        }

        form.elements['id'].value = item.id;
        form.elements['name'].value = item.name;
        form.elements['type'].value = item.type;
        form.elements['style'].value = item.style || 'Plain';
        // Rebuild size options for this article type, then restore saved size
        if (!isAccessory && typeof updateSizeOptions === 'function') {
            updateSizeOptions('edit-size-select', item.type, item.size);
        } else {
            form.elements['size'].value = item.size || 'N/A';
        }
        form.elements['color'].value = item.color;
        form.elements['price'].value = item.price;
        form.elements['costPrice'].value = item.costPrice || (item.price * 0.6);
        form.elements['quantity'].value = item.quantity;

        UI.showModal('edit-product-modal');
    },

    handleUpdateProduct(form) {
        const formData = new FormData(form);
        const id = formData.get('id');
        const updatedData = {
            name: formData.get('name'),
            type: formData.get('type'),
            style: formData.get('style'),
            size: formData.get('size'),
            color: formData.get('color'),
            price: parseFloat(formData.get('price')) || 0,
            costPrice: parseFloat(formData.get('costPrice')) || 0,
            quantity: parseInt(formData.get('quantity')) || 0
        };

        const duplicate = Store.findMatchingVariant(
            [...Store.getInventory(), ...Store.getAccessories()],
            updatedData,
            id
        );
        if (duplicate) {
            alert(`A matching variant already exists for ${updatedData.name} (${updatedData.color}, ${updatedData.size}). Use Quick Add to add stock to the existing variant.`);
            return;
        }

        Store.updateProduct(id, updatedData);
        UI.hideModal('edit-product-modal');
        


        this.render();
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    },

    getStockStatusClass(product) {
        if (product.quantity <= 0) return 'badge-danger';
        if (product.quantity <= product.lowStock) return 'badge-warning';
        return 'badge-success';
    },

    handleAddProduct(form) {
        const formData = new FormData(form);
        const mode = form.dataset.mode || 'clothing';
        
        const item = {
            name: formData.get('name'),
            type: formData.get('type'),
            style: formData.get('style'),
            size: formData.get('size'),
            color: formData.get('color'),
            quantity: parseInt(formData.get('quantity')) || 0,
            price: parseFloat(formData.get('price')) || 0,
            costPrice: parseFloat(formData.get('costPrice')) || 0,
            lowStock: parseInt(formData.get('lowStock') || 5)
        };

        if (mode === 'clothing') {
            Store.addProduct(item);
        } else {
            Store.addAccessory(item);
        }

        UI.hideModal('add-product-modal');
        form.reset();
        


        this.render();

        // Notify dashboard and other listeners
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    },

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            Store.deleteProduct(id);

            this.render();
            window.dispatchEvent(new CustomEvent('inventoryUpdate'));
        }
    },

    deleteProductGroup(name) {
        if (confirm(`⚠️ WARNING: Are you sure you want to delete "${name}" and ALL of its size & color variants? This action cannot be undone.`)) {
            const deletedIds = Store.deleteProductGroup(name);

            this.render();
            window.dispatchEvent(new CustomEvent('inventoryUpdate'));
        }
    },

    masterEditProduct(name) {
        const allProducts = [...Store.getInventory(), ...Store.getAccessories()];
        const products = allProducts.filter(p => p.name === name);
        if (products.length === 0) return;

        const firstProduct = products[0];
        const form = document.getElementById('master-edit-product-form');
        if (!form) return;

        form.elements['productName'].value = name;
        form.elements['name'].value = name;
        form.elements['price'].value = firstProduct.price;
        form.elements['costPrice'].value = firstProduct.costPrice || (firstProduct.price * 0.6);

        UI.showModal('master-edit-product-modal');
    },

    handleMasterEditProduct(form) {
        const originalName = form.elements['productName'].value;
        const newName = form.elements['name'].value;
        const newPrice = parseFloat(form.elements['price'].value) || 0;
        const newCostPrice = parseFloat(form.elements['costPrice'].value) || 0;

        const allProducts = [...Store.getInventory(), ...Store.getAccessories()];
        const products = allProducts.filter(p => p.name === originalName);

        if (products.length === 0) return;

        // Update all variants of this product
        products.forEach(product => {
            Store.updateProduct(product.id, {
                name: newName,
                price: newPrice,
                costPrice: newCostPrice
            });
        });

        UI.hideModal('master-edit-product-modal');
        


        this.render();
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    },

    quickAddStock(name) {
        const allProducts = [...Store.getInventory(), ...Store.getAccessories()];
        const products = allProducts.filter(p => p.name === name);
        if (products.length === 0) return;

        const firstProduct = products[0];
        const form = document.getElementById('quick-add-stock-form');
        if (!form) return;

        // Reset form
        form.reset();
        form.elements['productName'].value = name;

        // Show product details
        document.getElementById('quick-product-name').textContent = name;
        document.getElementById('quick-product-type').textContent = firstProduct.type;
        document.getElementById('quick-product-price').textContent = UI.formatCurrency(firstProduct.price);

        // Populate size options based on product type
        const sizeSelect = document.getElementById('quick-size-select');
        if (sizeSelect) {
            const isAccessory = Store.getAccessories().some(a => a.name === name);
            const sizeOptions = [];
            if (firstProduct.type === 'Dress Shirt') {
                sizeOptions.push('14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5');
            } else if (firstProduct.type === 'Jeans') {
                sizeOptions.push('28', '30', '32', '34', '36', '38');
            } else {
                if (isAccessory || ['Glasses', 'Perfume'].includes(firstProduct.type)) {
                    sizeOptions.push('N/A');
                }
                sizeOptions.push('S', 'M', 'L', 'XL', 'XXL');
            }
            
            sizeSelect.innerHTML = '<option value="">Select Size</option>';
            sizeOptions.forEach(size => {
                const opt = document.createElement('option');
                opt.value = size;
                opt.textContent = size;
                sizeSelect.appendChild(opt);
            });
        }

        UI.showModal('quick-add-stock-modal');
    },

    handleQuickAddStock(form) {
        const productName = form.elements['productName'].value;
        const color = form.elements['color'].value;
        const size = form.elements['size'].value;
        const quantity = parseInt(form.elements['quantity'].value) || 0;

        const allProducts = [...Store.getInventory(), ...Store.getAccessories()];
        const firstProduct = allProducts.find(p => p.name === productName);
        if (!firstProduct) return;

        // Create new variant
        const newVariant = {
            name: productName,
            type: firstProduct.type,
            style: firstProduct.style,
            color: color,
            size: size,
            quantity: quantity,
            price: firstProduct.price,
            costPrice: firstProduct.costPrice,
            lowStock: firstProduct.lowStock || 5
        };

        if (firstProduct.id && firstProduct.id.includes('_')) {
            // It's from clothing or accessories
            const isAccessory = Store.getAccessories().find(a => a.name === productName);
            if (isAccessory) {
                Store.addAccessory(newVariant);
            } else {
                Store.addProduct(newVariant);
            }
        }

        // Clear form to prevent accidental resubmit
        form.reset();
        form.elements['productName'].value = '';
        
        UI.hideModal('quick-add-stock-modal');



        this.render();
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    }
};

// Expose to window for inline onclicks
window.deleteProduct = (id) => Inventory.deleteProduct(id);
window.deleteProductGroup = (name) => Inventory.deleteProductGroup(name);
window.editProduct = (id) => Inventory.editProduct(id);
window.openAddModal = (mode) => Inventory.openAddModal(mode);
window.masterEditProduct = (name) => Inventory.masterEditProduct(name);
window.quickAddStock = (name) => Inventory.quickAddStock(name);

window.Inventory = Inventory;
