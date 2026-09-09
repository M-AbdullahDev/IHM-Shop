const Store = {
    cache: {
        inventory: [],
        accessories: [],
        sales: [],
        returns: [],
        shops: [],
        categories: []
    },

    async init() {
        console.log("Initializing Supabase Store...");
        try {
            if (!window.supabaseClient) {
                console.warn("Supabase client not loaded yet.");
                return;
            }

            // Fetch shops
            const { data: shops } = await window.supabaseClient.from('shops').select('*');
            this.cache.shops = shops || [];

            // Fetch categories
            const { data: categories } = await window.supabaseClient.from('categories').select('*');
            this.cache.categories = categories || [];

            // Fetch products
            const { data: products } = await window.supabaseClient.from('products').select(`
                *,
                category:categories(name, is_accessory),
                shop:shops(name)
            `);
            
            const allProducts = products || [];
            
            // Map to old structure format
            this.cache.inventory = allProducts
                .filter(p => !p.category || !p.category.is_accessory)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    color: p.color,
                    size: p.storage, // Using storage column for 'size' mapping
                    type: p.category ? p.category.name : '',
                    price: p.price,
                    costPrice: p.cost_price,
                    minSellingPrice: p.min_selling_price,
                    quantity: p.stock_quantity,
                    lowStock: p.low_stock_threshold,
                    shop: p.shop ? p.shop.name : 'Wholesale Shop',
                    shop_id: p.shop_id,
                    category_id: p.category_id,
                    barcode: p.barcode,
                    image: p.image_url
                }));

            this.cache.accessories = allProducts
                .filter(p => p.category && p.category.is_accessory)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    color: p.color,
                    size: p.storage,
                    type: p.category ? p.category.name : '',
                    price: p.price,
                    costPrice: p.cost_price,
                    minSellingPrice: p.min_selling_price,
                    quantity: p.stock_quantity,
                    lowStock: p.low_stock_threshold,
                    shop: p.shop ? p.shop.name : 'Wholesale Shop',
                    shop_id: p.shop_id,
                    category_id: p.category_id,
                    barcode: p.barcode,
                    image: p.image_url
                }));

            // Fetch sales
            const { data: sales } = await window.supabaseClient.from('sales').select(`
                *,
                shop:shops(name),
                customer:customers(name, phone),
                items:sale_items(
                    *,
                    product:products(name)
                )
            `).order('created_at', { ascending: false });

            this.cache.sales = (sales || []).map(s => ({
                id: s.id,
                displayId: s.id.substring(0,8).toUpperCase(),
                timestamp: s.created_at,
                total: s.total_amount,
                discount: s.discount,
                netTotal: s.net_amount,
                paid: s.paid_amount,
                paymentMethod: s.payment_method,
                shop: s.shop ? s.shop.name : 'Unknown Shop',
                shop_id: s.shop_id,
                customer_id: s.customer_id,
                customerName: s.customer ? s.customer.name : 'Walk-in',
                items: s.items.map(i => ({
                    id: i.product_id,
                    name: i.product ? i.product.name : 'Unknown',
                    price: i.unit_price,
                    quantity: i.quantity,
                    subtotal: i.subtotal
                }))
            }));

            console.log("Supabase Store Initialized.");
            window.dispatchEvent(new CustomEvent('inventoryUpdate'));
        } catch (e) {
            console.error("Store init error:", e);
        }
    },

    getData() {
        // Compatibility function for anything still expecting old zyro_data format
        return {
            inventory: this.cache.inventory,
            accessories: this.cache.accessories,
            sales: this.cache.sales,
            returns: this.cache.returns,
            deletedIds: [],
            deletedSaleIds: []
        };
    },
    
    saveData(data) {
        // Legacy, ignored in Supabase mode
    },

    getInventory() {
        return this.cache.inventory;
    },

    getFilteredInventory() {
        const activeShop = localStorage.getItem('active_shop') || 'All Shops';
        if (activeShop === 'All Shops') return this.cache.inventory;
        return this.cache.inventory.filter(item => !item.shop || item.shop === activeShop);
    },

    getAccessories() {
        return this.cache.accessories;
    },

    getFilteredAccessories() {
        const activeShop = localStorage.getItem('active_shop') || 'All Shops';
        if (activeShop === 'All Shops') return this.cache.accessories;
        return this.cache.accessories.filter(item => !item.shop || item.shop === activeShop);
    },

    getSales() {
        return this.cache.sales;
    },

    getFilteredSales() {
        const activeShop = localStorage.getItem('active_shop') || 'All Shops';
        if (activeShop === 'All Shops') return this.cache.sales;
        return this.cache.sales.filter(sale => sale.shop === activeShop);
    },

    getReturns() {
        return this.cache.returns;
    },

    generateIdFromName(name) {
        return crypto.randomUUID(); // Supabase uses UUIDs
    },

    normalizeVariantText(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    },

    isSameVariant(a, b) {
        return this.normalizeVariantText(a.name) === this.normalizeVariantText(b.name) &&
            this.normalizeVariantText(a.color) === this.normalizeVariantText(b.color) &&
            this.normalizeVariantText(a.size) === this.normalizeVariantText(b.size);
    },

    findMatchingVariant(items, target, excludeId = null) {
        return items.find(item => item.id !== excludeId && this.isSameVariant(item, target));
    },

    // ASYNC DB WRITERS 
    
    async _getOrCreateCategory(name, isAccessory) {
        let cat = this.cache.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (cat) return cat.id;
        
        const newCat = { id: crypto.randomUUID(), name, is_accessory: isAccessory };
        this.cache.categories.push(newCat);
        await window.supabaseClient.from('categories').insert(newCat);
        return newCat.id;
    },
    
    async _getShopIdByName(name) {
        const shop = this.cache.shops.find(s => s.name === name);
        if (shop) return shop.id;
        const defaultShop = this.cache.shops.find(s => s.name === 'Wholesale Shop');
        return defaultShop ? defaultShop.id : null;
    },

    addProduct(product) {
        const existing = this.findMatchingVariant(this.cache.inventory, product);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) || 0) + (parseInt(product.quantity) || 0);
            existing.price = product.price;
            existing.costPrice = product.costPrice;
            existing.lowStock = product.lowStock;
            
            this._asyncUpdateProduct(existing).catch(console.error);
            return existing;
        }
        
        product.id = crypto.randomUUID();
        product.shop = localStorage.getItem('active_shop') || 'All Shops';
        if (product.shop === 'All Shops') product.shop = 'Wholesale Shop';
        
        this.cache.inventory.push(product);
        this._asyncInsertProduct(product, false).catch(console.error);
        return product;
    },

    addAccessory(accessory) {
        const existing = this.findMatchingVariant(this.cache.accessories, accessory);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) || 0) + (parseInt(accessory.quantity) || 0);
            existing.price = accessory.price;
            existing.costPrice = accessory.costPrice;
            existing.lowStock = accessory.lowStock;
            
            this._asyncUpdateProduct(existing).catch(console.error);
            return existing;
        }
        
        accessory.id = crypto.randomUUID();
        accessory.shop = localStorage.getItem('active_shop') || 'All Shops';
        if (accessory.shop === 'All Shops') accessory.shop = 'Wholesale Shop';
        
        this.cache.accessories.push(accessory);
        this._asyncInsertProduct(accessory, true).catch(console.error);
        return accessory;
    },

    async _asyncInsertProduct(item, isAccessory) {
        const categoryId = await this._getOrCreateCategory(item.type || (isAccessory ? 'Accessory' : 'Mobile'), isAccessory);
        const shopId = await this._getShopIdByName(item.shop);
        
        await window.supabaseClient.from('products').insert({
            id: item.id,
            shop_id: shopId,
            category_id: categoryId,
            name: item.name,
            color: item.color,
            storage: item.size,
            price: item.price,
            cost_price: item.costPrice,
            min_selling_price: item.minSellingPrice || item.costPrice,
            stock_quantity: item.quantity,
            low_stock_threshold: item.lowStock,
            image_url: item.image
        });
    },
    
    async _asyncUpdateProduct(item) {
        const updateData = {
            price: item.price,
            cost_price: item.costPrice,
            stock_quantity: item.quantity,
            low_stock_threshold: item.lowStock
        };
        if (item.image) {
            updateData.image_url = item.image;
        }
        await window.supabaseClient.from('products')
            .update(updateData)
            .eq('id', item.id);
    },

    updateProduct(id, updatedData) {
        let isInventory = true;
        let index = this.cache.inventory.findIndex(p => p.id === id);
        if (index === -1) {
            isInventory = false;
            index = this.cache.accessories.findIndex(a => a.id === id);
        }
        
        if (index !== -1) {
            const list = isInventory ? this.cache.inventory : this.cache.accessories;
            list[index] = { ...list[index], ...updatedData };
            this._asyncUpdateProductFull(list[index]).catch(console.error);
            return list[index];
        }
        return null;
    },
    
    async _asyncUpdateProductFull(item) {
        const updateData = {
            name: item.name,
            color: item.color,
            storage: item.size,
            price: item.price,
            cost_price: item.costPrice,
            min_selling_price: item.minSellingPrice || item.costPrice,
            stock_quantity: item.quantity,
            low_stock_threshold: item.lowStock
        };
        if (item.image) {
            updateData.image_url = item.image;
        }
        await window.supabaseClient.from('products')
            .update(updateData)
            .eq('id', item.id);
    },

    deleteProduct(id) {
        this.cache.inventory = this.cache.inventory.filter(p => p.id !== id);
        this.cache.accessories = this.cache.accessories.filter(a => a.id !== id);
        
        window.supabaseClient.from('products').delete().eq('id', id).then(() => {
            console.log("Deleted product from Supabase");
        });
    },

    addSale(sale) {
        sale.id = crypto.randomUUID();
        sale.displayId = sale.id.substring(0,8).toUpperCase();
        sale.timestamp = new Date().toISOString();
        
        sale.shop = localStorage.getItem('active_shop') || 'All Shops';
        if (sale.shop === 'All Shops') sale.shop = 'Wholesale Shop';

        this.cache.sales.push(sale);
        
        // Optimistic stock update for UI
        sale.items.forEach(item => {
            const product = this.cache.inventory.find(p => p.id === item.id);
            if (product) {
                product.quantity -= item.quantity;
            } else {
                const accessory = this.cache.accessories.find(a => a.id === item.id);
                if (accessory) accessory.quantity -= item.quantity;
            }
        });

        this._asyncInsertSale(sale).catch(console.error);
        return sale;
    },
    
    async _asyncInsertSale(sale) {
        const shopId = await this._getShopIdByName(sale.shop);
        
        // Ensure customer exists if customerName provided
        let customerId = null;
        if (sale.customerName && sale.customerName !== 'Walk-in') {
            const { data: custs } = await window.supabaseClient.from('customers').select('id').eq('name', sale.customerName).limit(1);
            if (custs && custs.length > 0) {
                customerId = custs[0].id;
            } else {
                customerId = crypto.randomUUID();
                await window.supabaseClient.from('customers').insert({
                    id: customerId,
                    name: sale.customerName,
                    phone: sale.customerPhone || null,
                    shop_id: shopId
                });
            }
        }
        
        // Insert Sale
        await window.supabaseClient.from('sales').insert({
            id: sale.id,
            shop_id: shopId,
            user_id: (await window.supabaseClient.auth.getUser()).data.user?.id,
            customer_id: customerId,
            total_amount: sale.total,
            discount: sale.discount,
            net_amount: sale.netTotal,
            paid_amount: sale.paid,
            payment_method: sale.paymentMethod || 'cash'
        });
        
        // Insert Sale Items
        const saleItems = sale.items.map(i => ({
            sale_id: sale.id,
            product_id: i.id,
            quantity: i.quantity,
            unit_price: i.price,
            subtotal: i.subtotal
        }));
        
        await window.supabaseClient.from('sale_items').insert(saleItems);
        // Triggers in the database will handle stock reduction securely.
    },

    deleteSale(saleId) {
        const saleIndex = this.cache.sales.findIndex(s => s && s.id === saleId);
        if (saleIndex === -1) return false;
        
        const sale = this.cache.sales[saleIndex];
        
        // Optimistic restore stock
        if (sale.items) {
            sale.items.forEach(item => {
                const product = this.cache.inventory.find(p => p.id === item.id) || 
                                this.cache.accessories.find(a => a.id === item.id);
                if (product) {
                    product.quantity = (product.quantity || 0) + parseInt(item.quantity || 0);
                }
            });
        }

        this.cache.sales.splice(saleIndex, 1);
        
        // Note: Real db triggers would handle restoring stock upon sale deletion,
        // but for now we just delete the sale record.
        window.supabaseClient.from('sales').delete().eq('id', saleId).catch(console.error);
        return true;
    }
};

window.Store = Store;
