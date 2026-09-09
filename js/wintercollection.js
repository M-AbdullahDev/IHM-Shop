
const WinterCollection = {
    init() {
        this.render();
        this.setupListeners();
    },

    winterCollectionTypes: ["Leather Jacket", "Suede Jacket", "Fur Jacket", "Puffer Jacket", "Sweater", "Half-Sleeve Sweater"],

    isWinterItem(item) {
        return this.winterCollectionTypes.includes(item.type);
    },

    render(filter = '') {
        const products = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()].filter(p => this.isWinterItem(p));
        let filtered = products;
        
        if (filter) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.type.toLowerCase().includes(filter.toLowerCase()) ||
                p.color.toLowerCase().includes(filter.toLowerCase())
            );
        }

        const tbody = document.querySelector('#wintercollection-table tbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">No products found in Winter Collection</td></tr>`;
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
        
        // Sort by name
        groupedList.sort((a, b) => a.name.localeCompare(b.name));

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

    setupListeners() {
        const searchInput = document.getElementById('wintercollection-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.render(e.target.value));
        }
        
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'wintercollection') this.render();
        });

        window.addEventListener('inventoryUpdate', () => {
            this.render();
        });
    }
};

window.WinterCollection = WinterCollection;
