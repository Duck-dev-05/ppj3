window.loadServices = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Manage Services</h1>
            <button class="btn btn-primary" onclick="showServiceModal()">
                <i class="fas fa-plus"></i> Add Service
            </button>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Service List</h2>
            </div>
            <div class="table-container">
                <table id="servicesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service Name</th>
                            <th>Description</th>
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
                <h2>Service Fees</h2>
            </div>
            <div class="table-container">
                <table id="serviceFeesTable">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Fee (USD/day/employee)</th>
                            <th>Actions</th>
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
                <td>${service.isActive ? 'Active' : 'Inactive'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editService(${service.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteService(${service.id})" title="Delete">
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
                        <i class="fas fa-edit"></i> Edit Fee
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
    const modal = createModal('serviceModal', serviceId ? 'Edit Service' : 'Add Service', `
        <form id="serviceForm">
            <div class="form-group">
                <label>Service Name</label>
                <input type="text" id="serviceName" value="${service?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="serviceDescription" rows="3">${service?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="serviceIsActive" ${service?.isActive !== false ? 'checked' : ''}>
                    Active
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('serviceModal')">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
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
            alert('Error: ' + error.message);
        }
    });
}

async function editService(id) {
    await showServiceModal(id);
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        await api.delete(`/services/${id}`);
        await loadServicesData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function editServiceFee(id, serviceId) {
    const fee = await api.get('/services/fees');
    const serviceFee = fee.find(f => f.id === id);
    const newFee = prompt(`Enter new fee for ${serviceFee.service.name} (USD/day/employee):`, serviceFee.feePerDayPerEmployee);
    if (newFee && !isNaN(newFee)) {
        try {
            await api.put(`/services/fees/${id}`, {
                id: id,
                serviceId: serviceId,
                feePerDayPerEmployee: parseFloat(newFee)
            });
            await loadServiceFees();
        } catch (error) {
            alert('Error: ' + error.message);
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

