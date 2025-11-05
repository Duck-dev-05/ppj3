let clients = [];

window.loadProducts = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Quản lý Sản phẩm</h1>
            <button class="btn btn-primary" onclick="showProductModal()">Thêm sản phẩm</button>
        </div>
        <div class="card">
            <div class="search-bar">
                <select id="filterClient" onchange="loadProductsData()">
                    <option value="">Tất cả khách hàng</option>
                </select>
            </div>
            <div class="table-container">
                <table id="productsTable">
                    <thead>
                        <tr>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Khách hàng</th>
                            <th>Danh mục</th>
                            <th>Mô tả</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    clients = await api.get('/clients');
    const filterClient = document.getElementById('filterClient');
    
    clients.forEach(c => {
        filterClient.innerHTML += `<option value="${c.id}">${c.companyName}</option>`;
    });

    await loadProductsData();
}

async function loadProductsData() {
    try {
        const clientId = document.getElementById('filterClient')?.value;
        const url = clientId ? `/products?clientId=${clientId}` : '/products';
        
        const products = await api.get(url);
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.productCode}</td>
                <td>${product.productName}</td>
                <td>${product.client?.companyName || 'N/A'}</td>
                <td>${product.category}</td>
                <td>${product.description}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function showProductModal(productId = null) {
    const product = productId ? await api.get(`/products/${productId}`) : null;
    const modal = createModal('productModal', productId ? 'Sửa sản phẩm' : 'Thêm sản phẩm', `
        <form id="productForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Mã sản phẩm</label>
                    <input type="text" id="productCode" value="${product?.productCode || ''}">
                </div>
                <div class="form-group">
                    <label>Tên sản phẩm</label>
                    <input type="text" id="productName" value="${product?.productName || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Khách hàng</label>
                    <select id="productClientId" required>
                        <option value="">Chọn khách hàng</option>
                        ${clients.map(c => `<option value="${c.id}" ${product?.clientId === c.id ? 'selected' : ''}>${c.companyName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Danh mục</label>
                    <input type="text" id="productCategory" value="${product?.category || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea id="productDescription" rows="3">${product?.description || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" onclick="closeModal('productModal')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: productId || 0,
            productCode: document.getElementById('productCode').value,
            productName: document.getElementById('productName').value,
            clientId: parseInt(document.getElementById('productClientId').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value
        };
        
        try {
            if (productId) {
                await api.put(`/products/${productId}`, data);
            } else {
                await api.post('/products', data);
            }
            closeModal('productModal');
            await loadProductsData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });
}

async function editProduct(id) {
    await showProductModal(id);
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
        await api.delete(`/products/${id}`);
        await loadProductsData();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

