/* ============================================================
   MOBILE MENU — Zaucto responsive navigation
   Auto-injects hamburger + slide-in drawer on all pages.
   - Clones existing .nav-links (flattens dropdowns into accordions)
   - Active page auto-detected
   - Esc / overlay / link-click to close, scroll lock, dark-mode aware
   ============================================================ */

(function () {
  'use strict';

  var BREAKPOINT = 1024;

  var CSS = [
    '<style id="zaucto-mobile-menu-css">',
    '.mobile-menu-btn{display:none;width:40px;height:40px;border-radius:10px;background:var(--card);border:1px solid var(--border);cursor:pointer;align-items:center;justify-content:center;color:var(--text);flex-shrink:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:var(--shadow)}',
    '.mobile-menu-btn:hover{border-color:var(--blue);color:var(--blue);transform:translateY(-1px)}',
    '.mobile-menu-btn span.mm-bar{display:block;width:18px;height:2px;background:currentColor;border-radius:2px;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .2s;position:relative}',
    '.mobile-menu-btn span.mm-bar::before,.mobile-menu-btn span.mm-bar::after{content:\'\';position:absolute;left:0;width:18px;height:2px;background:currentColor;border-radius:2px;transition:transform .3s cubic-bezier(.22,1,.36,1),top .3s}',
    '.mobile-menu-btn span.mm-bar::before{top:-6px}',
    '.mobile-menu-btn span.mm-bar::after{top:6px}',
    '.mobile-menu-btn.open span.mm-bar{background:transparent}',
    '.mobile-menu-btn.open span.mm-bar::before{top:0;transform:rotate(45deg)}',
    '.mobile-menu-btn.open span.mm-bar::after{top:0;transform:rotate(-45deg)}',
    '.mm-overlay{position:fixed;inset:0;background:rgba(10,15,28,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:1490;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}',
    '.mm-overlay.open{opacity:1;visibility:visible}',
    '.mm-drawer{position:fixed;top:0;right:0;bottom:0;width:min(340px,88vw);background:var(--bg);z-index:1500;transform:translateX(105%);transition:transform .38s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;box-shadow:-12px 0 48px rgba(0,0,0,.18);padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}',
    '.mm-drawer.open{transform:translateX(0)}',
    '.mm-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border)}',
    '.mm-head img{height:34px;object-fit:contain}',
    '.mm-close{width:36px;height:36px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}',
    '.mm-close:hover{color:var(--danger);border-color:var(--danger)}',
    '.mm-body{flex:1;overflow-y:auto;padding:12px 12px 24px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}',
    '.mm-body a,.mm-group-label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px 14px;border-radius:12px;font-size:15px;font-weight:500;color:var(--text);text-decoration:none;transition:background .2s,color .2s}',
    '.mm-body a:hover{background:rgba(18,33,54,.05);color:var(--blue)}',
    '.mm-body a.active{background:rgba(18,33,54,.08);color:var(--blue);font-weight:600}',
    '.mm-body a.active::after{content:\'\';width:6px;height:6px;border-radius:50%;background:var(--blue)}',
    '.mm-group{margin:2px 0}',
    '.mm-group-label{cursor:pointer;user-select:none;font-weight:600}',
    '.mm-group-label .mm-chev{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s cubic-bezier(.22,1,.36,1);opacity:.6}',
    '.mm-group.open .mm-group-label{color:var(--blue)}',
    '.mm-group.open .mm-chev{transform:rotate(180deg)}',
    '.mm-sub{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.22,1,.36,1);padding-left:10px}',
    '.mm-group.open .mm-sub{max-height:600px}',
    '.mm-sub a{font-size:14px;font-weight:400;color:var(--text-secondary);border-left:2px solid var(--border);border-radius:0 12px 12px 0;margin-left:6px}',
    '.mm-sub a:hover{border-left-color:var(--blue)}',
    '.mm-sub a.active{border-left-color:var(--blue)}',
    '.mm-gold{color:var(--gold)!important;font-weight:600!important}',
    '.mm-foot{padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:10px}',
    '.mm-foot .btn{flex:1;justify-content:center;text-decoration:none}',
    'body.mm-locked{overflow:hidden}',
    '@media(max-width:' + BREAKPOINT + 'px){',
    '  .nav-links{display:none!important}',
    '  .header .contact-link{display:none}',
    '  .mobile-menu-btn{display:flex}',
    '  .header-right .mobile-menu-btn{display:flex}',
    '}',
    '</style>'
  ].join('');

  var CHEV = '<svg class="mm-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';

  function buildDrawer(header) {
    if (document.getElementById('mmDrawer')) return null;
    var drawer = document.createElement('div');
    drawer.className = 'mm-drawer';
    drawer.id = 'mmDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Navigation menu');

    var nav = header.querySelector('.nav-links');
    var bodyHTML = '';

    if (nav) {
      Array.prototype.forEach.call(nav.children, function (node) {
        if (node.classList && node.classList.contains('nav-item')) {
          var trigger = node.querySelector(':scope > a');
          var drop = node.querySelector('.dropdown');
          if (trigger && drop) {
            var isAI = trigger.classList.contains('ai-tag');
            var label = trigger.textContent.trim();
            bodyHTML += '<div class="mm-group">'
              + '<div class="mm-group-label' + (isAI ? ' mm-gold' : '') + '" role="button" tabindex="0" aria-expanded="false">'
              + '<span>' + label + '</span>' + CHEV + '</div>'
              + '<div class="mm-sub">'
              + Array.prototype.map.call(drop.querySelectorAll('a'), function (a) {
                  return a.outerHTML;
                }).join('')
              + '</div></div>';
          }
        } else if (node.tagName === 'A') {
          bodyHTML += node.outerHTML;
        }
      });
    }

    var here = location.pathname.split('/').pop() || 'zauctofour.html';
    var tmp = document.createElement('div');
    tmp.innerHTML = bodyHTML;
    Array.prototype.forEach.call(tmp.querySelectorAll('a[href]'), function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
      if (href && href === here) a.classList.add('active');
      a.removeAttribute('style');
      if (a.classList.contains('mm-gold') || (a.getAttribute('href') || '').indexOf('Pricing') > -1) a.classList.add('mm-gold');
    });
    bodyHTML = tmp.innerHTML;

    var right = header.querySelector('.header-right');
    var contact = right ? right.querySelector('.contact-link') : null;

    drawer.innerHTML =
      '<div class="mm-head">'
      + (document.querySelector('.logo-icon img') ? '<img src="' + document.querySelector('.logo-icon img').getAttribute('src') + '" alt="Zaucto">' : '<strong>Zaucto</strong>')
      + '<button class="mm-close" aria-label="Close menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'
      + '</div>'
      + '<nav class="mm-body">' + bodyHTML + '</nav>'
      + '<div class="mm-foot">'
      + (contact ? contact.outerHTML.replace('contact-link', 'btn btn-secondary') : '<a href="zauctoContact.html" class="btn btn-secondary">Contact Us</a>')
      + '</div>';

    var overlay = document.createElement('div');
    overlay.className = 'mm-overlay';
    overlay.id = 'mmOverlay';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    return { drawer: drawer, overlay: overlay };
  }

  function setOpen(ref, open) {
    if (!ref) return;
    ref.drawer.classList.toggle('open', open);
    ref.overlay.classList.toggle('open', open);
    document.body.classList.toggle('mm-locked', open);
    var btn = document.querySelector('.mobile-menu-btn');
    if (btn) {
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function init() {
    var header = document.querySelector('.header');
    if (!header) return; // login page has no header
    if (document.getElementById('mmDrawer')) return;

    var style = document.createElement('div');
    style.innerHTML = CSS;
    document.head.appendChild(style.firstChild);

    var btn = document.createElement('button');
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="mm-bar"></span>';

    var right = header.querySelector('.header-right');
    if (right) {
      right.insertBefore(btn, right.firstChild);
    } else {
      header.querySelector('.container').appendChild(btn);
    }

    var ref = null;
    btn.addEventListener('click', function () {
      if (!ref) ref = buildDrawer(header);
      setOpen(ref, !ref.drawer.classList.contains('open'));
    });

    document.addEventListener('click', function (e) {
      if (!ref) return;
      if (e.target.closest('.mm-close') || e.target.classList.contains('mm-overlay')) { setOpen(ref, false); return; }
      var group = e.target.closest('.mm-group-label');
      if (group) {
        var g = group.parentElement;
        var isOpen = g.classList.toggle('open');
        group.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        return;
      }
      if (e.target.closest('.mm-body a[href]')) setTimeout(function () { setOpen(ref, false); }, 120);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ref) setOpen(ref, false);
    });

    window.addEventListener('resize', function () {
      if (ref && window.innerWidth > BREAKPOINT) setOpen(ref, false);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
