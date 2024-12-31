let lastScrollTop = 0;
let ticking = false;
const nav = document.querySelector('.main-nav');
const navHeight = nav.offsetHeight;

// Add padding to body to account for fixed nav
document.body.style.paddingTop = navHeight + 'px';

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop <= navHeight) {
                // Near the top - show nav and adjust its position
                nav.style.transform = `translateY(-${scrollTop}px)`;
                nav.classList.remove('hidden');
            } else {
                // Further down the page
                nav.style.transform = 'translateY(0)';
                if (scrollTop > lastScrollTop) {
                    // Scrolling down - hide nav
                    nav.classList.add('hidden');
                } else {
                    // Scrolling up - show nav
                    nav.classList.remove('hidden');
                }
            }
            
            lastScrollTop = scrollTop;
            ticking = false;
        });
        
        ticking = true;
    }
}); 