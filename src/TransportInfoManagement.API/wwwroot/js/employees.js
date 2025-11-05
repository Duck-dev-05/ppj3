let services = [];
let departments = [];

window.loadEmployees = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Quản lý Nhân viên</h1>
            <button class="btn btn-primary" onclick="showEmployeeModal()">Thêm nhân viên</button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterService" onchange="loadEmployeesData()">
                    <option value="">Tất cả dịch vụ</option>
                </select>
                <select id="filterDepartment" onchange="loadEmployeesData()">
                    <option value="">Tất cả phòng ban</option>
                </select>
            </div>
            <div class="table-container">
                <table id="employeesTable">
                    <thead>
                        <tr>
                            <th>Mã NV</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Chức vụ</th>
                            <th>Dịch vụ</th>
                            <th>Phòng ban</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    services = await api.get('/services');
    departments = await api.get('/departments');
    
    const filterService = document.getElementById('filterService');
    const filterDepartment = document.getElementById('filterDepartment');
    
    services.forEach(s => {
        filterService.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
    
    departments.forEach(d => {
        filterDepartment.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });

    await loadEmployeesData();
}

async function loadEmployeesData() {
    try {
        const serviceId = document.getElementById('filterService')?.value;
        const deptId = document.getElementById('filterDepartment')?.value;
        
        let url = '/employees';
        const params = new URLSearchParams();
        if (serviceId) params.append('serviceId', serviceId);
        if (deptId) params.append('departmentId', deptId);
        if (params.toString()) url += '?' + params.toString();
        
        const employees = await api.get(url);
        const tbody = document.querySelector('#employeesTable tbody');
        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.employeeCode}</td>
                <td>${emp.fullName}</td>
                <td>${emp.email}</td>
                <td>${emp.phone}</td>
                <td>${emp.position}</td>
                <td>${emp.service?.name || 'N/A'}</td>
                <td>${emp.department?.name || 'N/A'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editEmployee(${emp.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteEmployee(${emp.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function showEmployeeModal(empId = null) {
    const emp = empId ? await api.get(`/employees/${empId}`) : null;
    const modal = createModal('employeeModal', empId ? 'Sửa nhân viên' : 'Thêm nhân viên', `
        <form id="employeeForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Mã nhân viên</label>
                    <input type="text" id="empCode" value="${emp?.employeeCode || ''}">
                </div>
                <div class="form-group">
                    <label>Họ tên</label>
                    <input type="text" id="empFullName" value="${emp?.fullName || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="empEmail" value="${emp?.email || ''}" required>
                </div>
                <div class="form-group">
                    <label>SĐT</label>
                    <input type="text" id="empPhone" value="${emp?.phone || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Chức vụ</label>
                    <input type="text" id="empPosition" value="${emp?.position || ''}">
                </div>
                <div class="form-group">
                    <label>Dịch vụ</label>
                    <select id="empServiceId" required>
                        <option value="">Chọn dịch vụ</option>
                        ${services.map(s => `<option value="${s.id}" ${emp?.serviceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Phòng ban</label>
                <select id="empDepartmentId" required>
                    <option value="">Chọn phòng ban</option>
                    ${departments.map(d => `<option value="${d.id}" ${emp?.departmentId === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="empIsActive" ${emp?.isActive !== false ? 'checked' : ''}>
                    Hoạt động
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('employeeModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('employeeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: empId || 0,
            employeeCode: document.getElementById('empCode').value,
            fullName: document.getElementById('empFullName').value,
            email: document.getElementById('empEmail').value,
            phone: document.getElementById('empPhone').value,
            position: document.getElementById('empPosition').value,
            serviceId: parseInt(document.getElementById('empServiceId').value),
            departmentId: parseInt(document.getElementById('empDepartmentId').value),
            isActive: document.getElementById('empIsActive').checked
        };
        
        try {
            if (empId) {
                await api.put(`/employees/${empId}`, data);
            } else {
                await api.post('/employees', data);
            }
            closeModal('employeeModal');
            await loadEmployeesData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editEmployee(id) {
    await showEmployeeModal(id);
}

async function deleteEmployee(id) {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    try {
        await api.delete(`/employees/${id}`);
        await loadEmployeesData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

