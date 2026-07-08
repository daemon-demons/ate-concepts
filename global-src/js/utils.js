function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Shared hamburger / drawer toggle used by hub and module pages. */
function initMobileNav(btnId = 'mobile-menu-btn', menuId = 'mobile-menu') {
    const menuBtn = document.getElementById(btnId);
    const mobileMenu = document.getElementById(menuId);
    if (!menuBtn || !mobileMenu) return;

    function setOpen(open) {
        mobileMenu.classList.toggle('open', open);
        mobileMenu.classList.toggle('hidden', !open);
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) mobileMenu.removeAttribute('inert');
        else mobileMenu.setAttribute('inert', '');
    }

    setOpen(false);

    menuBtn.addEventListener('click', () => {
        setOpen(!mobileMenu.classList.contains('open'));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });
}
