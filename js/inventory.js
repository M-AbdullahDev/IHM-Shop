
const Inventory = {
    init() {
        this.render();
        this.setupListeners();
    },

    render(filter = '') {
        const products = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
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
                        <span style="height: 8px; width: 1px; background: var(--glass-border);"></span>
                        <i class="fas fa-qrcode" style="cursor: pointer; color: var(--accent-primary);" onclick="window.showQRCode('${v.id}', '${v.name.replace(/'/g, "\\'")}', '${v.size}', '${v.color}')" title="Print QR Code"></i>
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

            const imageSrc = product.variants[0].image;

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            ${imageSrc ? `<div style="width: 70px; height: 70px; border-radius: 12px; overflow: hidden; background: var(--bg-card-hover); flex-shrink: 0;"><img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover;"></div>` : `<div style="width: 70px; height: 70px; border-radius: 12px; background: var(--bg-card-hover); flex-shrink: 0; display: flex; align-items: center; justify-content: center;"><i class="fas fa-mobile-alt" style="font-size: 1.5rem; color: var(--text-muted); opacity: 0.5;"></i></div>`}
                            <div>
                                <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">
                                    ${product.name}
                                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-left: 0.5rem; background: var(--bg-card-hover); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid var(--glass-border);">
                                        Total Stock: ${totalQty}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; padding-left: 86px;">
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
            typeLabel.textContent = mode === 'clothing' ? 'Category/Type' : 'Accessory Type';
        }

        if (typeSelect) {
            typeSelect.innerHTML = `
                <option>Cases</option>
                <option>Chargers</option>
                <option>Cables</option>
                <option>Screen Protectors</option>
                <option>Earbuds</option>
                <option>Holders</option>
                <option>Accessories</option>
            `;
        }



        const costGroup = document.getElementById('add-product-cost-group');
        const minGroup = document.getElementById('add-product-min-group');
        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');
        
        if (costGroup) {
            costGroup.style.display = isEmployee ? 'none' : 'block';
            
            // Set cost to 0 if employee so they don't have to enter it
            if (isEmployee) {
                const costInput = document.getElementById('add-product-cost-input');
                if (costInput) {
                    costInput.value = 0;
                    costInput.removeAttribute('required');
                }
            }
        }
        
        if (minGroup) {
            minGroup.style.display = isEmployee ? 'none' : 'block';
            
            if (isEmployee) {
                const minInput = document.getElementById('add-product-min-input');
                if (minInput) {
                    minInput.value = 0;
                    minInput.removeAttribute('required');
                }
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
                const products = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
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
        const clothing = Store.getFilteredInventory().find(p => p.id === id);
        const accessory = Store.getFilteredAccessories().find(a => a.id === id);
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
            typeLabel.textContent = isAccessory ? 'Accessory Type' : 'Category/Type';
        }

        if (typeSelect) {
            typeSelect.innerHTML = `
                <option>Cases</option>
                <option>Chargers</option>
                <option>Cables</option>
                <option>Screen Protectors</option>
                <option>Earbuds</option>
                <option>Holders</option>
                <option>Accessories</option>
            `;
        }

        // Configure size options
        const sizeSelect = form.elements['size'];
        if (sizeSelect) {
            sizeSelect.innerHTML = `
                <option>15 Pro</option>
                <option>S24 Ultra</option>
                <option>Universal</option>
                <option>N/A</option>
            `;
        }

        const costGroup = document.getElementById('edit-product-cost-group');
        const minGroup = document.getElementById('edit-product-min-group');
        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');

        if (costGroup) costGroup.style.display = isEmployee ? 'none' : 'block';
        if (minGroup) minGroup.style.display = isEmployee ? 'none' : 'block';

        form.elements['id'].value = item.id;
        form.elements['name'].value = item.name;
        form.elements['type'].value = item.type;

        form.elements['price'].value = item.price;
        if (!isEmployee) {
            form.elements['costPrice'].value = item.costPrice || (item.price * 0.6);
            form.elements['minSellingPrice'].value = item.minSellingPrice || item.costPrice || 0;
            form.elements['costPrice'].setAttribute('required', 'true');
            form.elements['minSellingPrice'].setAttribute('required', 'true');
        } else {
            form.elements['costPrice'].value = '';
            form.elements['minSellingPrice'].value = '';
            form.elements['costPrice'].removeAttribute('required');
            form.elements['minSellingPrice'].removeAttribute('required');
        }
        form.elements['quantity'].value = item.quantity;
        form.elements['image'].value = ''; // Reset image input

        UI.showModal('edit-product-modal');
    },

    async handleUpdateProduct(form) {
        const formData = new FormData(form);
        const id = formData.get('id');
        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');
        
        const imageFile = formData.get('image');
        const base64Image = await this.compressImage(imageFile);

        const updatedData = {
            name: formData.get('name'),
            type: formData.get('type'),
            price: parseFloat(formData.get('price')) || 0,
            costPrice: isEmployee ? undefined : (parseFloat(formData.get('costPrice')) || 0),
            minSellingPrice: isEmployee ? undefined : (parseFloat(formData.get('minSellingPrice')) || 0),
            quantity: parseInt(formData.get('quantity')) || 0
        };
        
        if (base64Image) {
            updatedData.image = base64Image;
        }

        const duplicate = Store.findMatchingVariant(
            [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()],
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

    async compressImage(file) {
        if (!file || file.size === 0) return null;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 150;
                    const MAX_HEIGHT = 150;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    async handleAddProduct(form) {
        const formData = new FormData(form);
        const mode = form.dataset.mode || 'clothing';
        
        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');

        const imageFile = formData.get('image');
        const base64Image = await this.compressImage(imageFile);

        const item = {
            name: formData.get('name'),
            type: formData.get('type'),
            quantity: parseInt(formData.get('quantity')) || 0,
            price: parseFloat(formData.get('price')) || 0,
            costPrice: isEmployee ? 0 : (parseFloat(formData.get('costPrice')) || 0),
            minSellingPrice: isEmployee ? 0 : (parseFloat(formData.get('minSellingPrice')) || 0),
            image: base64Image,
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
        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const products = allProducts.filter(p => p.name === name);
        if (products.length === 0) return;

        const firstProduct = products[0];
        const form = document.getElementById('master-edit-product-form');
        if (!form) return;

        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');

        form.elements['productName'].value = name;
        form.elements['name'].value = name;
        form.elements['price'].value = firstProduct.price;
        if (!isEmployee) {
            form.elements['costPrice'].value = firstProduct.costPrice || (firstProduct.price * 0.6);
        } else {
            form.elements['costPrice'].value = '';
        }

        UI.showModal('master-edit-product-modal');
    },

    handleMasterEditProduct(form) {
        const originalName = form.elements['productName'].value;
        const newName = form.elements['name'].value;
        const newPrice = parseFloat(form.elements['price'].value) || 0;
        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');
        const newCostPrice = isEmployee ? undefined : (parseFloat(form.elements['costPrice'].value) || 0);

        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const products = allProducts.filter(p => p.name === originalName);

        if (products.length === 0) return;

        // Update all variants of this product
        products.forEach(product => {
            const updates = {
                name: newName,
                price: newPrice
            };
            if (!isEmployee) {
                updates.costPrice = newCostPrice;
            }
            Store.updateProduct(product.id, updates);
        });

        UI.hideModal('master-edit-product-modal');
        


        this.render();
        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
    },

    quickAddStock(name) {
        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
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
            const isAccessory = Store.getFilteredAccessories().some(a => a.name === name);
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

        const allProducts = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const firstProduct = allProducts.find(p => p.name === productName);
        if (!firstProduct) return;

        let newName = productName;
        if (color || (size && size !== 'Default')) {
            const parts = [];
            if (color) parts.push(color);
            if (size && size !== 'Default') parts.push(size);
            newName = `${productName} - ${parts.join(' ')}`;
        }

        // Create new variant
        const newVariant = {
            name: newName,
            type: firstProduct.type,
            style: firstProduct.style,
            color: color,
            size: size,
            quantity: quantity,
            price: firstProduct.price,
            costPrice: firstProduct.costPrice,
            lowStock: firstProduct.lowStock || 5
        };

        const isAccessory = Store.getFilteredAccessories().find(a => a.name === productName);
        if (isAccessory) {
            Store.addAccessory(newVariant);
        } else {
            Store.addProduct(newVariant);
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

let currentQR = null;

window.showQRCode = (id, name, size, color) => {
    let modal = document.getElementById('qr-modal');
    if (!modal) {
        // Dynamically create the modal if it doesn't exist in DOM
        const modalHtml = `
        <div id="qr-modal" class="modal-overlay">
            <div class="glass-card" style="width: 100%; max-width: 400px; padding: 2rem; position: relative;">
                <button class="btn-icon" onclick="UI.hideModal('qr-modal')" style="position: absolute; top: 1rem; right: 1rem;">
                    <i class="fas fa-times"></i>
                </button>
                <h2 style="margin-bottom: 0.5rem;">Product QR Code</h2>
                <div id="qr-product-name" style="font-weight: 700; margin-bottom: 0.25rem;"></div>
                <div id="qr-product-details" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;"></div>
                
                <div style="background: white; padding: 1.5rem; border-radius: 12px; display: inline-block; margin-bottom: 1.5rem;">
                    <div id="qr-code-container"></div>
                </div>
                
                <button class="btn btn-primary" onclick="window.printQRCode()" style="width: 100%; justify-content: center;">
                    <i class="fas fa-print"></i> Print QR Code
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const container = document.getElementById('qr-code-container');
    if (container) {
        container.innerHTML = '';
        
        try {
            currentQR = new QRCode(container, {
                text: id,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error("QR Code Error:", e);
        }
    }
    
    const nameEl = document.getElementById('qr-product-name');
    if (nameEl) nameEl.textContent = name;
    
    const detailsEl = document.getElementById('qr-product-details');
    if (detailsEl) {
        const safeSize = (size && size !== 'undefined' && size !== 'null') ? size : '';
        const safeColor = (color && color !== 'undefined' && color !== 'null') ? color : '';
        
        let detailsText = '';
        if (safeSize) detailsText += `Size: ${safeSize}`;
        if (safeSize && safeColor) detailsText += ` | `;
        if (safeColor) detailsText += `Color: ${safeColor}`;
        
        detailsEl.textContent = detailsText;
    }
    
    UI.showModal('qr-modal');
};

window.downloadQRCode = () => {
    const container = document.getElementById('qr-code-container');
    const name = document.getElementById('qr-product-name').textContent || 'product';
    
    let dataUrl = '';
    const img = container.querySelector('img');
    const canvas = container.querySelector('canvas');
    
    if (img && img.src && img.src.startsWith('data:')) {
        dataUrl = img.src;
    } else if (canvas) {
        dataUrl = canvas.toDataURL('image/png');
    } else {
        alert('QR code image not generated yet.');
        return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    if(window.UI && window.UI.showToast) window.UI.showToast('QR Code downloading...');
};

window.printQRCode = () => {
    const container = document.getElementById('qr-code-container');
    const name = document.getElementById('qr-product-name').textContent;
    const details = document.getElementById('qr-product-details').textContent;
    
    if (!container.querySelector('img')) return;

    const qrImage = container.querySelector('img').src;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print QR Code - ${name}</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 20px; }
                .label-container { display: inline-block; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
                img { width: 150px; height: 150px; }
                h3 { margin: 10px 0 5px 0; font-size: 16px; }
                p { margin: 0; font-size: 14px; color: #555; }
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                <img src="${qrImage}" />
                <h3>${name}</h3>
                <p>${details}</p>
            </div>
            <script>
                window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
