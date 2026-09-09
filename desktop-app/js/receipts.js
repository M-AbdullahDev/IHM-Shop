const Receipts = {
    activeSale: null,

    init() {
        this.setupListeners();
    },

    setupListeners() {
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'receipts') {
                this.render();
            }
        });

        window.addEventListener('inventoryUpdate', () => {
            this.render();
        });

        const searchInput = document.getElementById('receipts-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.render(e.target.value));
        }

        const reprintBtn = document.getElementById('reprint-receipt-btn');
        if (reprintBtn) {
            reprintBtn.addEventListener('click', () => {
                if (this.activeSale) {
                    POS.generateReceipt(this.activeSale);
                }
            });
        }
    },

    render(filter = '') {
        const sales = Store.getSales() || [];
        const container = document.getElementById('receipts-list');
        if (!container) return;

        // Sort by timestamp descending so newest sales show up first
        let sortedSales = [...sales].sort((a, b) => {
            const timeA = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
            const validA = isNaN(timeA) ? 0 : timeA;
            const validB = isNaN(timeB) ? 0 : timeB;
            return validB - validA;
        });

        if (filter) {
            sortedSales = sortedSales.filter(sale => {
                if (!sale) return false;
                const saleId = sale.id ? String(sale.id).toLowerCase() : '';
                const saleDate = sale.timestamp ? new Date(sale.timestamp).toLocaleString().toLowerCase() : '';
                const query = filter.toLowerCase();
                return saleId.includes(query) || saleDate.includes(query);
            });
        }

        if (sortedSales.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-receipt" style="font-size: 2.5rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                        No receipts found.
                    </td>
                </tr>`;
            return;
        }

        container.innerHTML = sortedSales.map(sale => {
            if (!sale) return '';
            const items = sale.items || [];
            const itemsCount = items.reduce((sum, item) => sum + (item ? parseInt(item.quantity || 0) : 0), 0);
            return `
                <tr>
                    <td>
                        <span style="font-family: monospace; font-weight: 700; color: var(--text-main); font-size: 1rem;">
                            #${sale.id || 'Unknown'}
                        </span>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">
                        ${sale.timestamp ? new Date(sale.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                        <span style="font-weight: 600;">${itemsCount} Items</span>
                    </td>
                    <td style="font-weight: 700; color: var(--accent-success);">
                        ${UI.formatCurrency(sale.total || 0)}
                    </td>
                    <td>
                        <span class="badge" style="text-transform: uppercase; background: var(--bg-card-hover); color: var(--text-main); border: 1px solid var(--glass-border); padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            ${sale.paymentMethod || 'Cash'}
                        </span>
                    </td>
                    <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-ghost btn-icon" onclick="window.viewReceipt('${sale.id}')" title="View Receipt">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-ghost btn-icon" onclick="window.deleteReceipt('${sale.id}')" title="Delete Receipt" style="color: var(--accent-danger);">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    viewReceipt(saleId) {
        const sales = Store.getSales() || [];
        const sale = sales.find(s => s && s.id === saleId);
        if (!sale) return;

        this.activeSale = sale;
        const modalBody = document.getElementById('receipt-modal-body');
        if (modalBody) {
            const items = sale.items || [];
            const itemsHtml = items.map(item => {
                if (!item) return '';
                return `
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem; border-bottom: 1px dashed var(--glass-border); padding-bottom: 0.15rem;">
                        <span>${item.name || 'Item'} (${item.size || 'N/A'}/${item.color || 'N/A'}) x${item.quantity || 0}</span>
                        <span>${UI.formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                    </div>
                `;
            }).join('');

            modalBody.innerHTML = `
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 1.4rem; font-weight: 800; letter-spacing: 4px; margin-bottom: 0.25rem; color: var(--text-main);">DEMO SHOP</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Luxury Retail Pakistan</div>
                </div>
                <div style="font-size: 0.7rem; border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); padding: 0.35rem 0; margin-bottom: 1rem; display: flex; justify-content: space-between; color: var(--text-muted);">
                    <span>INVOICE: #${sale.id}</span>
                    <span>${new Date(sale.timestamp).toLocaleString()}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    ${itemsHtml}
                </div>
                <div style="font-size: 0.85rem; border-top: 1px solid var(--glass-border); padding-top: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="color: var(--text-muted);">Subtotal:</span>
                        <span>${UI.formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; color: var(--accent-danger);">
                            <span>Discount (${sale.discountPercent || Math.round((sale.discount / sale.subtotal) * 100)}%):</span>
                            <span>-${UI.formatCurrency(sale.discount)}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; border-top: 2px dashed var(--glass-border); padding-top: 0.4rem; margin-top: 0.4rem; color: var(--text-main);">
                        <span>TOTAL:</span>
                        <span>${UI.formatCurrency(sale.total)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem;">
                        <span>PAYMENT MODE:</span>
                        <span style="text-transform: uppercase;">${sale.paymentMethod}</span>
                    </div>
                </div>
            `;
            UI.showModal('view-receipt-modal');
        }
    },

    async deleteReceipt(saleId) {
        if (!confirm(`Are you sure you want to delete receipt #${saleId}? This will restore stock levels and delete the receipt from the local database.`)) {
            return;
        }

        try {
            // 1. Delete locally & restore stock
            const success = Store.deleteSale(saleId);
            if (!success) {
                alert('Receipt not found locally.');
                return;
            }



            // 3. Dispatch update to trigger re-renders & auto-sync of inventory
            window.dispatchEvent(new CustomEvent('inventoryUpdate'));
            
            alert(`Receipt #${saleId} has been successfully deleted.`);
        } catch (error) {
            console.error('Error deleting receipt:', error);
            alert(`Error deleting receipt: ${error.message}`);
        }
    }
};

window.Receipts = Receipts;
window.viewReceipt = (saleId) => Receipts.viewReceipt(saleId);
window.deleteReceipt = (saleId) => Receipts.deleteReceipt(saleId);
