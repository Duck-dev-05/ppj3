// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pageContent = document.getElementById('pageContent');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            navItems.forEach(ni => ni.classList.remove('active'));
            item.classList.add('active');
            
            // Load corresponding page
            const page = item.getAttribute('data-page');
            loadPage(page);
        });
    });
});

function loadPage(page) {
    const pageFunctions = {
        'dashboard': window.loadDashboard,
        'services': window.loadServices,
        'departments': window.loadDepartments,
        'employees': window.loadEmployees,
        'clients': window.loadClients,
        'client-services': window.loadClientServices,
        'products': window.loadProducts,
        'payments': window.loadPayments,
        'reports': window.loadReports
    };

    const loadFunction = pageFunctions[page];
    if (loadFunction) {
        loadFunction();
    } else {
        document.getElementById('pageContent').innerHTML = '<h1>Trang không tồn tại</h1>';
    }
}

