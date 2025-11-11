// Public Website JavaScript

// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    updateNavigationForLoggedInUser();
});

function updateNavigationForLoggedInUser() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    if (token) {
        // Update navigation to show user info instead of login button
        const loginLink = document.querySelector('.nav-link[href="/login"]');
        if (loginLink) {
            const fullName = localStorage.getItem('userFullName') || username || 'User';
            loginLink.innerHTML = `<i class="fas fa-user"></i> ${fullName}`;
            loginLink.href = '#';
            loginLink.style.cursor = 'pointer';
            loginLink.classList.add('user-menu-trigger');
            
            // Remove existing listeners
            loginLink.replaceWith(loginLink.cloneNode(true));
            const newLoginLink = document.querySelector('.user-menu-trigger');
            
            newLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleUserMenu(newLoginLink);
            });
        }
    }
}

function toggleUserMenu(trigger) {
    // Remove existing menu if any
    const existingMenu = document.getElementById('userMenuDropdown');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('userFullName');
    const role = localStorage.getItem('userRole');
    
    const menu = document.createElement('div');
    menu.id = 'userMenuDropdown';
    menu.style.cssText = 'position: absolute; top: 100%; right: 0; background: white; box-shadow: var(--shadow-lg); border-radius: 8px; padding: 1rem; min-width: 200px; margin-top: 0.5rem; z-index: 1000;';
    menu.innerHTML = `
        <div style="padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem;">
            <div style="font-weight: 600; color: var(--text-color);">${fullName || username}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">${role === 'Admin' ? 'Administrator' : 'User'}</div>
        </div>
        ${role === 'Admin' ? `
            <a href="/admin" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; color: var(--text-color); text-decoration: none; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-shield-alt"></i> Admin Panel
            </a>
        ` : ''}
        <a href="#" id="logoutBtnPublic" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; color: var(--danger-color); text-decoration: none; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-sign-out-alt"></i> Logout
        </a>
    `;
    
    // Insert menu
    const parent = trigger.parentElement;
    if (parent) {
        parent.style.position = 'relative';
        parent.appendChild(menu);
    }
    
    // Logout handler
    document.getElementById('logoutBtnPublic')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/';
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !trigger.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Animated counter for stats
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for stats animation
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
const contactMessageDiv = document.getElementById('contactMessageDiv');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        company: document.getElementById('contactCompany').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value
    };

    // Simple validation
    if (!formData.name || !formData.email || !formData.message || !formData.subject) {
        showFormMessage('Please fill in all required information', 'error');
        return;
    }

    // Show loading
    contactMessageDiv.className = 'form-message';
    contactMessageDiv.style.display = 'block';
    contactMessageDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // In a real application, you would send this to your backend API
        // For now, we'll simulate a successful submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showFormMessage('Thank you for contacting us! We will respond as soon as possible.', 'success');
        contactForm.reset();
        
        // Scroll to message
        contactMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        showFormMessage('An error occurred. Please try again later.', 'error');
    }
});

function showFormMessage(message, type) {
    contactMessageDiv.className = `form-message ${type}`;
    contactMessageDiv.textContent = message;
    contactMessageDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            contactMessageDiv.style.display = 'none';
        }, 5000);
    }
}

// Fade in animation on scroll
const fadeElements = document.querySelectorAll('.service-card, .feature-item, .info-item');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(element);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set active nav link on page load
    const currentHash = window.location.hash || '#home';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });

    // Scroll to section if hash is present
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        }, 100);
    }
});

