let services = [];

window.loadReports = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Báo cáo</h1>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Khách hàng theo dịch vụ</h2>
            </div>
            <div class="form-group">
                <label>Chọn dịch vụ</label>
                <select id="reportServiceId">
                    <option value="">Chọn dịch vụ</option>
                </select>
                <button class="btn btn-primary" onclick="loadClientsByService()">Xem báo cáo</button>
            </div>
            <div id="clientsByServiceResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Nhân viên theo dịch vụ</h2>
            </div>
            <div class="form-group">
                <label>Chọn dịch vụ</label>
                <select id="reportServiceIdEmployees">
                    <option value="">Chọn dịch vụ</option>
                </select>
                <button class="btn btn-primary" onclick="loadEmployeesByService()">Xem báo cáo</button>
            </div>
            <div id="employeesByServiceResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Báo cáo thanh toán</h2>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Từ ngày</label>
                    <input type="date" id="reportStartDate">
                </div>
                <div class="form-group">
                    <label>Đến ngày</label>
                    <input type="date" id="reportEndDate">
                </div>
                <div class="form-group">
                    <label>Trạng thái</label>
                    <select id="reportStatus">
                        <option value="">Tất cả</option>
                        <option value="Pending">Chờ thanh toán</option>
                        <option value="Paid">Đã thanh toán</option>
                        <option value="Overdue">Quá hạn</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" onclick="loadPaymentsReport()">Xem báo cáo</button>
            <div id="paymentsReportResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Thanh toán quá hạn</h2>
            </div>
            <button class="btn btn-danger" onclick="loadOverduePaymentsReport()">Xem báo cáo</button>
            <div id="overduePaymentsReportResult" style="margin-top: 1rem;"></div>
        </div>
    `;

    services = await api.get('/services');
    const reportServiceId = document.getElementById('reportServiceId');
    const reportServiceIdEmployees = document.getElementById('reportServiceIdEmployees');
    
    services.forEach(s => {
        reportServiceId.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        reportServiceIdEmployees.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
}

async function loadClientsByService() {
    const serviceId = document.getElementById('reportServiceId').value;
    if (!serviceId) {
        alert('Vui lòng chọn dịch vụ');
        return;
    }
    
    try {
        const clients = await api.get(`/reports/clients-by-service/${serviceId}`);
        const container = document.getElementById('clientsByServiceResult');
        
        if (clients.length === 0) {
            container.innerHTML = '<p>Không có khách hàng nào.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Mã KH</th>
                        <th>Tên công ty</th>
                        <th>Người liên hệ</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Ngày bắt đầu</th>
                        <th>Số lượng NV</th>
                    </tr>
                </thead>
                <tbody>
                    ${clients.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.companyName}</td>
                            <td>${c.contactPerson}</td>
                            <td>${c.email}</td>
                            <td>${c.phone}</td>
                            <td>${new Date(c.startDate).toLocaleDateString('vi-VN')}</td>
                            <td>${c.numberOfEmployees}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function loadEmployeesByService() {
    const serviceId = document.getElementById('reportServiceIdEmployees').value;
    if (!serviceId) {
        alert('Vui lòng chọn dịch vụ');
        return;
    }
    
    try {
        const employees = await api.get(`/reports/employees-by-service/${serviceId}`);
        const container = document.getElementById('employeesByServiceResult');
        
        if (employees.length === 0) {
            container.innerHTML = '<p>Không có nhân viên nào.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Chức vụ</th>
                        <th>Phòng ban</th>
                        <th>Ngày tuyển dụng</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(e => `
                        <tr>
                            <td>${e.employeeCode}</td>
                            <td>${e.fullName}</td>
                            <td>${e.email}</td>
                            <td>${e.phone}</td>
                            <td>${e.position}</td>
                            <td>${e.departmentName}</td>
                            <td>${new Date(e.hireDate).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function loadPaymentsReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const status = document.getElementById('reportStatus').value;
    
    let url = '/reports/payments';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    
    try {
        const report = await api.get(url);
        const container = document.getElementById('paymentsReportResult');
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3>Tổng quan</h3>
                <p>Tổng số thanh toán: ${report.totalPayments}</p>
                <p>Tổng số tiền: $${report.totalAmount.toLocaleString()}</p>
                <p>Đã thanh toán: $${report.paidAmount.toLocaleString()}</p>
                <p>Chờ thanh toán: $${report.pendingAmount.toLocaleString()}</p>
                <p>Quá hạn: $${report.overdueAmount.toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Mã TT</th>
                        <th>Khách hàng</th>
                        <th>Số tiền</th>
                        <th>Ngày thanh toán</th>
                        <th>Hạn thanh toán</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.payments.map(p => `
                        <tr>
                            <td>${p.paymentCode}</td>
                            <td>${p.clientName}</td>
                            <td>$${p.amount.toLocaleString()}</td>
                            <td>${new Date(p.paymentDate).toLocaleDateString('vi-VN')}</td>
                            <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                            <td>${p.paymentMethod}</td>
                            <td>${p.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function loadOverduePaymentsReport() {
    try {
        const report = await api.get('/reports/overdue-payments');
        const container = document.getElementById('overduePaymentsReportResult');
        
        if (report.totalOverdue === 0) {
            container.innerHTML = '<p>Không có thanh toán quá hạn.</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3>Tổng quan</h3>
                <p>Tổng số thanh toán quá hạn: ${report.totalOverdue}</p>
                <p>Tổng số tiền quá hạn: $${report.totalAmount.toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Mã TT</th>
                        <th>Khách hàng</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Số tiền</th>
                        <th>Hạn thanh toán</th>
                        <th>Số ngày quá hạn</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.payments.map(p => `
                        <tr>
                            <td>${p.paymentCode}</td>
                            <td>${p.clientName}</td>
                            <td>${p.clientEmail}</td>
                            <td>${p.clientPhone}</td>
                            <td>$${p.amount.toLocaleString()}</td>
                            <td>${new Date(p.dueDate).toLocaleDateString('vi-VN')}</td>
                            <td>${p.daysOverdue} ngày</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

