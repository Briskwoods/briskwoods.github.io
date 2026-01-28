/*!
 * Theme Toggle and Modern Interactions
 * For Jeffrey Gichuki's Portfolio
 */

(function () {
    'use strict';

    // ==========================================
    // DARK MODE TOGGLE
    // ==========================================

    const initThemeToggle = () => {
        // Check for saved theme preference, or default to system preference
        let savedTheme = localStorage.getItem('theme');

        // If no saved preference, detect system preference
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            savedTheme = prefersDark ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', savedTheme);

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        toggleButton.innerHTML = savedTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        document.body.appendChild(toggleButton);

        // Toggle functionality
        toggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon
            toggleButton.innerHTML = newTheme === 'dark'
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        });

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-update if user hasn't set a manual preference
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                toggleButton.innerHTML = newTheme === 'dark'
                    ? '<i class="fas fa-sun"></i>'
                    : '<i class="fas fa-moon"></i>';
            }
        });
    };

    // ==========================================
    // SMOOTH SCROLL ENHANCEMENTS
    // ==========================================

    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const navHeight = document.querySelector('#sideNav')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================

    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all content cards and major sections
        document.querySelectorAll('.content-card, .d-flex.flex-column, .resume-section > div').forEach(el => {
            observer.observe(el);
        });
    };

    // ==========================================
    // ACTIVE NAV INDICATOR
    // ==========================================

    const initActiveNav = () => {
        const sections = document.querySelectorAll('.resume-section');
        const navLinks = document.querySelectorAll('#sideNav .nav-link');

        const setActiveNav = () => {
            let current = '';
            const scrollPosition = window.pageYOffset;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (scrollPosition >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', setActiveNav);
        setActiveNav(); // Call once on load
    };

    // ==========================================
    // CODE COPY FUNCTIONALITY
    // ==========================================

    const initCodeCopy = () => {
        document.querySelectorAll('.code-copy-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const codeBlock = this.closest('.code-snippet-container').querySelector('code');
                const code = codeBlock.textContent;

                try {
                    await navigator.clipboard.writeText(code);

                    // Visual feedback
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    this.classList.add('copied');

                    setTimeout(() => {
                        this.textContent = originalText;
                        this.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                    this.textContent = 'Failed';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 2000);
                }
            });
        });
    };

    // ==========================================
    // LOADING OPTIMIZATION
    // ==========================================

    const initLazyLoading = () => {
        // Lazy load images
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', function () {
                        this.classList.add('loaded');
                    });
                }
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }
    };

    // ==========================================
    // PARALLAX EFFECT (SUBTLE)
    // ==========================================

    const initParallax = () => {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    };

    // ==========================================
    // PERFORMANCE MONITORING
    // ==========================================

    const logPerformance = () => {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const connectTime = perfData.responseEnd - perfData.requestStart;
                    const renderTime = perfData.domComplete - perfData.domLoading;

                    console.log('Performance Metrics:');
                    console.log(`Page Load Time: ${pageLoadTime}ms`);
                    console.log(`Connection Time: ${connectTime}ms`);
                    console.log(`Render Time: ${renderTime}ms`);
                }, 0);
            });
        }
    };

    // ==========================================
    // SKILL ICONS TOOLTIP (Optional Enhancement)
    // ==========================================

    const initSkillTooltips = () => {
        const skillIcons = document.querySelectorAll('.dev-icons .list-inline-item');

        skillIcons.forEach(icon => {
            const title = icon.getAttribute('title');
            if (!title) return;

            icon.addEventListener('mouseenter', function (e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'skill-tooltip';
                tooltip.textContent = title;
                tooltip.style.cssText = `
          position: fixed;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          pointer-events: none;
          z-index: 10000;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          transform: translateX(-50%);
          white-space: nowrap;
        `;

                document.body.appendChild(tooltip);

                const rect = this.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

                this._tooltip = tooltip;
            });

            icon.addEventListener('mouseleave', function () {
                if (this._tooltip) {
                    this._tooltip.remove();
                    this._tooltip = null;
                }
            });
        });
    };

    // ==========================================
    // EASTER EGG: KONAMI CODE
    // ==========================================

    const initEasterEgg = () => {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;

                if (konamiIndex === konamiCode.length) {
                    // Easter egg activated!
                    document.body.style.animation = 'rainbow 2s linear infinite';
                    setTimeout(() => {
                        document.body.style.animation = '';
                    }, 5000);
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        // Add rainbow animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    };

    // ==========================================
    // INITIALIZE ALL
    // ==========================================

    const init = () => {
        // Core features
        initThemeToggle();
        initSmoothScroll();
        initScrollAnimations();
        initActiveNav();
        initCodeCopy();

        // Progressive enhancements
        initLazyLoading();
        initParallax();
        initSkillTooltips();

        // Optional features
        if (window.location.hostname !== 'localhost') {
            logPerformance();
        }

        // Fun stuff
        initEasterEgg();

        console.log('🚀 Portfolio initialized successfully!');
        console.log('💡 Try the Konami Code for a surprise!');
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
