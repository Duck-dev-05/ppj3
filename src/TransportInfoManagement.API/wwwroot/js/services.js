window.loadServices = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Quản lý Dịch vụ</h1>
            <button class="btn btn-primary" onclick="showServiceModal()">
                <i class="fas fa-plus"></i> Thêm dịch vụ
            </button>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Danh sách dịch vụ</h2>
            </div>
            <div class="table-container">
                <table id="servicesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên dịch vụ</th>
                            <th>Mô tả</th>
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
                <h2>Phí dịch vụ</h2>
            </div>
            <div class="table-container">
                <table id="serviceFeesTable">
                    <thead>
                        <tr>
                            <th>Dịch vụ</th>
                            <th>Phí (USD/ngày/nhân viên)</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    await loadServicesData();
    await loadServiceFees();
}

async function loadServicesData() {
    try {
        const services = await api.get('/services');
        const tbody = document.querySelector('#servicesTable tbody');
        tbody.innerHTML = services.map(service => `
            <tr>
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>${service.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editService(${service.id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteService(${service.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function loadServiceFees() {
    try {
        const fees = await api.get('/services/fees');
        const tbody = document.querySelector('#serviceFeesTable tbody');
        tbody.innerHTML = fees.map(fee => `
            <tr>
                <td>${fee.service?.name || 'N/A'}</td>
                <td>$${fee.feePerDayPerEmployee.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editServiceFee(${fee.id}, ${fee.serviceId})">
                        <i class="fas fa-edit"></i> Sửa phí
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading service fees:', error);
    }
}

async function showServiceModal(serviceId = null) {
    const service = serviceId ? await api.get(`/services/${serviceId}`) : null;
    const modal = createModal('serviceModal', serviceId ? 'Sửa dịch vụ' : 'Thêm dịch vụ', `
        <form id="serviceForm">
            <div class="form-group">
                <label>Tên dịch vụ</label>
                <input type="text" id="serviceName" value="${service?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea id="serviceDescription" rows="3">${service?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="serviceIsActive" ${service?.isActive !== false ? 'checked' : ''}>
                    Hoạt động
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('serviceModal')">
                    <i class="fas fa-times"></i> Hủy
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Lưu
                </button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('serviceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: serviceId || 0,
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
            isActive: document.getElementById('serviceIsActive').checked
        };
        
        try {
            if (serviceId) {
                await api.put(`/services/${serviceId}`, data);
            } else {
                await api.post('/services', data);
            }
            closeModal('serviceModal');
            await loadServicesData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editService(id) {
    await showServiceModal(id);
}

async function deleteService(id) {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
        await api.delete(`/services/${id}`);
        await loadServicesData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function editServiceFee(id, serviceId) {
    const fee = await api.get('/services/fees');
    const serviceFee = fee.find(f => f.id === id);
    const newFee = prompt(`Nhập phí mới cho ${serviceFee.service.name} (USD/ngày/nhân viên):`, serviceFee.feePerDayPerEmployee);
    if (newFee && !isNaN(newFee)) {
        try {
            await api.put(`/services/fees/${id}`, {
                id: id,
                serviceId: serviceId,
                feePerDayPerEmployee: parseFloat(newFee)
            });
            await loadServiceFees();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }
}

function createModal(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" onclick="closeModal('${id}')">&times;</button>
            </div>
            ${content}
        </div>
    `;
    return modal;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
}

