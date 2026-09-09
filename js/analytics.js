const Analytics = {
    isRendering: false,
    activeRange: 'daily',

    ranges: {
        daily: {
            label: 'Today',
            title: 'Daily Sales',
            subtitle: 'Showing sales completed today.'
        },
        yesterday: {
            label: 'Yesterday',
            title: 'Yesterday Sales',
            subtitle: 'Showing sales completed yesterday.'
        },
        weekly: {
            label: 'Last 7 days',
            title: 'Weekly Sales',
            subtitle: 'Showing all sales from the last 7 days.'
        },
        monthly: {
            label: 'This month',
            title: 'Monthly Sales',
            subtitle: 'Showing sales from the current month.'
        },
        previousMonth: {
            label: 'Previous month',
            title: 'Previous Month Sales',
            subtitle: 'Showing every sale completed during the full previous calendar month.'
        }
    },

    init() {
        this.setupListeners();
    },

    setupListeners() {
        window.addEventListener('pageShow', (e) => {
            if (e.detail.page === 'analytics') {
                requestAnimationFrame(() => this.render());
            }
        });

        window.addEventListener('inventoryUpdate', () => {
            this.render();
        });

        document.querySelectorAll('[data-analytics-range]').forEach(button => {
            button.addEventListener('click', () => {
                this.activeRange = button.dataset.analyticsRange || 'daily';
                document.querySelectorAll('[data-analytics-range]').forEach(tab => {
                    tab.classList.toggle('active', tab === button);
                });
                const reportRange = document.getElementById('analytics-report-range');
                if (reportRange && this.ranges[this.activeRange]) {
                    reportRange.value = this.activeRange;
                }

                // Reset custom date range when standard range tabs are clicked
                this.clearCustomDateRange();

                this.render();
            });
        });

        ['analytics-date-from', 'analytics-date-to'].forEach(id => {
            const picker = document.getElementById(id);
            if (picker) {
                picker.addEventListener('change', () => {
                    if (this.hasCustomDateRange()) {
                        this.activeRange = 'custom';
                        const reportRange = document.getElementById('analytics-report-range');
                        if (reportRange) reportRange.value = 'custom';
                        document.querySelectorAll('[data-analytics-range]').forEach(tab => {
                            tab.classList.remove('active');
                        });
                        this.render();
                    }
                });
            }
        });

        const reportRange = document.getElementById('analytics-report-range');
        if (reportRange) {
            reportRange.addEventListener('change', () => {
                if (reportRange.value === 'custom' && this.hasCustomDateRange()) {
                    this.activeRange = 'custom';
                    document.querySelectorAll('[data-analytics-range]').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    this.render();
                }
            });
        }

        const printButton = document.getElementById('analytics-print-pdf-btn');
        if (printButton) {
            printButton.addEventListener('click', () => this.printPdfReport());
        }
    },

    render() {
        if (this.isRendering) return;
        this.isRendering = true;

        const sales = Store.getFilteredSales() || [];
        const inventory = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const filteredSales = this.getSalesForRange(sales, this.activeRange);

        this.updateRangeCopy();
        this.updateFinancialSummary(filteredSales);
        this.calculateMetrics(filteredSales, inventory);
        
        // Render Sales & Analytics period comparison summary table
        this.renderSalesAndAnalyticsSummaryTable(sales, inventory);

        this.renderTopSellers(filteredSales, inventory);
        this.renderLeastDemanded(filteredSales, inventory);
        this.renderDetailedPerformance(filteredSales, inventory);
        this.renderOrders(filteredSales);

        this.isRendering = false;
    },

    renderSalesAndAnalyticsSummaryTable(sales, inventory) {
        const tbody = document.getElementById('sales-analytics-summary-body');
        if (!tbody) return;

        // 1. Calculate Today Sales
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todaySales = sales.filter(s => {
            const t = new Date(s.timestamp);
            return !isNaN(t.getTime()) && t >= todayStart && t <= todayEnd;
        });

        // 2. Calculate Yesterday Sales
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const yesterdaySales = sales.filter(s => {
            const t = new Date(s.timestamp);
            return !isNaN(t.getTime()) && t >= yesterdayStart && t <= yesterdayEnd;
        });

        // 3. Calculate This Month Sales
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthSales = sales.filter(s => {
            const t = new Date(s.timestamp);
            return !isNaN(t.getTime()) && t >= monthStart;
        });

        // 4. Calculate full Previous Month Sales
        const previousMonthStart = new Date();
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1, 1);
        previousMonthStart.setHours(0, 0, 0, 0);
        const previousMonthEnd = new Date();
        previousMonthEnd.setDate(0);
        previousMonthEnd.setHours(23, 59, 59, 999);
        const previousMonthSales = sales.filter(s => {
            const t = new Date(s.timestamp);
            return !isNaN(t.getTime()) && t >= previousMonthStart && t <= previousMonthEnd;
        });

        // Helper to compute metrics for a set of sales
        const getStats = (periodSales) => {
            const revenue = periodSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
            const orders = periodSales.length;
            const units = periodSales.reduce((sum, s) => {
                return sum + (s.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0);
            }, 0);
            const cost = periodSales.reduce((sum, sale) => {
                return sum + (sale.items || []).reduce((itemSum, item) => {
                    const fallback = inventory.find(p => p.id === item.id);
                    const costPrice = Number(item.costPrice ?? fallback?.costPrice ?? 0);
                    return itemSum + (costPrice * Number(item.quantity || 0));
                }, 0);
            }, 0);
            const profit = revenue - cost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            return { revenue, orders, units, profit, margin };
        };

        const todayStats = getStats(todaySales);
        const yesterdayStats = getStats(yesterdaySales);
        const monthStats = getStats(monthSales);
        const previousMonthStats = getStats(previousMonthSales);
        const allTimeStats = getStats(sales);

        // Compute Tomorrow (Projected)
        const dayOfMonth = new Date().getDate() || 1;
        const tomorrowStats = {
            revenue: monthStats.revenue / dayOfMonth,
            orders: monthStats.orders / dayOfMonth,
            units: monthStats.units / dayOfMonth,
            profit: monthStats.profit / dayOfMonth,
            margin: monthStats.margin
        };

        // Render rows
        const rows = [
            { period: 'Today', stats: todayStats, isProjected: false },
            { period: 'Yesterday', stats: yesterdayStats, isProjected: false },
            { period: 'Tomorrow (Projected)', stats: tomorrowStats, isProjected: true },
            { period: 'This Month', stats: monthStats, isProjected: false },
            { period: 'Previous Month', stats: previousMonthStats, isProjected: false },
            { period: 'All Time (Total)', stats: allTimeStats, isProjected: false }
        ];

        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');

        // Hide headers dynamically
        const thead = document.querySelector('#sales-analytics-summary-body').previousElementSibling;
        if (thead) {
            const headers = thead.querySelectorAll('th');
            if (headers.length >= 6) {
                headers[4].style.display = isEmployee ? 'none' : '';
                headers[5].style.display = isEmployee ? 'none' : '';
            }
        }

        tbody.innerHTML = rows.map(row => {
            const s = row.stats;
            const revenueText = UI.formatCurrency(s.revenue) + (row.isProjected ? ' <span style="font-size: 0.7rem; color: var(--text-muted);">[Proj]</span>' : '');
            const ordersText = row.isProjected ? s.orders.toFixed(1) : s.orders.toLocaleString();
            const unitsText = row.isProjected ? s.units.toFixed(1) : s.units.toLocaleString();
            const profitText = UI.formatCurrency(s.profit) + (row.isProjected ? ' <span style="font-size: 0.7rem; color: var(--text-muted);">[Proj]</span>' : '');
            const marginStyle = s.margin >= 40 ? 'color: var(--accent-success);' : s.margin >= 20 ? 'color: var(--text-main);' : 'color: var(--accent-danger);';

            return `
                <tr style="${row.isProjected ? 'background: rgba(255, 255, 255, 0.015); font-style: italic;' : ''}">
                    <td>
                        <span style="font-weight: 700; ${row.isProjected ? 'color: var(--text-muted);' : 'color: var(--text-main);'}">
                            ${row.period}
                        </span>
                    </td>
                    <td style="font-weight: 700; color: var(--text-main);">${revenueText}</td>
                    <td style="font-weight: 600;">${ordersText}</td>
                    <td style="font-weight: 600;">${unitsText}</td>
                    ${isEmployee ? '' : `<td style="font-weight: 700; color: var(--accent-success);">${profitText}</td>`}
                    ${isEmployee ? '' : `<td style="font-weight: 700; ${marginStyle}">${s.margin.toFixed(1)}%</td>`}
                </tr>
            `;
        }).join('');
    },

    getSalesForRange(sales, range) {
        const window = this.getRangeWindow(range);
        if (!window) return this.sortSales(sales);

        return this.sortSales(sales.filter(sale => {
            const timestamp = new Date(sale?.timestamp);
            return !Number.isNaN(timestamp.getTime()) && timestamp >= window.start && timestamp <= window.end;
        }));
    },

    getRangeWindow(range) {
        const now = new Date();

        if (range === 'custom') {
            const rangeDates = this.getCustomDateRange();
            if (!rangeDates) return null;
            return rangeDates;
        }

        if (range === 'weekly') {
            const start = new Date(now);
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return { start, end: now };
        }

        if (range === 'monthly') {
            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
                end: now
            };
        }

        if (range === 'previousMonth') {
            return {
                start: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
                end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
            };
        }

        if (range === 'yesterday') {
            const start = new Date(now);
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);

            const end = new Date(now);
            end.setDate(now.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
    },

    sortSales(sales) {
        return [...sales].sort((a, b) => {
            const timeA = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
            const validA = Number.isNaN(timeA) ? 0 : timeA;
            const validB = Number.isNaN(timeB) ? 0 : timeB;
            return validB - validA;
        });
    },

    hasCustomDateRange() {
        const from = document.getElementById('analytics-date-from');
        const to = document.getElementById('analytics-date-to');
        return Boolean(from?.value || to?.value);
    },

    clearCustomDateRange() {
        const from = document.getElementById('analytics-date-from');
        const to = document.getElementById('analytics-date-to');
        if (from) from.value = '';
        if (to) to.value = '';
    },

    getCustomDateRange() {
        const from = document.getElementById('analytics-date-from');
        const to = document.getElementById('analytics-date-to');
        const fromValue = from?.value || to?.value;
        const toValue = to?.value || from?.value;

        if (!fromValue || !toValue) return null;

        const start = this.parseDateInput(fromValue, false);
        const end = this.parseDateInput(toValue, true);
        if (!start || !end) return null;

        if (start > end) {
            return {
                start: this.parseDateInput(toValue, false),
                end: this.parseDateInput(fromValue, true)
            };
        }

        return { start, end };
    },

    parseDateInput(value, endOfDay = false) {
        const [year, month, day] = String(value || '').split('-').map(Number);
        if (!year || !month || !day) return null;

        return endOfDay
            ? new Date(year, month - 1, day, 23, 59, 59, 999)
            : new Date(year, month - 1, day, 0, 0, 0, 0);
    },

    updateRangeCopy() {
        if (this.activeRange === 'custom') {
            const window = this.getRangeWindow('custom');
            const dateStr = window ? this.formatDateRange(window.start, window.end) : 'Selected Date Range';
            this.setText('analytics-range-label', 'Custom Range');
            this.setText('analytics-range-title', dateStr);
            this.setText('analytics-range-subtitle', 'Showing sales completed inside the selected date range.');
            return;
        }

        const config = this.ranges[this.activeRange] || this.ranges.daily;
        this.setText('analytics-range-label', config.label);
        this.setText('analytics-range-title', config.title);
        this.setText('analytics-range-subtitle', config.subtitle);
    },

    updateFinancialSummary(sales) {
        const totalRevenue = this.getSalesRevenue(sales);
        const totalOrders = sales.length;
        const totalUnits = this.getSalesUnits(sales);
        const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        this.setText('analytic-total-revenue', UI.formatCurrency(totalRevenue));
        this.setText('analytic-order-count', totalOrders.toLocaleString());
        this.setText('analytic-items-sold', totalUnits.toLocaleString());
        this.setText('analytic-average-order', UI.formatCurrency(averageOrder));
    },

    calculateMetrics(sales, inventory) {
        const totalRevenue = this.getSalesRevenue(sales);
        const totalCost = sales.reduce((sum, sale) => {
            return sum + this.getSaleItems(sale).reduce((itemSum, item) => {
                const fallback = inventory.find(p => p.id === item.id);
                const cost = Number(item.costPrice ?? fallback?.costPrice ?? 0);
                return itemSum + (cost * Number(item.quantity || 0));
            }, 0);
        }, 0);

        const totalProfit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const lowStockValue = inventory
            .filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0))
            .reduce((sum, p) => sum + (Number(p.costPrice || 0) * Number(p.quantity || 0)), 0);

        this.setText('analytic-total-profit', UI.formatCurrency(totalProfit));
        this.setText('analytic-margin', `${margin.toFixed(1)}%`);
        this.setText('analytic-loss', UI.formatCurrency(lowStockValue));

        const isEmployee = window.isCostPriceAllowed ? !window.isCostPriceAllowed() : (localStorage.getItem('user_role') !== 'admin');
        ['analytic-total-profit', 'analytic-margin'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.parentElement) {
                el.parentElement.style.display = isEmployee ? 'none' : '';
            }
        });
    },

    renderTopSellers(sales, inventory) {
        const container = document.getElementById('top-sellers-list');
        if (!container) return;

        const sorted = this.getItemStats(sales, inventory)
            .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
            .slice(0, 6);

        if (sorted.length === 0) {
            container.innerHTML = this.getEmptyState('No items sold in this range yet.');
            return;
        }

        container.innerHTML = sorted.map((stat, index) => `
            <div class="analytics-list-item">
                <div class="analytics-rank">${index + 1}</div>
                <div class="analytics-list-main">
                    <div class="analytics-list-title">${this.escapeHtml(stat.name)}</div>
                    <div class="analytics-list-meta">${this.escapeHtml(stat.type)} | ${this.escapeHtml(stat.color)} | Size ${this.escapeHtml(stat.size)}</div>
                </div>
                <div class="analytics-list-value">
                    <strong>${stat.qty.toLocaleString()} units</strong>
                    <span>${UI.formatCurrency(stat.revenue)}</span>
                </div>
            </div>
        `).join('');
    },

    renderLeastDemanded(sales, inventory) {
        const container = document.getElementById('least-demanded-list');
        if (!container) return;

        const soldIds = new Set();
        sales.forEach(sale => this.getSaleItems(sale).forEach(item => soldIds.add(item.id)));

        const notSold = inventory
            .filter(product => !soldIds.has(product.id))
            .sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0))
            .slice(0, 6);

        if (notSold.length === 0) {
            container.innerHTML = this.getEmptyState('Every stocked item sold in this range.');
            return;
        }

        container.innerHTML = notSold.map(product => `
            <div class="analytics-list-item">
                <div class="analytics-rank"><i class="fas fa-box"></i></div>
                <div class="analytics-list-main">
                    <div class="analytics-list-title">${this.escapeHtml(product.name)}</div>
                    <div class="analytics-list-meta">${this.escapeHtml(product.type)} | ${this.escapeHtml(product.color)} | Size ${this.escapeHtml(product.size)}</div>
                </div>
                <div class="analytics-list-value">
                    <strong>${Number(product.quantity || 0).toLocaleString()} stock</strong>
                    <span>0 sold</span>
                </div>
            </div>
        `).join('');
    },

    renderDetailedPerformance(sales, inventory) {
        const container = document.getElementById('detailed-item-performance');
        if (!container) return;

        const sorted = this.getItemStats(sales, inventory)
            .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty);

        if (sorted.length === 0) {
            container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No items sold in this range</td></tr>';
            return;
        }

        container.innerHTML = sorted.map(item => `
            <tr>
                <td>
                    <div style="font-weight: 700; color: var(--text-main);">${this.escapeHtml(item.name)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHtml(item.type)} | ${this.escapeHtml(item.style)}</div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        ${UI.getColorBadge(item.color)}
                        <span style="font-weight: 700; font-size: 0.75rem;">Size ${this.escapeHtml(item.size)}</span>
                    </div>
                </td>
                <td style="font-weight: 800;">${item.qty.toLocaleString()}</td>
                <td style="font-weight: 800; color: var(--accent-success);">${UI.formatCurrency(item.revenue)}</td>
                <td style="font-weight: 800;">${UI.formatCurrency(item.profit)}</td>
                <td style="font-size: 0.75rem; color: var(--text-muted);">${this.formatDate(item.lastSold)}</td>
            </tr>
        `).join('');
    },

    renderOrders(sales) {
        const container = document.getElementById('analytics-orders-list');
        if (!container) return;

        if (sales.length === 0) {
            container.innerHTML = this.getEmptyState('No orders found for this range.');
            return;
        }

        container.innerHTML = sales.slice(0, 12).map(sale => {
            const saleItems = this.getSaleItems(sale);
            const units = saleItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const itemPreview = saleItems
                .slice(0, 3)
                .map(item => `${this.escapeHtml(item.name)} x${Number(item.quantity || 0)}`)
                .join(', ');
            const extraItems = saleItems.length > 3 ? ` +${saleItems.length - 3} more` : '';

            return `
                <div class="analytics-order-card">
                    <div class="analytics-order-main">
                        <div class="analytics-order-title">${this.escapeHtml(sale.id || 'Sale')}</div>
                        <div class="analytics-order-meta">${this.formatDateTime(sale.timestamp)} | ${units} units | ${this.escapeHtml(sale.paymentMethod || 'payment')}</div>
                        <div class="analytics-order-meta">${itemPreview}${extraItems}</div>
                    </div>
                    <div class="analytics-order-value">
                        <strong>${UI.formatCurrency(Number(sale.total || 0))}</strong>
                        <span>${sale.discount ? `Discount ${UI.formatCurrency(Number(sale.discount || 0))}` : 'No discount'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    printPdfReport() {
        const select = document.getElementById('analytics-report-range');
        const range = select?.value || this.activeRange || 'daily';

        if (range === 'custom' && !this.hasCustomDateRange()) {
            alert('Please choose a start date and end date before printing a selected-range report.');
            return;
        }

        const sales = Store.getFilteredSales() || [];
        const inventory = [...Store.getFilteredInventory(), ...Store.getFilteredAccessories()];
        const filteredSales = this.getSalesForRange(sales, range);
        const itemStats = this.getItemStats(filteredSales, inventory)
            .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty);
        const metrics = this.getReportMetrics(filteredSales, inventory);
        const periodLabel = this.getReportPeriodLabel(range);
        const report = this.getOrCreateReportContainer();

        report.innerHTML = this.buildReportHtml({
            range,
            periodLabel,
            sales: filteredSales,
            itemStats,
            metrics
        });

        document.body.classList.add('printing-sales-report');
        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing-sales-report');
        }, { once: true });
        window.print();
    },

    getOrCreateReportContainer() {
        let report = document.getElementById('printable-sales-report');
        if (!report) {
            report = document.createElement('div');
            report.id = 'printable-sales-report';
            document.body.appendChild(report);
        }
        return report;
    },

    getReportMetrics(sales, inventory) {
        const revenue = this.getSalesRevenue(sales);
        const orders = sales.length;
        const units = this.getSalesUnits(sales);
        const cost = sales.reduce((sum, sale) => {
            return sum + this.getSaleItems(sale).reduce((itemSum, item) => {
                const fallback = inventory.find(p => p.id === item.id);
                const itemCost = Number(item.costPrice ?? fallback?.costPrice ?? 0);
                return itemSum + (itemCost * Number(item.quantity || 0));
            }, 0);
        }, 0);
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const averageOrder = orders > 0 ? revenue / orders : 0;

        return { revenue, orders, units, cost, profit, margin, averageOrder };
    },

    getReportPeriodLabel(range) {
        const window = this.getRangeWindow(range);
        if (!window) return 'All sales';
        return this.formatDateRange(window.start, window.end);
    },

    buildReportHtml({ range, periodLabel, sales, itemStats, metrics }) {
        const title = this.getReportTitle(range);
        const generatedAt = new Date().toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const itemRows = itemStats.length > 0
            ? itemStats.map(item => {
                const unitPrice = item.qty > 0 ? item.revenue / item.qty : 0;
                return `
                    <tr>
                        <td>${this.escapeHtml(item.name)}</td>
                        <td>${this.escapeHtml(item.type)} / ${this.escapeHtml(item.style)}</td>
                        <td>${this.escapeHtml(item.color)}</td>
                        <td>${this.escapeHtml(item.size)}</td>
                        <td>${item.qty.toLocaleString()}</td>
                        <td>${UI.formatCurrency(unitPrice)}</td>
                        <td>${UI.formatCurrency(item.revenue)}</td>
                        <td>${UI.formatCurrency(item.profit)}</td>
                        <td>${this.formatDate(item.lastSold)}</td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="9" class="sales-report-empty">No items sold in this period.</td></tr>';

        const orderRows = sales.length > 0
            ? sales.map(sale => {
                const units = this.getSaleItems(sale).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const items = this.getSaleItems(sale)
                    .map(item => `${this.escapeHtml(item.name)} x${Number(item.quantity || 0)} @ ${UI.formatCurrency(Number(item.price || 0))}`)
                    .join('<br>');

                return `
                    <tr>
                        <td>${this.escapeHtml(sale.id || 'Sale')}</td>
                        <td>${this.formatDateTime(sale.timestamp)}</td>
                        <td>${units.toLocaleString()}</td>
                        <td>${items || '-'}</td>
                        <td>${this.escapeHtml(sale.paymentMethod || '-')}</td>
                        <td>${UI.formatCurrency(Number(sale.discount || 0))}</td>
                        <td>${UI.formatCurrency(Number(sale.total || 0))}</td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="7" class="sales-report-empty">No orders found in this period.</td></tr>';

        return `
            <div class="sales-report-document">
                <header class="sales-report-header">
                    <div>
                        <p>IHM Shop Sales Analytics</p>
                        <h1>${this.escapeHtml(title)}</h1>
                        <span>${this.escapeHtml(periodLabel)}</span>
                    </div>
                    <div class="sales-report-generated">Generated: ${this.escapeHtml(generatedAt)}</div>
                </header>

                <section class="sales-report-summary">
                    <div><span>Total Sales</span><strong>${UI.formatCurrency(metrics.revenue)}</strong></div>
                    <div><span>Orders</span><strong>${metrics.orders.toLocaleString()}</strong></div>
                    <div><span>Items Sold</span><strong>${metrics.units.toLocaleString()}</strong></div>
                    <div><span>Net Profit</span><strong>${UI.formatCurrency(metrics.profit)}</strong></div>
                    <div><span>Margin</span><strong>${metrics.margin.toFixed(1)}%</strong></div>
                    <div><span>Average Order</span><strong>${UI.formatCurrency(metrics.averageOrder)}</strong></div>
                </section>

                <section class="sales-report-section">
                    <h2>Sold Item Details</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Type / Style</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total Price</th>
                                <th>Profit</th>
                                <th>Last Sold</th>
                            </tr>
                        </thead>
                        <tbody>${itemRows}</tbody>
                    </table>
                </section>

                <section class="sales-report-section">
                    <h2>Sales Orders</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Qty</th>
                                <th>Items</th>
                                <th>Payment</th>
                                <th>Discount</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>${orderRows}</tbody>
                    </table>
                </section>
            </div>
        `;
    },

    getReportTitle(range) {
        if (range === 'custom') return 'Selected Range Sales Report';
        if (range === 'weekly') return 'Weekly Sales Report';
        if (range === 'monthly') return 'This Month Sales Report';
        if (range === 'previousMonth') return 'Previous Month Sales Report';
        return 'Daily Sales Report';
    },
    getItemStats(sales, inventory) {
        const stats = {};

        sales.forEach(sale => {
            this.getSaleItems(sale).forEach(item => {
                const fallback = inventory.find(p => p.id === item.id) || {};
                const key = [
                    item.id || item.name,
                    item.name,
                    item.color,
                    item.size
                ].join('|');

                if (!stats[key]) {
                    stats[key] = {
                        id: item.id,
                        name: item.name || fallback.name || 'Unknown item',
                        type: item.type || fallback.type || 'Item',
                        style: item.style || fallback.style || 'Standard',
                        color: item.color || fallback.color || 'N/A',
                        size: item.size || fallback.size || 'N/A',
                        qty: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        lastSold: sale.timestamp
                    };
                }

                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || fallback.price || 0);
                const cost = Number(item.costPrice ?? fallback.costPrice ?? 0);

                stats[key].qty += quantity;
                stats[key].revenue += price * quantity;
                stats[key].cost += cost * quantity;
                stats[key].profit = stats[key].revenue - stats[key].cost;

                if (new Date(sale.timestamp) > new Date(stats[key].lastSold)) {
                    stats[key].lastSold = sale.timestamp;
                }
            });
        });

        return Object.values(stats);
    },

    getSalesRevenue(sales) {
        return sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    },

    getSalesUnits(sales) {
        return sales.reduce((sum, sale) => {
            return sum + this.getSaleItems(sale).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0);
        }, 0);
    },

    getSaleItems(sale) {
        return Array.isArray(sale?.items) ? sale.items : [];
    },

    setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    getEmptyState(message) {
        return `
            <div class="analytics-empty">
                <i class="fas fa-chart-line" style="display: block; opacity: 0.35; margin-bottom: 0.75rem;"></i>
                ${this.escapeHtml(message)}
            </div>
        `;
    },

    formatDate(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return 'Unknown';
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatDateLong(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return 'Unknown';
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    },

    formatDateRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 'Selected Date Range';
        }

        const sameDay = startDate.toDateString() === endDate.toDateString();
        if (sameDay) return this.formatDateLong(startDate);

        return `${this.formatDateLong(startDate)} to ${this.formatDateLong(endDate)}`;
    },

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return 'Unknown date';
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

window.Analytics = Analytics;
