// UI Helper Functions

// Update all action buttons in tables to use icons
function updateActionButtons() {
    // Replace emoji with Font Awesome icons in existing elements
    document.querySelectorAll('.btn-icon').forEach(btn => {
        if (btn.textContent.includes('✏️')) {
            btn.innerHTML = '<i class="fas fa-edit"></i>';
            btn.setAttribute('title', 'Sửa');
        } else if (btn.textContent.includes('🗑️')) {
            btn.innerHTML = '<i class="fas fa-trash"></i>';
            btn.setAttribute('title', 'Xóa');
        }
    });
}

// Add icons to page headers
function addPageHeaderIcons() {
    const headers = {
        'dashboard': '<i class="fas fa-chart-line"></i>',
        'services': '<i class="fas fa-cog"></i>',
        'departments': '<i class="fas fa-building"></i>',
        'employees': '<i class="fas fa-users"></i>',
        'clients': '<i class="fas fa-user-tie"></i>',
        'client-services': '<i class="fas fa-link"></i>',
        'products': '<i class="fas fa-box"></i>',
        'payments': '<i class="fas fa-money-bill-wave"></i>',
        'reports': '<i class="fas fa-chart-bar"></i>'
    };
    
    return headers;
}

// Status badge helper
function getStatusBadge(isActive, type = 'default') {
    if (type === 'payment') {
        // Payment status badges
        return '';
    }
    
    if (isActive) {
        return '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Hoạt động</span>';
    } else {
        return '<span class="badge badge-secondary"><i class="fas fa-times-circle"></i> Không hoạt động</span>';
    }
}

// Payment status badge
function getPaymentStatusBadge(status) {
    const badges = {
        'Paid': '<span class="badge badge-success"><i class="fas fa-check"></i> Đã thanh toán</span>',
        'Pending': '<span class="badge badge-warning"><i class="fas fa-clock"></i> Chờ thanh toán</span>',
        'Overdue': '<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Quá hạn</span>'
    };
    return badges[status] || status;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Show loading spinner
function showLoading(element) {
    element.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
}

// Show error message
function showError(element, message) {
    element.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
}

// Show success message
function showSuccess(element, message) {
    element.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${message}</div>`;
}


