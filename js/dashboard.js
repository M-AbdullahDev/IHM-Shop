
const Dashboard = {
    init() {
        this.renderRecentSales();
        this.setupListeners();
    },

    setupListeners() {
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'dashboard') {
                this.renderRecentSales();
            }
        });

        window.addEventListener('inventoryUpdate', () => {
            this.renderRecentSales();
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
                <td><span style="font-family: monospace; font-weight: 700; color: var(--text-main);">#${sale.id}</span></td>
                <td>${(sale.items || []).length} items</td>
                <td style="font-weight: 700; color: var(--accent-success);">${UI.formatCurrency(sale.total)}</td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${sale.timestamp ? new Date(sale.timestamp).toLocaleString() : 'N/A'}</td>
            </tr>
        `).join('');
    }
};

window.Dashboard = Dashboard;
