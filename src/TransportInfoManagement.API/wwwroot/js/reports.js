let services = [];

window.loadReports = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-chart-bar"></i> Reports</h1>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Clients by Service</h2>
            </div>
            <div class="form-group">
                <label>Select Service</label>
                <select id="reportServiceId">
                    <option value="">Select Service</option>
                </select>
                <button class="btn btn-primary" onclick="loadClientsByService()">View Report</button>
            </div>
            <div id="clientsByServiceResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Employees by Service</h2>
            </div>
            <div class="form-group">
                <label>Select Service</label>
                <select id="reportServiceIdEmployees">
                    <option value="">Select Service</option>
                </select>
                <button class="btn btn-primary" onclick="loadEmployeesByService()">View Report</button>
            </div>
            <div id="employeesByServiceResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Payment Report</h2>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>From Date</label>
                    <input type="date" id="reportStartDate">
                </div>
                <div class="form-group">
                    <label>To Date</label>
                    <input type="date" id="reportEndDate">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="reportStatus">
                        <option value="">All</option>
                        <option value="Pending">Pending Payment</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" onclick="loadPaymentsReport()">View Report</button>
            <div id="paymentsReportResult" style="margin-top: 1rem;"></div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Overdue Payments</h2>
            </div>
            <button class="btn btn-danger" onclick="loadOverduePaymentsReport()">View Report</button>
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
        alert('Please select a service');
        return;
    }
    
    try {
        const clients = await api.get(`/reports/clients-by-service/${serviceId}`);
        const container = document.getElementById('clientsByServiceResult');
        
        if (clients.length === 0) {
            container.innerHTML = '<p>No clients found.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Client Code</th>
                        <th>Company Name</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Start Date</th>
                        <th>Number of Employees</th>
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
        alert('Error: ' + error.message);
    }
}

async function loadEmployeesByService() {
    const serviceId = document.getElementById('reportServiceIdEmployees').value;
    if (!serviceId) {
        alert('Please select a service');
        return;
    }
    
    try {
        const employees = await api.get(`/reports/employees-by-service/${serviceId}`);
        const container = document.getElementById('employeesByServiceResult');
        
        if (employees.length === 0) {
            container.innerHTML = '<p>No employees found.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Employee Code</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Hire Date</th>
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
        alert('Error: ' + error.message);
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
                <h3>Overview</h3>
                <p>Total Payments: ${report.totalPayments}</p>
                <p>Total Amount: $${report.totalAmount.toLocaleString()}</p>
                <p>Paid: $${report.paidAmount.toLocaleString()}</p>
                <p>Pending Payment: $${report.pendingAmount.toLocaleString()}</p>
                <p>Overdue: $${report.overdueAmount.toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Payment Code</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                        <th>Due Date</th>
                        <th>Method</th>
                        <th>Status</th>
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
        alert('Error: ' + error.message);
    }
}

async function loadOverduePaymentsReport() {
    try {
        const report = await api.get('/reports/overdue-payments');
        const container = document.getElementById('overduePaymentsReportResult');
        
        if (report.totalOverdue === 0) {
            container.innerHTML = '<p>No overdue payments.</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3>Overview</h3>
                <p>Total Overdue Payments: ${report.totalOverdue}</p>
                <p>Total Overdue Amount: $${report.totalAmount.toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Payment Code</th>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
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
                            <td>${p.daysOverdue} days</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

