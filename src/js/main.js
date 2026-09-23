/* The Kop Corner - page behaviour. Features are added task by task. */

// ---------- Element references ----------
const header = document.querySelector('.site-header');
const navLinks = Array.from(document.querySelectorAll('.navbar__link'));

// Each nav link's href ("#about") is also a CSS selector for its section,
// so this builds a list of sections in the same order as the links.
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));

// ---------- Task 3: Position indicator ----------
// Highlights the menu item for the section that sits directly below the
// bottom edge of the navbar.
function updateActiveLink() {
    const navBottom = header.getBoundingClientRect().bottom;

    // True when the page cannot scroll any further. The last section (the
    // footer) is short and may never reach the navbar, so it is forced here.
    const atPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let activeIndex = 0;

    if (atPageBottom) {
        activeIndex = sections.length - 1;
    } else {
        // The active section is the last one whose top edge has scrolled up to
        // (or past) the navbar's bottom edge. The +1 absorbs sub-pixel rounding.
        sections.forEach((section, index) => {
            if (section.getBoundingClientRect().top <= navBottom + 1) {
                activeIndex = index;
            }
        });
    }

    navLinks.forEach((link, index) => {
        link.classList.toggle('navbar__link--active', index === activeIndex);
    });
}

// ---------- Task 4: Navbar resizing ----------
// How far (in px) the user must scroll before the navbar shrinks.
const SHRINK_AFTER = 50;

// Adds the "shrunk" class once the user scrolls down, removes it again at
// the top. All the actual size changes live in the SCSS.
function updateNavbarSize() {
    header.classList.toggle('site-header--shrunk', window.scrollY > SHRINK_AFTER);
}

// ---------- Task 5: Smooth scrolling ----------
// Clicking a navbar link (or the brand) glides to its section instead of
// jumping, and stops with the section's top edge right under the navbar.
function scrollToSection(event) {
    const target = document.querySelector(event.currentTarget.getAttribute('href'));
    if (!target) {
        return; // unknown link: let the browser handle it normally
    }
    event.preventDefault(); // cancel the browser's instant jump

    // The sticky header still takes up space at the top of the page, so every
    // section's offsetTop includes the header's height. Subtracting it gives
    // a scroll position where the section starts exactly under the navbar.
    // This stays correct even though the navbar shrinks on the way down.
    const destination = target.offsetTop - header.offsetHeight;

    window.scrollTo({ top: destination, behavior: 'smooth' });
}

// Every in-page link (navbar, brand and the hero button) scrolls smoothly.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', scrollToSection);
});

// ---------- Task 6: Carousel ----------
function setupCarousel(carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = carousel.querySelectorAll('.carousel__slide');
    const prevButton = carousel.querySelector('.carousel__arrow--prev');
    const nextButton = carousel.querySelector('.carousel__arrow--next');
    const dotsContainer = carousel.querySelector('.carousel__dots');

    let currentIndex = 0;

    // Build one dot button per slide
    const dots = Array.from(slides).map((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
        return dot;
    });

    function goToSlide(index) {
        // Wrap around: going past the last slide returns to the first and
        // going before the first jumps to the last.
        currentIndex = (index + slides.length) % slides.length;

        // Slide n is n viewport-widths to the right, so shift the track left
        // by n * 100%. The CSS transition animates the movement.
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('carousel__dot--active', i === currentIndex);
        });
    }

    prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));

    goToSlide(0);
}

document.querySelectorAll('.carousel').forEach(setupCarousel);

// ---------- Task 11: Modals ----------
// Each legend card has data-modal="<id of its dialog>". showModal() opens the
// <dialog> centred on screen with a dark backdrop; Esc closes it natively.
document.querySelectorAll('[data-modal]').forEach((card) => {
    const modal = document.getElementById(card.dataset.modal);
    card.addEventListener('click', () => modal.showModal());
});

document.querySelectorAll('.modal').forEach((modal) => {
    modal.querySelector('.modal__close').addEventListener('click', () => modal.close());

    // Clicking the dark backdrop (outside the white box) also closes it
    modal.addEventListener('click', (event) => {
        const box = modal.getBoundingClientRect();
        const outside =
            event.clientX < box.left || event.clientX > box.right ||
            event.clientY < box.top || event.clientY > box.bottom;
        if (outside) {
            modal.close();
        }
    });
});

// ---------- Event listeners ----------
function onScroll() {
    updateNavbarSize();
    updateActiveLink();
}

window.addEventListener('scroll', onScroll);
window.addEventListener('resize', updateActiveLink);

// The navbar's height animates for 0.3s after it shrinks or grows, so its
// bottom edge moves. Re-check the active link once that animation finishes.
header.addEventListener('transitionend', updateActiveLink);

onScroll(); // set the correct size and highlight on first load