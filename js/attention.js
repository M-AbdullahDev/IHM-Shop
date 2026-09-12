const Attention = {
    init() {
        console.log("Initializing Attention module...");
        this.render();
        
        window.addEventListener('inventoryUpdate', () => this.render());
        window.addEventListener('salesUpdate', () => this.render());
    },
    
    render() {
        this.renderLowStock();
        this.renderTopSelling();
    },
    
    renderLowStock() {
        const tbody = document.getElementById('attention-low-stock-list');
        if (!tbody) return;
        
        const inventory = Store.getInventory() || [];
        const accessories = Store.getAccessories() || [];
        const allProducts = [...inventory, ...accessories];
        
        const lowStockItems = allProducts.filter(p => {
            const qty = parseInt(p.quantity) || 0;
            const threshold = parseInt(p.lowStock) || 5;
            return qty <= threshold;
        });
        
        // Sort by quantity ascending
        lowStockItems.sort((a, b) => (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0));
        
        tbody.innerHTML = '';
        
        if (lowStockItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">No low stock alerts</td></tr>`;
            return;
        }
        
        lowStockItems.forEach(item => {
            const qty = parseInt(item.quantity) || 0;
            const threshold = parseInt(item.lowStock) || 5;
            let statusColor = qty <= 0 ? 'var(--accent-danger)' : 'var(--accent-warning)';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 0.75rem 0;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${item.type}</div>
                </td>
                <td style="padding: 0.75rem 0; color: var(--text-muted);">${item.shop || 'Unknown Shop'}</td>
                <td style="padding: 0.75rem 0; text-align: center; font-weight: 700; color: ${statusColor};">
                    ${qty} / ${threshold}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    renderTopSelling() {
        const tbody = document.getElementById('attention-top-selling-list');
        if (!tbody) return;
        
        const sales = Store.getSales() || [];
        
        // Calculate sales in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSales = sales.filter(s => new Date(s.timestamp) >= thirtyDaysAgo);
        
        // Aggregate by product ID/Name
        const productStats = {};
        
        recentSales.forEach(sale => {
            const shopName = sale.shop || 'Unknown Shop';
            (sale.items || []).forEach(item => {
                const key = `${item.id}_${shopName}`;
                if (!productStats[key]) {
                    productStats[key] = {
                        name: item.name,
                        shop: shopName,
                        sold: 0
                    };
                }
                productStats[key].sold += parseInt(item.quantity) || 1;
            });
        });
        
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10); // Top 10
            
        tbody.innerHTML = '';
        
        if (topProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">No recent sales data</td></tr>`;
            return;
        }
        
        topProducts.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 0.75rem 0; font-weight: 600;">${item.name}</td>
                <td style="padding: 0.75rem 0; color: var(--text-muted);">${item.shop}</td>
                <td style="padding: 0.75rem 0; text-align: center; font-weight: 700; color: var(--accent-success);">
                    ${item.sold}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
};

window.Attention = Attention;
