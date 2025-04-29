/**
 * Inventory Management App JS
 * Handles dashboard summary and items CRUD using localStorage
 */

// Define the threshold for low stock
const LOW_STOCK_THRESHOLD = 5;

// Utility: Get items from API
async function getItems() {
    try {
        const response = await fetch('items_api.php');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch items:', error);
        return [];
    }
}

// Dashboard summary logic
async function renderDashboard() {
    const summaryDiv = document.getElementById('dashboard-summary');
    if (!summaryDiv) return;

    const items = await getItems();
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);

    // Check for low stock and no stock
    let lowStock = items.some(item => Number(item.quantity) > 0 && Number(item.quantity) < LOW_STOCK_THRESHOLD);
    let noStock = items.some(item => Number(item.quantity) === 0);

    // Filter low stock items
    const lowStockItems = items.filter(item => Number(item.quantity) > 0 && Number(item.quantity) < LOW_STOCK_THRESHOLD);
    
    let stockStatus = '';
    if (noStock) {
        stockStatus = `<span style="color: red;">No Stock Items Present</span>`;
    } else if (lowStock) {
        stockStatus = `<span style="color: red;">Low Stock Warning</span>`;
    } else if (totalItems > 0) {
        stockStatus = `<span style="color: green;">Stock Level OK</span>`;
    } else {
        stockStatus = `<span>No Items</span>`;
    }

    let lowStockHTML = '';
    if (lowStockItems.length > 0) {
        lowStockHTML = `
            <h3>Low Stock Items</h3>
            <ul>
                ${lowStockItems.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
            </ul>
        `;
    }

    summaryDiv.innerHTML = `
        <h2>Summary</h2>
        <p><strong>Total Items:</strong> ${totalItems}</p>
        <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
        <p><strong>Status:</strong> ${stockStatus}</p>
        ${lowStockHTML}
    `;
}

// Items CRUD logic
async function renderItemsPage() {
    const container = document.getElementById('items-container');
    if (!container) return;

    let items = await getItems();

    // Form for adding/editing items
    let formHTML = `
        <h2>Add / Edit Item</h2>
        <form id="item-form">
            <input type="hidden" id="item-id" value="">
            <div>
                <label>Name: <input type="text" id="item-name" required></label>
            </div>
            <div>
                <label>Quantity: <input type="number" id="item-quantity" required min="0"></label>
            </div>
            <button type="submit">Save Item</button>
            <button type="button" id="cancel-edit" style="display:none;">Cancel</button>
        </form>
        <hr>
    `;

    // Table of items
    let tableHTML = `
        <h2>Items List</h2>
        <table border="1" cellpadding="8" cellspacing="0" width="100%">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, idx) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>
                            <button data-edit="${item.id}">Edit</button>
                            <button data-delete="${item.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = formHTML + tableHTML;

    // Form handlers
    const form = document.getElementById('item-form');
    const cancelBtn = document.getElementById('cancel-edit');
    
    form.onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const name = document.getElementById('item-name').value.trim();
        const quantity = Number(document.getElementById('item-quantity').value);

        try {
            const response = await fetch('items_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: id ? 'update' : 'add',
                    id: id,
                    name: name,
                    quantity: quantity
                })
            });
            
            const data = await response.json();
            if (data.success) {
                renderItemsPage();
            }
        } catch (error) {
            console.error('Failed to save item:', error);
            alert('Failed to save item. Please try again.');
        }
    };

    cancelBtn.onclick = function() {
        form.reset();
        document.getElementById('item-id').value = '';
        cancelBtn.style.display = 'none';
    };

    // Edit/Delete handlers
    container.querySelectorAll('button[data-edit]').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-edit');
            const item = items.find(item => item.id == id);
            if (item) {
                document.getElementById('item-id').value = id;
                document.getElementById('item-name').value = item.name;
                document.getElementById('item-quantity').value = item.quantity;
                cancelBtn.style.display = 'inline';
            }
        };
    });

    container.querySelectorAll('button[data-delete]').forEach(btn => {
        btn.onclick = async function() {
            const id = btn.getAttribute('data-delete');
            if (confirm('Delete this item?')) {
                try {
                    const response = await fetch('items_api.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'delete',
                            id: id
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        renderItemsPage();
                    }
                } catch (error) {
                    console.error('Failed to delete item:', error);
                    alert('Failed to delete item. Please try again.');
                }
            }
        };
    });
}

// On page load, render appropriate content
window.onload = function() {
    renderDashboard();
    renderItemsPage();
};
