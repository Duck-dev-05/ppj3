window.loadClients = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Quản lý Khách hàng</h1>
            <button class="btn btn-primary" onclick="showClientModal()">Thêm khách hàng</button>
        </div>
        <div class="card">
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Tìm kiếm khách hàng..." onkeyup="loadClientsData()">
                <button class="btn btn-primary" onclick="showAdvancedSearch()">Tìm kiếm nâng cao</button>
            </div>
            <div class="table-container">
                <table id="clientsTable">
                    <thead>
                        <tr>
                            <th>Mã KH</th>
                            <th>Tên công ty</th>
                            <th>Người liên hệ</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Thành phố</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    await loadClientsData();
}

async function loadClientsData() {
    try {
        const search = document.getElementById('searchInput')?.value || '';
        const url = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';
        const clients = await api.get(url);
        const tbody = document.querySelector('#clientsTable tbody');
        tbody.innerHTML = clients.map(client => `
            <tr>
                <td>${client.clientCode}</td>
                <td>${client.companyName}</td>
                <td>${client.contactPerson}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${client.city}</td>
                <td>${client.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editClient(${client.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function showAdvancedSearch() {
    const modal = createModal('advancedSearchModal', 'Tìm kiếm nâng cao', `
        <form id="advancedSearchForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Tên công ty</label>
                    <input type="text" id="searchCompanyName">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="searchEmail">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Thành phố</label>
                    <input type="text" id="searchCity">
                </div>
                <div class="form-group">
                    <label>Quốc gia</label>
                    <input type="text" id="searchCountry">
                </div>
            </div>
            <div class="form-group">
                <label>Trạng thái</label>
                <select id="searchIsActive">
                    <option value="">Tất cả</option>
                    <option value="true">Hoạt động</option>
                    <option value="false">Không hoạt động</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('advancedSearchModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Tìm kiếm</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('advancedSearchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        const companyName = document.getElementById('searchCompanyName').value;
        const email = document.getElementById('searchEmail').value;
        const city = document.getElementById('searchCity').value;
        const country = document.getElementById('searchCountry').value;
        const isActive = document.getElementById('searchIsActive').value;
        
        if (companyName) params.append('companyName', companyName);
        if (email) params.append('email', email);
        if (city) params.append('city', city);
        if (country) params.append('country', country);
        if (isActive) params.append('isActive', isActive);
        
        try {
            const clients = await api.get(`/clients/advanced-search?${params.toString()}`);
            const tbody = document.querySelector('#clientsTable tbody');
            tbody.innerHTML = clients.map(client => `
                <tr>
                    <td>${client.clientCode}</td>
                    <td>${client.companyName}</td>
                    <td>${client.contactPerson}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>${client.city}</td>
                    <td>${client.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editClient(${client.id})">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
            closeModal('advancedSearchModal');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function showClientModal(clientId = null) {
    const client = clientId ? await api.get(`/clients/${clientId}`) : null;
    const modal = createModal('clientModal', clientId ? 'Sửa khách hàng' : 'Thêm khách hàng', `
        <form id="clientForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Mã khách hàng</label>
                    <input type="text" id="clientCode" value="${client?.clientCode || ''}">
                </div>
                <div class="form-group">
                    <label>Tên công ty</label>
                    <input type="text" id="clientCompanyName" value="${client?.companyName || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Người liên hệ</label>
                    <input type="text" id="clientContactPerson" value="${client?.contactPerson || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="clientEmail" value="${client?.email || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>SĐT</label>
                    <input type="text" id="clientPhone" value="${client?.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Thành phố</label>
                    <input type="text" id="clientCity" value="${client?.city || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Quốc gia</label>
                    <input type="text" id="clientCountry" value="${client?.country || ''}">
                </div>
                <div class="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" id="clientAddress" value="${client?.address || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="clientIsActive" ${client?.isActive !== false ? 'checked' : ''}>
                    Hoạt động
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('clientModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('clientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: clientId || 0,
            clientCode: document.getElementById('clientCode').value,
            companyName: document.getElementById('clientCompanyName').value,
            contactPerson: document.getElementById('clientContactPerson').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            city: document.getElementById('clientCity').value,
            country: document.getElementById('clientCountry').value,
            address: document.getElementById('clientAddress').value,
            isActive: document.getElementById('clientIsActive').checked
        };
        
        try {
            if (clientId) {
                await api.put(`/clients/${clientId}`, data);
            } else {
                await api.post('/clients', data);
            }
            closeModal('clientModal');
            await loadClientsData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editClient(id) {
    await showClientModal(id);
}

async function deleteClient(id) {
    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
    try {
        await api.delete(`/clients/${id}`);
        await loadClientsData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

