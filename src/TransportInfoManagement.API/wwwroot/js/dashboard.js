window.loadDashboard = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1>Dashboard</h1>
        </div>
        <div id="dashboardStats" class="stats-grid">
            <div class="stat-card loading">Đang tải...</div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>Tổng quan hệ thống</h2>
            </div>
            <div id="dashboardDetails"></div>
        </div>
    `;

    try {
        const stats = await api.get('/reports/dashboard');
        displayDashboardStats(stats);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('dashboardStats').innerHTML = 
            '<div class="stat-card">Lỗi khi tải dữ liệu</div>';
    }
};

function displayDashboardStats(stats) {
    const statsHtml = `
        <div class="stat-card">
            <h3>Tổng khách hàng</h3>
            <div class="value">${stats.clients.total}</div>
            <small>Hoạt động: ${stats.clients.active}</small>
        </div>
        <div class="stat-card">
            <h3>Tổng nhân viên</h3>
            <div class="value">${stats.employees.total}</div>
            <small>Hoạt động: ${stats.employees.active}</small>
        </div>
        <div class="stat-card">
            <h3>Dịch vụ</h3>
            <div class="value">${stats.services.total}</div>
            <small>Hoạt động: ${stats.services.active}</small>
        </div>
        <div class="stat-card">
            <h3>Tổng doanh thu</h3>
            <div class="value">$${stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h3>Thanh toán</h3>
            <div class="value">${stats.payments.total}</div>
            <small>Chờ: ${stats.payments.pending} | Quá hạn: ${stats.payments.overdue}</small>
        </div>
    `;
    document.getElementById('dashboardStats').innerHTML = statsHtml;
}

