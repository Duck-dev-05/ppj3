window.loadDashboard = async function() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
        </div>
        <div id="dashboardStats" class="stats-grid">
            <div class="stat-card loading">Loading...</div>
        </div>
        <div class="card">
            <div class="card-header">
                <h2>System Overview</h2>
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
            '<div class="stat-card">Error loading data</div>';
    }
};

function displayDashboardStats(stats) {
    const statsHtml = `
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Total Clients</h3>
                <i class="fas fa-user-tie" style="font-size: 2rem; color: var(--primary-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.clients.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Active: ${stats.clients.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Total Employees</h3>
                <i class="fas fa-users" style="font-size: 2rem; color: var(--info-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.employees.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Active: ${stats.employees.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Services</h3>
                <i class="fas fa-cog" style="font-size: 2rem; color: var(--secondary-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.services.total}</div>
            <small><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Active: ${stats.services.active}</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Total Revenue</h3>
                <i class="fas fa-dollar-sign" style="font-size: 2rem; color: var(--success-color); opacity: 0.3;"></i>
            </div>
            <div class="value">$${stats.totalRevenue.toLocaleString()}</div>
            <small><i class="fas fa-chart-line" style="color: var(--success-color);"></i> Cumulative Revenue</small>
        </div>
        <div class="stat-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3>Payments</h3>
                <i class="fas fa-money-bill-wave" style="font-size: 2rem; color: var(--warning-color); opacity: 0.3;"></i>
            </div>
            <div class="value">${stats.payments.total}</div>
            <small>
                <span class="badge badge-warning" style="margin-right: 0.5rem;">Pending: ${stats.payments.pending}</span>
                <span class="badge badge-danger">Overdue: ${stats.payments.overdue}</span>
            </small>
        </div>
    `;
    document.getElementById('dashboardStats').innerHTML = statsHtml;
}

