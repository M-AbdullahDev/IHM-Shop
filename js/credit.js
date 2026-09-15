const Udhaar = {
    cache: {
        customers: []
    },

    async init() {
        if (!window.supabaseClient) {
            console.warn("Supabase client not loaded yet.");
            return;
        }

        try {
            // Fetch customers with their aggregated balance from view
            const { data: customerBalances, error: cbErr } = await window.supabaseClient.from('customer_balances').select('*');
            if (cbErr) console.error("Error fetching customer_balances:", cbErr);
            
            // Fetch all transactions
            const { data: transactions, error: txErr } = await window.supabaseClient.from('udhaar_transactions').select('*').order('created_at', { ascending: false });
            if (txErr) console.error("Error fetching udhaar_transactions:", txErr);

            const customersMap = {};
            
            (customerBalances || []).forEach(c => {
                customersMap[c.customer_id] = {
                    id: c.customer_id,
                    name: c.name,
                    phone: c.phone,
                    balance: parseFloat(c.balance_due || 0),
                    transactions: []
                };
            });

            (transactions || []).forEach(t => {
                if (customersMap[t.customer_id]) {
                    customersMap[t.customer_id].transactions.push({
                        id: t.id,
                        date: t.created_at,
                        type: t.type, // 'credit' or 'payment'
                        amount: parseFloat(t.amount || 0),
                        note: t.note || ''
                    });
                }
            });

            this.cache.customers = Object.values(customersMap);
            console.log("Supabase Udhaar Initialized.");
        } catch (e) {
            console.error("Udhaar init error:", e);
        }
        
        window.Udhaar = this;
        this.setupListeners();
        this.renderLedger();
        
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'udhaar') {
                this.renderLedger();
            }
        });
    },

    setupListeners() {
        const customerForm = document.getElementById('udhaar-customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(customerForm);
                this.addCustomer({
                    name: fd.get('name'),
                    phone: fd.get('phone'),
                    openingBalance: parseFloat(fd.get('openingBalance')) || 0
                });
                UI.hideModal('udhaar-customer-modal');
                customerForm.reset();
            });
        }

        const transactionForm = document.getElementById('udhaar-transaction-form');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(transactionForm);
                this.addTransaction(
                    fd.get('customerId'),
                    fd.get('type'),
                    parseFloat(fd.get('amount')) || 0,
                    fd.get('note')
                );
                UI.hideModal('udhaar-transaction-modal');
                transactionForm.reset();
            });
        }
        
        const searchInput = document.getElementById('udhaar-search');
        if (searchInput) {
            const debouncedSearch = UI.debounce((val) => this.renderLedger(val), 250);
            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }
    },

    getData() {
        return this.cache;
    },

    saveData(data) {
        this.renderLedger();
    },

    addCustomer(customerData) {
        const newCustomer = {
            id: crypto.randomUUID(),
            name: customerData.name,
            phone: customerData.phone,
            balance: customerData.openingBalance,
            transactions: []
        };
        
        this.cache.customers.push(newCustomer);
        
        if (customerData.openingBalance > 0) {
            const txn = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                type: 'credit',
                amount: customerData.openingBalance,
                note: 'Opening Balance'
            };
            newCustomer.transactions.push(txn);
        }
        
        this._asyncInsertCustomer(newCustomer).catch(console.error);
        
        this.saveData(this.cache);
        UI.showToast('Customer added successfully', 'success');
    },

    async _asyncInsertCustomer(customer) {
        let shopId = null;
        if (window.Store && window.Store._getShopIdByName) {
            shopId = await window.Store._getShopIdByName(localStorage.getItem('active_shop') || 'Wholesale Shop');
        }
        
        await window.supabaseClient.from('customers').insert({
            id: customer.id,
            shop_id: shopId,
            name: customer.name,
            phone: customer.phone || null
        });
        
        if (customer.balance > 0) {
            const { data: userData } = await window.supabaseClient.auth.getUser();
            const userId = userData.user?.id;
            
            await window.supabaseClient.from('udhaar_transactions').insert({
                id: customer.transactions[0].id,
                customer_id: customer.id,
                shop_id: shopId,
                type: 'credit',
                amount: customer.balance,
                note: 'Opening Balance',
                created_by: userId
            });
        }
    },

    addTransaction(customerId, type, amount, note) {
        const customer = this.cache.customers.find(c => c.id === customerId);
        if (!customer) return;

        const txn = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: type, // 'credit' or 'payment'
            amount: amount,
            note: note || ''
        };

        customer.transactions.push(txn);

        if (type === 'credit') {
            customer.balance += amount; // Sale increases balance
        } else if (type === 'payment') {
            customer.balance -= amount; // Payment decreases balance
        }

        this._asyncInsertTransaction(customerId, txn).catch(console.error);

        this.saveData(this.cache);
        UI.showToast('Transaction saved', 'success');
        
        // Refresh details modal if it is open
        this.viewCustomerDetails(customerId);
    },

    async _asyncInsertTransaction(customerId, txn) {
        let shopId = null;
        if (window.Store && window.Store._getShopIdByName) {
            shopId = await window.Store._getShopIdByName(localStorage.getItem('active_shop') || 'Wholesale Shop');
        }
        const { data: userData } = await window.supabaseClient.auth.getUser();
        const userId = userData.user?.id;

        await window.supabaseClient.from('udhaar_transactions').insert({
            id: txn.id,
            customer_id: customerId,
            shop_id: shopId,
            type: txn.type,
            amount: txn.amount,
            note: txn.note,
            created_by: userId
        });
    },

    openAddCustomerModal() {
        UI.showModal('udhaar-customer-modal');
    },

    openTransactionModal(customerId) {
        const form = document.getElementById('udhaar-transaction-form');
        if (form) {
            form.reset();
            form.elements['customerId'].value = customerId;
        }
        UI.showModal('udhaar-transaction-modal');
    },

    viewCustomerDetails(customerId) {
        const customer = this.cache.customers.find(c => c.id === customerId);
        if (!customer) return;

        const nameEl = document.getElementById('udhaar-detail-name');
        if (nameEl) nameEl.textContent = customer.name;
        
        const balEl = document.getElementById('udhaar-detail-balance');
        if (balEl) balEl.textContent = UI.formatCurrency(customer.balance);
        
        const phoneEl = document.getElementById('udhaar-detail-contact');
        if (phoneEl) phoneEl.textContent = customer.phone || 'N/A';

        const historyTbody = document.getElementById('udhaar-detail-history');
        if (historyTbody) {
            const sortedTxns = [...customer.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
            historyTbody.innerHTML = sortedTxns.map(t => {
                const date = new Date(t.date).toLocaleDateString('en-PK', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                const color = t.type === 'credit' ? 'var(--accent-danger)' : 'var(--accent-success)';
                const typeLabel = t.type === 'credit' ? 'Credit (Sale)' : 'Payment In';
                
                return `
                    <tr>
                        <td style="font-size: 0.8rem; color: var(--text-muted);">${date}</td>
                        <td><span class="badge" style="background: ${color}20; color: ${color};">${typeLabel}</span></td>
                        <td style="font-weight: 600; color: ${color};">${UI.formatCurrency(t.amount)}</td>
                        <td style="font-size: 0.85rem;">${t.note || '-'}</td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="4" style="text-align: center;">No transactions found</td></tr>';
        }

        UI.showModal('udhaar-details-modal');
    },

    deleteCustomer(customerId) {
        if (!confirm('Are you sure you want to delete this customer and all their transactions?')) return;
        
        this.cache.customers = this.cache.customers.filter(c => c.id !== customerId);
        
        window.supabaseClient.from('customers').delete().eq('id', customerId).then(({ error }) => {
            if (error) console.error("Error deleting customer in Supabase:", error);
        });
        
        this.saveData(this.cache);
        UI.showToast('Customer deleted', 'success');
    },

    renderLedger(searchQuery = '') {
        const tbody = document.getElementById('udhaar-customers-list');
        const totalEl = document.getElementById('udhaar-total-market');
        if (!tbody || !totalEl) return;

        let totalMarket = 0;
        let filtered = this.cache.customers;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)));
        }

        tbody.innerHTML = filtered.map(c => {
            totalMarket += c.balance;
            
            let lastTxnDate = 'No activity';
            if (c.transactions && c.transactions.length > 0) {
                const latest = c.transactions[c.transactions.length - 1];
                lastTxnDate = new Date(latest.date).toLocaleDateString();
            }
            
            return `
                <tr>
                    <td data-label="Customer Name">
                        <div style="font-weight: 600; color: var(--text-main);">${c.name}</div>
                    </td>
                    <td data-label="Contact" style="color: var(--text-muted);">${c.phone || '-'}</td>
                    <td data-label="Last Transaction" style="color: var(--text-muted); font-size: 0.85rem;">${lastTxnDate}</td>
                    <td data-label="Balance Due" style="text-align: right; font-weight: 700; color: ${c.balance > 0 ? 'var(--accent-danger)' : 'var(--text-main)'};">
                        ${UI.formatCurrency(c.balance)}
                    </td>
                    <td data-label="Actions" style="text-align: center;">
                        <button class="btn btn-ghost btn-icon" onclick="window.Udhaar.openTransactionModal('${c.id}')" title="Add Transaction">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-ghost btn-icon" onclick="window.Udhaar.viewCustomerDetails('${c.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-ghost btn-icon" style="color: var(--accent-danger);" onclick="window.Udhaar.deleteCustomer('${c.id}')" title="Delete Customer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No customers found.</td></tr>';
        
        totalEl.textContent = UI.formatCurrency(totalMarket);
    }
};

window.Udhaar = Udhaar;
