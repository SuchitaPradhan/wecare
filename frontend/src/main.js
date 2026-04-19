import './style.css'

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, animations disabled');
        return;
    }

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Minimal LAB46-style Fade In Animations
    // Elements simply fade in and move up slightly

    const animateElements = [
        '.hero-content',
        '.hero-visual',
        '.about-content',
        '.feature-card',
        '.doctor-card',
        '.step-card',
        '.benefit-item'
    ];

    animateElements.forEach(selector => {
        gsap.utils.toArray(selector).forEach(element => {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        });
    });

    // Read More Toggle for About Section
    const readMoreBtn = document.getElementById('read-more-btn');
    const aboutExpanded = document.getElementById('about-expanded');
    const readMoreText = readMoreBtn?.querySelector('.read-more-text');

    if (readMoreBtn && aboutExpanded) {
        readMoreBtn.addEventListener('click', () => {
            const isExpanded = aboutExpanded.classList.toggle('active');
            readMoreBtn.classList.toggle('active');

            if (isExpanded) {
                readMoreBtn.innerHTML = `
          <span class="read-more-text">Show Less</span>
          <svg class="read-more-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        `;
            } else {
                readMoreBtn.innerHTML = `
          <span class="read-more-text">Read More About Us</span>
          <svg class="read-more-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        `;
            }
        });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            if (navLinks) {
                navLinks.classList.toggle('active');
            }
        });
    }

    // Navbar scroll effect - Minimal border change
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'var(--color-bg)';
            }
        });
    }
    // Manual Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const carousel = document.getElementById('hero-carousel');
    let currentSlide = 0;

    function showSlide(index) {
        // Wrap around
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        // Update slides
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');

        // Update indicators
        indicators.forEach(ind => ind.classList.remove('active'));
        if (indicators[index]) indicators[index].classList.add('active');

        currentSlide = index;
    }

    if (carousel && slides.length > 0) {
        // Tap/Click on carousel to advance
        carousel.addEventListener('click', (e) => {
            // Ignore clicks on indicators to prevent double firing
            if (e.target.classList.contains('indicator')) return;
            showSlide(currentSlide + 1);
        });

        // Indicator clicks
        indicators.forEach((ind, i) => {
            ind.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering carousel advance
                showSlide(i);
            });
        });
    }


    // Mega Menu Toggle
    const discoverToggle = document.getElementById('discover-toggle');
    const megaMenu = document.getElementById('mega-menu');

    if (discoverToggle && megaMenu) {
        discoverToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            megaMenu.classList.toggle('active');
            discoverToggle.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!megaMenu.contains(e.target) && !discoverToggle.contains(e.target)) {
                megaMenu.classList.remove('active');
                discoverToggle.classList.remove('active');
            }
        });
    }


    // Booking Drawer Logic
    const bookingDrawer = document.getElementById('booking-drawer');
    const bookingOverlay = document.getElementById('booking-overlay');
    const closeDrawerBtn = document.getElementById('drawer-close');

    // New Selectors
    const heroBookBtn = document.getElementById('hero-book-btn');
    const doctorBookBtns = document.querySelectorAll('.btn-book-doctor');
    const quickBookBtns = document.querySelectorAll('.btn-quick');

    function openDrawer(e) {
        if (e) e.preventDefault();
        bookingDrawer.classList.add('active');
        bookingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        bookingDrawer.classList.remove('active');
        bookingOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (bookingDrawer && bookingOverlay) {
        if (heroBookBtn) heroBookBtn.addEventListener('click', openDrawer);
        const megaBookBtn = document.getElementById('mega-book-btn');
        if (megaBookBtn) megaBookBtn.addEventListener('click', openDrawer);

        if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
        bookingOverlay.addEventListener('click', closeDrawer);

        doctorBookBtns.forEach(btn => btn.addEventListener('click', openDrawer));

        // Quick Links
        quickBookBtns.forEach(btn => {
            if (btn.innerText.includes('Book Appointment')) {
                btn.addEventListener('click', openDrawer);
            }
        });

        // Drawer Form Logic
        const drawerForm = document.getElementById('drawer-booking-form');
        const drawerBookingCard = document.getElementById('drawer-booking-card');
        const drawerSuccessCard = document.getElementById('drawer-success-card');

        if (drawerForm) {
            drawerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                drawerBookingCard.style.display = 'none';
                drawerSuccessCard.style.display = 'block';
            });
        }

        // Drawer Resize Logic
        const resizer = document.getElementById('drawer-resize-handle');
        let isResizing = false;

        if (resizer) {
            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                // Width = Mouse X because drawer is anchored left
                let newWidth = e.clientX;
                bookingDrawer.style.width = `${newWidth}px`;
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                }
            });
        }
    }
});
