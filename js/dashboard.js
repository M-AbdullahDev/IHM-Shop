
const Dashboard = {
    init() {
        this.renderRecentSales();
        this.renderShopCards();
        this.setupListeners();
    },

    setupListeners() {
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'dashboard') {
                this.renderRecentSales();
                this.renderShopCards();
            }
        });

        window.addEventListener('inventoryUpdate', () => {
            this.renderRecentSales();
            this.renderShopCards();
        });
    },

    renderShopCards() {
        const allProducts = [...(Store.cache.inventory || []), ...(Store.cache.accessories || [])];
        const allSales = Store.cache.sales || [];

        const shops = ['Wholesale Shop', 'Shop 2', 'Shop 3'];
        const ids = ['dash-wholesale-count', 'dash-shop2-count', 'dash-shop3-count'];

        shops.forEach((shopName, i) => {
            const el = document.getElementById(ids[i]);
            if (!el) return;

            const prodCount = allProducts.filter(p => p.shop === shopName).length;
            const totalStock = allProducts.filter(p => p.shop === shopName).reduce((sum, p) => sum + (p.quantity || 0), 0);
            const shopSales = allSales.filter(s => s.shop === shopName);
            const salesToday = shopSales.filter(s => {
                if (!s.timestamp) return false;
                const d = new Date(s.timestamp);
                const now = new Date();
                return d.toDateString() === now.toDateString();
            });
            const todayTotal = salesToday.reduce((sum, s) => sum + (s.total || 0), 0);

            el.innerHTML = `${prodCount} products · ${totalStock} units` +
                (todayTotal > 0 ? `<br><span style="color: var(--accent-success); font-weight: 700;">Today: Rs. ${todayTotal.toLocaleString()}</span>` : '');
        });
    },

    renderRecentSales() {
        const sales = Store.getFilteredSales() || [];
        const sortedSales = [...sales].sort((a, b) => {
            const timeA = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
            const validA = isNaN(timeA) ? 0 : timeA;
            const validB = isNaN(timeB) ? 0 : timeB;
            return validB - validA;
        });
        const recentSales = sortedSales.slice(0, 5);
        const container = document.getElementById('recent-sales-list');
        if (!container) return;

        if (recentSales.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No sales recorded yet</td></tr>';
            return;
        }

        container.innerHTML = recentSales.map(sale => `
            <tr>
                <td><span style="font-family: monospace; font-weight: 700; color: var(--text-main);">#${sale.displayId || sale.id}</span></td>
                <td>${(sale.items || []).length} items</td>
                <td style="font-weight: 700; color: var(--accent-success);">${UI.formatCurrency(sale.total)}</td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${sale.timestamp ? new Date(sale.timestamp).toLocaleString() : 'N/A'}</td>
            </tr>
        `).join('');
    }
};

window.Dashboard = Dashboard;
