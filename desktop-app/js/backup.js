const Backup = {
    exportToCSV() {
        const inventory = [...Store.getInventory(), ...Store.getAccessories()];
        if (inventory.length === 0) {
            alert('No data to export!');
            return;
        }

        // CSV Headers
        const headers = ['ID', 'Name', 'Type', 'Style', 'Size', 'Color', 'Quantity', 'Price'];
        
        // CSV Rows
        const rows = inventory.map(p => [
            p.id,
            `"${p.name}"`,
            p.type,
            p.style,
            p.size,
            p.color,
            p.quantity,
            p.price
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `DemoShop_Inventory_Backup_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Inventory backup exported successfully');
    },

    exportSalesToCSV() {
        const sales = Store.getSales();
        if (sales.length === 0) {
            alert('No sales data to export!');
            return;
        }

        const headers = ['Invoice ID', 'Date', 'Items Count', 'Subtotal', 'Discount', 'Tax', 'Total'];
        const rows = sales.map(s => [
            s.id,
            new Date(s.timestamp).toLocaleString(),
            s.items.length,
            s.subtotal,
            s.discount,
            s.tax,
            s.total
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `DemoShop_Sales_Report_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.Backup = Backup;
