let clients = [];

window.loadPayments = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-money-bill-wave"></i> Quản lý Thanh toán</h1>
            <button class="btn btn-primary" onclick="showPaymentModal()">
                <i class="fas fa-plus"></i> Thêm thanh toán
            </button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadPaymentsData()">
                    <option value="">Tất cả khách hàng</option>
                </select>
                <select id="filterStatus" onchange="loadPaymentsData()">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Pending">Chờ thanh toán</option>
                    <option value="Paid">Đã thanh toán</option>
                    <option value="Overdue">Quá hạn</option>
                </select>
            </div>
            <div class="table-container">
                <table id="paymentsTable">
                    <thead>
                        <tr>
                            <th>Mã TT</th>
                            <th>Khách hàng</th>
                            <th>Số tiền</th>
                            <th>Ngày thanh toán</th>
                            <th>Hạn thanh toán</th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Thanh toán quá hạn</h2>
            </div>
            <button class="btn btn-warning" onclick="loadOverduePayments()">Xem thanh toán quá hạn</button>
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
                        ${payment.status === 'Paid' ? 'Đã thanh toán' : 
                          payment.status === 'Overdue' ? 'Quá hạn' : 'Chờ thanh toán'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editPayment(${payment.id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePayment(${payment.id})" title="Xóa">
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
            container.innerHTML = '<p>Không có thanh toán quá hạn.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Mã TT</th>
                        <th>Khách hàng</th>
                        <th>Số tiền</th>
                        <th>Hạn thanh toán</th>
                        <th>Số ngày quá hạn</th>
                    </tr>
                </thead>
                <tbody>
                    ${overdue.map(p => `
                        <tr>
                            <td>${p.paymentCode}</td>
                            <td>${p.client?.companyName || 'N/A'}</td>
                            <td>$${p.amount.toLocaleString()}</td>
                            <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                            <td>${(new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)} ngày</td>
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
    const modal = createModal('paymentModal', paymentId ? 'Sửa thanh toán' : 'Thêm thanh toán', `
        <form id="paymentForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Mã thanh toán</label>
                    <input type="text" id="paymentCode" value="${payment?.paymentCode || ''}">
                </div>
                <div class="form-group">
                    <label>Khách hàng</label>
                    <select id="paymentClientId" required>
                        <option value="">Chọn khách hàng</option>
                        ${clients.map(c => `<option value="${c.id}" ${payment?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Số tiền</label>
                    <input type="number" id="paymentAmount" value="${payment?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Hạn thanh toán</label>
                    <input type="date" id="paymentDueDate" value="${payment ? new Date(payment.dueDate).toISOString().split('T')[0] : ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phương thức thanh toán</label>
                    <select id="paymentMethod" required>
                        <option value="Cash" ${payment?.paymentMethod === 'Cash' ? 'selected' : ''}>Tiền mặt</option>
                        <option value="Bank Transfer" ${payment?.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Chuyển khoản</option>
                        <option value="Credit Card" ${payment?.paymentMethod === 'Credit Card' ? 'selected' : ''}>Thẻ tín dụng</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Trạng thái</label>
                    <select id="paymentStatus" required>
                        <option value="Pending" ${payment?.status === 'Pending' ? 'selected' : ''}>Chờ thanh toán</option>
                        <option value="Paid" ${payment?.status === 'Paid' ? 'selected' : ''}>Đã thanh toán</option>
                        <option value="Overdue" ${payment?.status === 'Overdue' ? 'selected' : ''}>Quá hạn</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="paymentNotes" rows="3">${payment?.notes || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('paymentModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
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
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editPayment(id) {
    await showPaymentModal(id);
}

async function deletePayment(id) {
    if (!confirm('Bạn có chắc muốn xóa thanh toán này?')) return;
    try {
        await api.delete(`/payments/${id}`);
        await loadPaymentsData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

