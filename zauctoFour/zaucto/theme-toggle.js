// Theme Toggle - Adds dark/light mode support across all Zaucto pages
// Save this as theme-toggle.js and include it via <script src="theme-toggle.js"></script>

(function() {
  'use strict';

  // Dark mode CSS variables
  const darkThemeVariables = `
    --bg:#0F172A;--card:#1E293B;--success:#16C784;--danger:#FF4D4F;
    --text:#E2E8F0;--text-secondary:#94A3B8;--text-muted:#64748B;
    --border:#334155;
    --shadow:0 1px 3px rgba(0,0,0,.3),0 4px 12px rgba(0,0,0,.2);
    --shadow-md:0 4px 12px rgba(0,0,0,.3),0 1px 4px rgba(0,0,0,.2);
    --shadow-lg:0 8px 24px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.3);
  `;

  // Apply dark theme by setting CSS variables on :root
  function applyDarkTheme() {
    const root = document.documentElement;
    root.style.setProperty('--bg', '#0F172A');
    root.style.setProperty('--card', '#1E293B');
    root.style.setProperty('--text', '#E2E8F0');
    root.style.setProperty('--text-secondary', '#94A3B8');
    root.style.setProperty('--text-muted', '#64748B');
    root.style.setProperty('--border', '#334155');
    root.style.setProperty('--shadow', '0 1px 3px rgba(0,0,0,.3),0 4px 12px rgba(0,0,0,.2)');
    root.style.setProperty('--shadow-md', '0 4px 12px rgba(0,0,0,.3),0 1px 4px rgba(0,0,0,.2)');
    root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.3)');
  }

  // Reset to light theme (default CSS variables)
  function applyLightTheme() {
    const root = document.documentElement;
    root.style.removeProperty('--bg');
    root.style.removeProperty('--card');
    root.style.removeProperty('--text');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--text-muted');
    root.style.removeProperty('--border');
    root.style.removeProperty('--shadow');
    root.style.removeProperty('--shadow-md');
    root.style.removeProperty('--shadow-lg');
  }

  // Get current theme from localStorage or system preference
  function getPreferredTheme() {
    const stored = localStorage.getItem('zaucto-theme');
    if (stored) return stored;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Save theme preference
  function saveTheme(theme) {
    localStorage.setItem('zaucto-theme', theme);
  }

  // Toggle between themes
  function toggleTheme() {
    const current = getPreferredTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      applyDarkTheme();
      document.body.classList.add('dark-mode');
    } else {
      applyLightTheme();
      document.body.classList.remove('dark-mode');
    }
    
    saveTheme(newTheme);
    updateToggleButton(newTheme);
    return newTheme;
  }

  // Update toggle button state (switch position + labels)
  function updateToggleButton(theme) {
    const toggle = document.getElementById('theme-toggle-btn');
    if (!toggle) return;
    const dark = theme === 'dark';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', dark ? 'true' : 'false');
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Initialize theme on page load
  function initTheme() {
    const theme = getPreferredTheme();
    if (theme === 'dark') {
      applyDarkTheme();
      document.body.classList.add('dark-mode');
    }
    updateToggleButton(theme);
  }

  // Create and add theme toggle button to header
  function addThemeToggleButton() {
    // Only pages with the standard header get the toggle button.
    // Login/signup page has no header-right — theme still APPLIES there (initTheme), just no toggle.
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.getElementById('theme-toggle-btn')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle-btn';
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('role', 'switch');
    toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
    toggleBtn.setAttribute('title', 'Toggle dark mode');
    toggleBtn.innerHTML =
      '<span class="tt-track">' +
        '<svg class="tt-ico tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
        '<svg class="tt-ico tt-moon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<span class="tt-knob"></span>' +
      '</span>';
    
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Add CSS for the toggle switch
    const style = document.createElement('style');
    style.textContent = `
      /* ===== THEME SWITCH (pill + sliding knob) ===== */
      .theme-toggle-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
      }
      .tt-track {
        position: relative;
        display: flex;
        align-items: center;
        width: 58px;
        height: 30px;
        border-radius: 50px;
        background: linear-gradient(120deg, #7EC8FF 0%, #BFE0FF 55%, #FFD9A0 100%);
        border: 1px solid rgba(13,59,255,.18);
        box-shadow: inset 0 2px 6px rgba(10,15,28,.18), 0 1px 3px rgba(0,0,0,.06);
        transition: background .45s cubic-bezier(.22,1,.36,1), border-color .45s, box-shadow .45s;
        overflow: hidden;
      }
      .theme-toggle-btn:hover .tt-track {
        border-color: var(--blue);
        box-shadow: inset 0 2px 6px rgba(10,15,28,.18), 0 0 0 3px rgba(13,59,255,.12);
      }
      .tt-ico {
        position: absolute;
        top: 50%;
        width: 14px;
        height: 14px;
        transition: transform .45s cubic-bezier(.34,1.56,.64,1), opacity .3s, color .3s;
        pointer-events: none;
      }
      .tt-sun {
        left: 7px;
        color: #F59E0B;
        transform: translateY(-50%) scale(1) rotate(0deg);
      }
      .tt-moon {
        right: 7px;
        color: rgba(255,255,255,.95);
        transform: translateY(-50%) scale(.5) rotate(-40deg);
        opacity: 0;
      }
      .tt-knob {
        position: absolute;
        left: 3px;
        top: 50%;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.04);
        transform: translateY(-50%);
        transition: left .45s cubic-bezier(.34,1.56,.64,1), background .4s;
        z-index: 2;
      }
      /* DARK STATE */
      body.dark-mode .tt-track {
        background: linear-gradient(120deg, #1E293B 0%, #0F172A 100%);
        border-color: rgba(255,255,255,.12);
        box-shadow: inset 0 2px 8px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.3);
      }
      body.dark-mode .tt-sun {
        transform: translateY(-50%) scale(.5) rotate(40deg);
        opacity: 0;
        color: #94A3B8;
      }
      body.dark-mode .tt-moon {
        transform: translateY(-50%) scale(1) rotate(0deg);
        opacity: 1;
      }
      body.dark-mode .tt-knob {
        left: calc(100% - 27px);
        background: #F1F5F9;
      }
      /* knob press feedback */
      .theme-toggle-btn:active .tt-knob {
        width: 28px;
      }
      body.dark-mode .theme-toggle-btn:active .tt-knob {
        left: calc(100% - 31px);
      }
      /* focus ring */
      .theme-toggle-btn:focus-visible .tt-track {
        outline: 2px solid var(--blue);
        outline-offset: 2px;
      }
      /* Login page dark mode styles */
      body.dark-mode .left {
        background: linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%);
      }
      body.dark-mode .left::before {
        background-image: linear-gradient(rgba(13,59,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,59,255,.1) 1px, transparent 1px);
      }
      body.dark-mode .left::after {
        background: radial-gradient(circle, rgba(13,59,255,.2) 0%, transparent 70%);
      }
      body.dark-mode .left-logo {
        background: #1E293B;
        box-shadow: 0 2px 12px rgba(13,59,255,.2);
      }
      body.dark-mode .right {
        background: var(--card);
      }
      body.dark-mode .stat-card {
        background: var(--bg);
        border-color: var(--border);
      }
      body.dark-mode .tabs {
        background: var(--bg);
        border-color: var(--border);
      }
      body.dark-mode .tab.active {
        background: var(--card);
        color: var(--blue);
        box-shadow: var(--shadow);
      }
      body.dark-mode .fi {
        background: var(--bg);
        border-color: var(--border);
        color: var(--text);
      }
      body.dark-mode .fi:focus {
        background: var(--card);
      }
      body.dark-mode .btn-s {
        background: var(--card);
        border-color: var(--border);
        color: var(--text);
      }
      body.dark-mode .btn-s:hover {
        background: var(--bg);
        border-color: var(--blue);
      }
      body.dark-mode .div::before,
      body.dark-mode .div::after {
        background: var(--border);
      }
      body.dark-mode .toast {
        background: var(--card);
        border-color: var(--border);
        box-shadow: var(--shadow-lg);
      }
      body.dark-mode .fcheck input {
        border-color: var(--border);
      }
      body.dark-mode .back {
        color: var(--text-muted);
      }
      body.dark-mode .back:hover {
        color: var(--blue);
      }

      /* ===== GLOBAL DARK OVERRIDES (all pages) ===== */
      /* Smooth theme switch */
      body, body * {
        transition-property: background-color, border-color, color, box-shadow;
        transition-duration: .25s;
      }
      /* Hero sections with hardcoded light gradients */
      body.dark-mode section[class*='hero'],
      body.dark-mode div[class*='-hero'] {
        background: linear-gradient(180deg, #16213A 0%, var(--bg) 100%) !important;
      }
      body.dark-mode .hero-grid {
        background-image: linear-gradient(rgba(13,59,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(13,59,255,.08) 1px, transparent 1px) !important;
      }
      /* Fixed header pill on scroll */
      body.dark-mode .header.scrolled .header-inner {
        background: rgba(15,23,42,.88) !important;
        box-shadow: 0 4px 20px rgba(0,0,0,.4) !important;
      }
      body.dark-mode .nav-pill {
        background: rgba(15,23,42,.8) !important;
        border-color: rgba(255,255,255,.08) !important;
      }
      /* Dark navy sections: keep but deepen borders */
      body.dark-mode .partners-section,
      body.dark-mode .security-section,
      body.dark-mode .ai-dark-card {
        background: #0B1120 !important;
      }
      /* Cards & panels not var-driven */
      body.dark-mode .dropdown {
        background: var(--card);
      }
      body.dark-mode .skeleton {
        background: linear-gradient(90deg, #1E293B 25%, #26334A 50%, #1E293B 75%);
        background-size: 200% 100%;
      }
      body.dark-mode .badge {
        background: rgba(13,59,255,.15);
        border-color: rgba(13,59,255,.3);
      }
      body.dark-mode .badge:has(.ai-star),
      body.dark-mode .badge.gold {
        background: rgba(255,159,32,.12);
      }
      /* Form controls across dashboard pages */
      body.dark-mode select,
      body.dark-mode textarea {
        background: var(--bg);
        color: var(--text);
      }
      body.dark-mode input::placeholder,
      body.dark-mode textarea::placeholder {
        color: var(--text-muted);
      }
      /* Scroll-to-top button */
      body.dark-mode .scroll-top {
        background: var(--blue);
        color: #fff;
      }
      /* Mobile drawer shadow on dark */
      body.dark-mode .mm-drawer {
        box-shadow: -12px 0 48px rgba(0,0,0,.5);
      }
      body.dark-mode .mm-overlay {
        background: rgba(0,0,0,.6);
      }
      /* Images: soften bright avatars on dark */
      body.dark-mode .trust-av img,
      body.dark-mode .team-card img {
        filter: brightness(.92);
      }
    `;
    document.head.appendChild(style);
    
    // Insert button before the contact link or avatar if they exist
    const contactLink = headerRight.querySelector('.contact-link');
    const avatar = headerRight.querySelector('.header-avatar');

    if (contactLink) {
      headerRight.insertBefore(toggleBtn, contactLink);
    } else if (avatar) {
      headerRight.insertBefore(toggleBtn, avatar);
    } else {
      headerRight.appendChild(toggleBtn);
    }

    updateToggleButton(getPreferredTheme()); // sync initial switch state (after DOM insert)
  }

  // Make functions globally available
  window.toggleTheme = toggleTheme;
  window.applyDarkTheme = applyDarkTheme;
  window.applyLightTheme = applyLightTheme;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      addThemeToggleButton();
    });
  } else {
    initTheme();
    addThemeToggleButton();
  }
})();
