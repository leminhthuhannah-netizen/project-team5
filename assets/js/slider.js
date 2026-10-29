document.addEventListener("DOMContentLoaded", () => {
    const DELAY = 2;      // giây: dừng ở mỗi slide
    const DURATION = 0.8; // giây: thời gian trượt sang slide kế

    const slider = document.querySelector(".hero-slider");
    const track = slider?.querySelector(".hero-track");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".slider-dot"));
    const prev = slider.querySelector("#prev-slide");
    const next = slider.querySelector("#next-slide");
    if (slides.length < 2) return;

    // Clone slide đầu nối vào cuối để trượt liền mạch
    const clone = slides[0].cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);

    const total = slides.length;
    let current = 0;
    let timer;

    function updateUI() {
        const real = current % total;
        slides.forEach((s, i) => s.classList.toggle("active", i === real));
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === real);
            if (i === real) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });
    }

    function move(index, animate = true) {
        track.style.transition = animate
            ? `transform ${DURATION}s ease-in-out`
            : "none";
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        updateUI();
    }

    function nextSlide() {
        move(current + 1);

        // Trượt tới bản clone xong thì nhảy âm thầm về slide đầu thật
        if (current === total) {
            setTimeout(() => {
                move(0, false);
                track.offsetWidth; // ép trình duyệt cập nhật
            }, DURATION * 1000);
        }
    }

    function prevSlide() {
        if (current === 0) {
            move(total, false);
            track.offsetWidth;
        }
        move(current - 1);
    }

    function startAutoSlide() {
        clearInterval(timer);
        timer = setInterval(nextSlide, (DELAY + DURATION) * 1000);
    }

    next?.addEventListener("click", () => { nextSlide(); startAutoSlide(); });
    prev?.addEventListener("click", () => { prevSlide(); startAutoSlide(); });
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => { move(i); startAutoSlide(); });
    });

    updateUI();
    startAutoSlide();
});