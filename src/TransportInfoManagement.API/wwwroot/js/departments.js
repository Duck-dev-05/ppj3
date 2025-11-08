window.loadDepartments = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-building"></i> Quản lý Phòng ban</h1>
            <button class="btn btn-primary" onclick="showDepartmentModal()">
                <i class="fas fa-plus"></i> Thêm phòng ban
            </button>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Danh sách phòng ban</h2>
            </div>
            <div class="table-container">
                <table id="departmentsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên phòng ban</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    await loadDepartmentsData();
}

async function loadDepartmentsData() {
    try {
        const departments = await api.get('/departments');
        const tbody = document.querySelector('#departmentsTable tbody');
        tbody.innerHTML = departments.map(dept => `
            <tr>
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>${dept.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editDepartment(${dept.id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteDepartment(${dept.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

async function showDepartmentModal(deptId = null) {
    const dept = deptId ? await api.get(`/departments/${deptId}`) : null;
    const modal = createModal('departmentModal', deptId ? 'Sửa phòng ban' : 'Thêm phòng ban', `
        <form id="departmentForm">
            <div class="form-group">
                <label>Tên phòng ban</label>
                <input type="text" id="deptName" value="${dept?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea id="deptDescription" rows="3">${dept?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="deptIsActive" ${dept?.isActive !== false ? 'checked' : ''}>
                    Hoạt động
                </label>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('departmentModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('departmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: deptId || 0,
            name: document.getElementById('deptName').value,
            description: document.getElementById('deptDescription').value,
            isActive: document.getElementById('deptIsActive').checked
        };
        
        try {
            if (deptId) {
                await api.put(`/departments/${deptId}`, data);
            } else {
                await api.post('/departments', data);
            }
            closeModal('departmentModal');
            await loadDepartmentsData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editDepartment(id) {
    await showDepartmentModal(id);
}

async function deleteDepartment(id) {
    if (!confirm('Bạn có chắc muốn xóa phòng ban này?')) return;
    try {
        await api.delete(`/departments/${id}`);
        await loadDepartmentsData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

