let clients = [];
let services = [];
let employees = [];

window.loadClientServices = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Quản lý Dịch vụ Khách hàng</h1>
            <button class="btn btn-primary" onclick="showClientServiceModal()">Thêm dịch vụ khách hàng</button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadClientServicesData()">
                    <option value="">Tất cả khách hàng</option>
                </select>
            </div>
            <div class="table-container">
                <table id="clientServicesTable">
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Dịch vụ</th>
                            <th>Nhân viên</th>
                            <th>Số lượng NV</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
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
                <h2>Tính chi phí</h2>
            </div>
            <div>
                <select id="costClientId">
                    <option value="">Chọn khách hàng</option>
                </select>
                <button class="btn btn-primary" onclick="calculateCost()">Tính chi phí</button>
                <div id="costResult" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    clients = await api.get('/clients');
    services = await api.get('/services');
    employees = await api.get('/employees');
    
    const filterClient = document.getElementById('filterClient');
    const costClientId = document.getElementById('costClientId');
    
    clients.forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
        costClientId.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    await loadClientServicesData();
}

async function loadClientServicesData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const url = clientId ? `/client-services?clientId=${clientId}` : '/client-services';
        
        const clientServices = await api.get(url);
        const tbody = document.querySelector('#clientServicesTable tbody');
        tbody.innerHTML = clientServices.map(cs => `
            <tr>
                <td>${cs.client?.companyName || 'N/A'}</td>
                <td>${cs.service?.name || 'N/A'}</td>
                <td>${cs.employee?.fullName || 'N/A'}</td>
                <td>${cs.numberOfEmployees}</td>
                <td>${new Date(cs.startDate).toLocaleDateString('vi-VN')}</td>
                <td>${cs.endDate ? new Date(cs.endDate).toLocaleDateString('vi-VN') : 'Đang hoạt động'}</td>
                <td>${cs.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editClientService(${cs.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteClientService(${cs.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading client services:', error);
    }
}

async function calculateCost() {
    const clientId = document.getElementById('costClientId').value;
    if (!clientId) {
        alert('Vui lòng chọn khách hàng');
        return;
    }
    
    try {
        const result = await api.get(`/client-services/calculate-cost/${clientId}`);
        document.getElementById('costResult').innerHTML = `
            <h3>Tổng chi phí: $${result.totalCost.toLocaleString()}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Dịch vụ</th>
                        <th>Số NV</th>
                        <th>Số ngày</th>
                        <th>Phí/ngày/NV</th>
                        <th>Chi phí</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.details.map(d => `
                        <tr>
                            <td>${d.serviceName}</td>
                            <td>${d.numberOfEmployees}</td>
                            <td>${d.days}</td>
                            <td>$${d.feePerDayPerEmployee.toLocaleString()}</td>
                            <td>$${d.cost.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function showClientServiceModal(csId = null) {
    const cs = csId ? await api.get(`/client-services/${csId}`) : null;
    const modal = createModal('clientServiceModal', csId ? 'Sửa dịch vụ khách hàng' : 'Thêm dịch vụ khách hàng', `
        <form id="clientServiceForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Khách hàng</label>
                    <select id="csClientId" required>
                        <option value="">Chọn khách hàng</option>
                        ${clients.map(c => `<option value="${c.id}" ${cs?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Dịch vụ</label>
                    <select id="csServiceId" required>
                        <option value="">Chọn dịch vụ</option>
                        ${services.map(s => `<option value="${s.id}" ${cs?.serviceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nhân viên</label>
                    <select id="csEmployeeId">
                        <option value="">Không chọn</option>
                        ${employees.map(e => `<option value="${e.id}" ${cs?.employeeId === e.id ? 'selected' : ''}>${e.fullName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Số lượng nhân viên</label>
                    <input type="number" id="csNumberOfEmployees" value="${cs?.numberOfEmployees || 1}" min="1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ngày bắt đầu</label>
                    <input type="date" id="csStartDate" value="${cs ? new Date(cs.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Ngày kết thúc (tùy chọn)</label>
                    <input type="date" id="csEndDate" value="${cs?.endDate ? new Date(cs.endDate).toISOString().split('T')[0] : ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="csIsActive" ${cs?.isActive !== false ? 'checked' : ''}>
                    Hoạt động
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('clientServiceModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('clientServiceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const endDateValue = document.getElementById('csEndDate').value;
        const data = {
            id: csId || 0,
            clientId: parseInt(document.getElementById('csClientId').value),
            serviceId: parseInt(document.getElementById('csServiceId').value),
            employeeId: document.getElementById('csEmployeeId').value ? parseInt(document.getElementById('csEmployeeId').value) : null,
            numberOfEmployees: parseInt(document.getElementById('csNumberOfEmployees').value),
            startDate: new Date(document.getElementById('csStartDate').value),
            endDate: endDateValue ? new Date(endDateValue) : null,
            isActive: document.getElementById('csIsActive').checked
        };
        
        try {
            if (csId) {
                await api.put(`/client-services/${csId}`, data);
            } else {
                await api.post('/client-services', data);
            }
            closeModal('clientServiceModal');
            await loadClientServicesData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editClientService(id) {
    await showClientServiceModal(id);
}

async function deleteClientService(id) {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
        await api.delete(`/client-services/${id}`);
        await loadClientServicesData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

