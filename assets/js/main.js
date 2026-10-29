
document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".hero-track");
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".slider-dot");
    const arrows = document.querySelectorAll(".slider-arrow");

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let timer;

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        track.style.transform =
            `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    function startAutoSlide() {
        clearInterval(timer);

        timer = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 2000);
    }

    if (arrows.length >= 2) {
        arrows[0].addEventListener("click", () => {
            showSlide(currentIndex - 1);
            startAutoSlide();
        });

        arrows[1].addEventListener("click", () => {
            showSlide(currentIndex + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            showSlide(i);
            startAutoSlide();
        });
    });

    showSlide(0);
    startAutoSlide();
});
