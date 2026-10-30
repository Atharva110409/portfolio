/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Main Application Logic, Navigation, Interactions & Form Handling
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCopyButtons();
    initContactForm();
    initModals();
    initRevealAnimations();
  });

  // 1. Navigation Active State & Smooth Scrolling
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    // Mobile Menu Toggle
    if (mobileMenuBtn && navLinksContainer) {
      mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = navLinksContainer.classList.toggle('mobile-open');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
      });

      // Close menu on link click
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navLinksContainer.classList.remove('mobile-open');
        });
      });
    }

    // IntersectionObserver for active section link highlighting
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  // 2. One-Click Copy to Clipboard with Toast Notification
  function initCopyButtons() {
    const copyBtns = document.querySelectorAll('[data-copy]');
    const toast = document.getElementById('toast-notice');
    let toastTimeout;

    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
          const originalText = btn.textContent;
          btn.textContent = 'COPIED!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        }).catch(() => {
          showToast('Failed to copy. Please copy manually.');
        });
      });
    });

    function showToast(message) {
      if (!toast) return;
      const textEl = toast.querySelector('.toast-text');
      if (textEl) textEl.textContent = message;
      toast.classList.add('show');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  // 3. Functional Contact Dispatch with Genuine Mailto Mechanism
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const alertBox = document.getElementById('form-status-alert');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#contact-name').value.trim();
      const email = form.querySelector('#contact-email').value.trim();
      const message = form.querySelector('#contact-message').value.trim();

      if (!name || !email || !message) {
        showFormAlert('Please complete all fields (name, email, and message) before dispatching.', 'error');
        return;
      }

      // Basic email regex sanity check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormAlert('Please enter a valid email address so I can respond.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>OPENING EMAIL CLIENT...</span>';
      submitBtn.disabled = true;

      // Construct genuine mailto URL with encoded parameters
      const recipient = 'atharva.gangurde@example.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Hi Atharva,\n\n${message}\n\n---\nSender: ${name}\nEmail: ${email}\nSent via Portfolio Contact Interface`
      );
      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

      // Trigger default mail client
      window.location.href = mailtoUrl;

      // Honest telemetry feedback (no fake "Message Transmitted" message)
      showFormAlert(
        `Opening your system email client with your message pre-composed. If your client did not launch automatically, you can email me directly at ${recipient}.`,
        'info'
      );

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 3500);
    });

    function showFormAlert(msg, type) {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.className = `form-status-alert ${type}`;
      alertBox.style.display = 'block';
    }
  }

  // 4. Modal Triggers & Esc Key Handling
  function initModals() {
    const modals = document.querySelectorAll('.modal-overlay');

    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modals.forEach(modal => modal.classList.remove('active'));
      }
    });
  }

  // 5. Scroll Reveal Micro-Animations
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.timeline-item, .project-feature, .about-highlight-box, .tech-category-card');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(el);
    });
  }
})();
