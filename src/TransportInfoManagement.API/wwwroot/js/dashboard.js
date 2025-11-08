window.loadDashboard = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
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
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Tổng khách hàng</h3>
                <i class="fas fa-user-tie" style="font-size: 2rem; color: var(--primary-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.clients.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Hoạt động: ${stats.clients.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Tổng nhân viên</h3>
                <i class="fas fa-users" style="font-size: 2rem; color: var(--info-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.employees.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Hoạt động: ${stats.employees.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Dịch vụ</h3>
                <i class="fas fa-cog" style="font-size: 2rem; color: var(--secondary-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.services.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Hoạt động: ${stats.services.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Tổng doanh thu</h3>
                <i class="fas fa-dollar-sign" style="font-size: 2rem; color: var(--success-color); opacity: 0.3;"></i>
            </div>
            <div class="value">$${stats.totalRevenue.toLocaleString()}</div>
            <small><i class="fas fa-chart-line" style="color: var(--success-color);"></i> Doanh thu tích lũy</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Thanh toán</h3>
                <i class="fas fa-money-bill-wave" style="font-size: 2rem; color: var(--warning-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.payments.total}</div>
            <small>
                <span class="badge badge-warning" style="margin-right: 0.5rem;">Chờ: ${stats.payments.pending}</span>
                <span class="badge badge-danger">Quá hạn: ${stats.payments.overdue}</span>
            </small>
        </div>
    `;
    document.getElementById('dashboardStats').innerHTML = statsHtml;
}

