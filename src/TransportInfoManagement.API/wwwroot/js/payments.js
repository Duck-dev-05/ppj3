let clients = [];

window.loadPayments = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-money-bill-wave"></i> Manage Payments</h1>
            <button class="btn btn-primary" onclick="showPaymentModal()">
                <i class="fas fa-plus"></i> Add Payment
            </button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadPaymentsData()">
                    <option value="">All Clients</option>
                </select>
                <select id="filterStatus" onchange="loadPaymentsData()">
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending Payment</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                </select>
            </div>
            <div class="table-container">
                <table id="paymentsTable">
                    <thead>
                        <tr>
                            <th>Payment Code</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Payment Date</th>
                            <th>Due Date</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Overdue Payments</h2>
            </div>
            <button class="btn btn-warning" onclick="loadOverduePayments()">View Overdue Payments</button>
            <div id="overduePayments" style="margin-top: 1rem;"></div>
        </div>
    `;

    clients = await api.get('/clients');
    const filterClient = document.getElementById('filterClient');
    
    clients.forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    await loadPaymentsData();
}

async function loadPaymentsData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const status = document.getElementById('filterStatus')?.value;
        
        let url = '/payments';
        const params = new URLSearchParams();
        if (clientId) params.append('clientId', clientId);
        if (status) params.append('status', status);
        if (params.toString()) url += '?' + params.toString();
        
        const payments = await api.get(url);
        const tbody = document.querySelector('#paymentsTable tbody');
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.paymentCode}</td>
                <td>${payment.client?.companyName || 'N/A'}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                <td>${new Date(payment.dueDate).toLocaleDateString('vi-VN')}</td>
                <td>${payment.paymentMethod}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${
                        payment.status === 'Paid' ? '#10b981' : 
                        payment.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                    }; color: white;">
                        ${payment.status === 'Paid' ? 'Paid' : 
                          payment.status === 'Overdue' ? 'Overdue' : 'Pending Payment'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editPayment(${payment.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePayment(${payment.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function loadOverduePayments() {
    try {
        const overdue = await api.get('/payments/overdue');
        const container = document.getElementById('overduePayments');
        if (overdue.length === 0) {
            container.innerHTML = '<p>No overdue payments.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Payment Code</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                    </tr>
                </thead>
                <tbody>
                    ${overdue.map(p => `
                        <tr>
                            <td>${p.paymentCode}</td>
                            <td>${p.client?.companyName || 'N/A'}</td>
                            <td>$${p.amount.toLocaleString()}</td>
                            <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                            <td>${(new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)} days</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading overdue payments:', error);
    }
}

async function showPaymentModal(paymentId = null) {
    const payment = paymentId ? await api.get(`/payments/${paymentId}`) : null;
    const modal = createModal('paymentModal', paymentId ? 'Edit Payment' : 'Add Payment', `
        <form id="paymentForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Code</label>
                    <input type="text" id="paymentCode" value="${payment?.paymentCode || ''}">
                </div>
                <div class="form-group">
                    <label>Client</label>
                    <select id="paymentClientId" required>
                        <option value="">Select Client</option>
                        ${clients.map(c => `<option value="${c.id}" ${payment?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" id="paymentAmount" value="${payment?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="paymentDueDate" value="${payment ? new Date(payment.dueDate).toISOString().split('T')[0] : ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Method</label>
                    <select id="paymentMethod" required>
                        <option value="Cash" ${payment?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                        <option value="Bank Transfer" ${payment?.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="Credit Card" ${payment?.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="paymentStatus" required>
                        <option value="Pending" ${payment?.status === 'Pending' ? 'selected' : ''}>Pending Payment</option>
                        <option value="Paid" ${payment?.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Overdue" ${payment?.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="paymentNotes" rows="3">${payment?.notes || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('paymentModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: paymentId || 0,
            paymentCode: document.getElementById('paymentCode').value,
            clientId: parseInt(document.getElementById('paymentClientId').value),
            amount: parseFloat(document.getElementById('paymentAmount').value),
            dueDate: new Date(document.getElementById('paymentDueDate').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            status: document.getElementById('paymentStatus').value,
            notes: document.getElementById('paymentNotes').value
        };
        
        try {
            if (paymentId) {
                await api.put(`/payments/${paymentId}`, data);
            } else {
                await api.post('/payments', data);
            }
            closeModal('paymentModal');
            await loadPaymentsData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function editPayment(id) {
    await showPaymentModal(id);
}

async function deletePayment(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
        await api.delete(`/payments/${id}`);
        await loadPaymentsData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

