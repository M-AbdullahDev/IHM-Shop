const UI = {
    pages: ['dashboard', 'inventory', 'accessories', 'analytics', 'ledger', 'pos', 'receipts', 'settings'],
    
    init() {
        this.setupNavigation();
        this.setupModals();
        this.initTheme();
        this.setupNetworkIndicator();
    },

    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const savedTheme = localStorage.getItem('zyro_theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            toggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }

        toggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            const icon = toggleBtn.querySelector('i');
            
            if (isLight) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('zyro_theme', 'light');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('zyro_theme', 'dark');
            }
        });
    },

    setupNetworkIndicator() {
        const updateStatus = () => {
            const isOnline = navigator.onLine;
            
            const topIndicator = document.getElementById('sync-status');
            if (topIndicator) {
                const icon = topIndicator.querySelector('i');
                const text = topIndicator.querySelector('span');
                if (icon && text) {
                    icon.style.color = isOnline ? 'var(--accent-success)' : 'var(--accent-danger)';
                    text.textContent = isOnline ? 'Online' : 'Offline';
                }
            }

            const sideIndicator = document.getElementById('sync-indicator');
            if (sideIndicator) {
                const icon = sideIndicator.querySelector('i');
                const text = sideIndicator.querySelector('span');
                if (icon && text) {
                    icon.style.color = isOnline ? 'var(--accent-success)' : 'var(--accent-danger)';
                    text.textContent = isOnline ? 'Online' : 'Offline';
                }
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.showPage(page);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    showPage(pageId) {
        document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
        const activePage = document.getElementById(pageId + '-page');
        if (activePage) {
            activePage.style.display = 'block';
            activePage.classList.add('animate-fade-in');
            
            // Trigger specific page load logic
            const event = new CustomEvent('pageShow', { detail: { page: pageId } });
            window.dispatchEvent(event);
        }
    },

    setupModals() {
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modal;
                this.showModal(modalId);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal(overlay.id);
            });
        });
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    getColorBadge(colorName) {
        if (!colorName) return '';
        
        const colorMap = {
            'black': '#000000',
            'white': '#ffffff',
            'midnight black': '#0a0a0a',
            'pure white': '#ffffff',
            'navy': '#000080',
            'navy blue': '#000080',
            'royal blue': '#4169e1',
            'gray': '#808080',
            'heather gray': '#9b9b9b',
            'red': '#ef4444',
            'purple': '#8b5cf6',
            'green': '#10b981',
            'yellow': '#f59e0b',
            'orange': '#f97316'
        };

        const cssColor = colorMap[colorName.toLowerCase()] || colorName;
        const isWhite = cssColor.toLowerCase() === 'white' || cssColor.toLowerCase() === '#ffffff';
        const borderStyle = isWhite ? 'border: 1px solid var(--glass-border);' : '';

        return `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${cssColor}; display: inline-block; ${borderStyle} box-shadow: 0 0 0 1px rgba(0,0,0,0.05);"></span>
                <span>${colorName}</span>
            </div>
        `;
    },

    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.background = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6');
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = 'bold';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        toast.textContent = message;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

window.UI = UI;

window.UI = UI;

