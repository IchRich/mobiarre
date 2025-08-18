document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('projectSlider');
  if (!slider) return;
  
  // Настройки чувствительности (регулируйте эти значения)
  const SENSITIVITY = 100.8; // Чем выше, тем чувствительнее (рекомендуется 1.5-3.0)
  const INERTIA_FRICTION = 0.92; // Замедление инерции (0.85-0.95)
  const MIN_SWIPE_DISTANCE = 10; // Минимальное расстояние для срабатывания
  
  let isDown = false;
  let startX;
  let scrollLeft;
  let velocity = 0;
  let lastX;
  let lastTime;
  let animationFrame;
  const gap = 20;

  // Функция для точного получения позиции
  const getSliderX = () => slider.getBoundingClientRect().left;

  // Общая функция для начала перетаскивания
  const startDrag = (pageX) => {
    isDown = true;
    slider.classList.add('active');
    startX = pageX - getSliderX();
    scrollLeft = slider.scrollLeft;
    lastX = pageX;
    lastTime = Date.now();
    velocity = 0;
    document.body.classList.add('dragging');
    cancelAnimationFrame(animationFrame);
  };

  // Общая функция для перемещения
  const drag = (pageX) => {
    if (!isDown) return;
    
    const x = pageX - getSliderX();
    const walk = (x - startX) * SENSITIVITY;
    slider.scrollLeft = scrollLeft - walk;
    
    // Расчет скорости для инерции
    const now = Date.now();
    const deltaTime = now - lastTime;
    if (deltaTime > 0) {
      velocity = (pageX - lastX) / deltaTime * SENSITIVITY;
    }
    lastX = pageX;
    lastTime = now;
  };

  // Функция инерции
  const applyInertia = () => {
    if (Math.abs(velocity) < 0.1) {
      snapToSlide();
      return;
    }
    
    slider.scrollLeft -= velocity * 15;
    velocity *= INERTIA_FRICTION;
    
    animationFrame = requestAnimationFrame(applyInertia);
  };

  // Общая функция для завершения
  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('active');
    document.body.classList.remove('dragging');
    
    // Проверка минимального расстояния
    const movedDistance = Math.abs(scrollLeft - slider.scrollLeft);
    if (movedDistance > MIN_SWIPE_DISTANCE) {
      applyInertia();
    } else {
      snapToSlide();
    }
  };

  // Функция для прилипания к слайду
  const snapToSlide = () => {
    const firstSlide = slider.querySelector('.project_slide');
    if (!firstSlide) return;
    
    const slideWidth = firstSlide.offsetWidth;
    const scrollPos = slider.scrollLeft;
    const snapIndex = Math.round(scrollPos / (slideWidth + gap));
    
    slider.scrollTo({
      left: snapIndex * (slideWidth + gap),
      behavior: 'smooth'
    });
  };

  // Мышиные события
  slider.addEventListener('mousedown', (e) => startDrag(e.clientX));
  
  // Глобальные события мыши
  document.addEventListener('mousemove', (e) => drag(e.clientX));
  document.addEventListener('mouseup', endDrag);
  
  // Сенсорные события
  slider.addEventListener('touchstart', (e) => {
    startDrag(e.touches[0].clientX);
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    drag(e.touches[0].clientX);
  }, { passive: false });
  
  document.addEventListener('touchend', endDrag);

  // Блокировка выделения текста
  slider.addEventListener('selectstart', (e) => isDown && e.preventDefault());
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const targetSections = document.querySelectorAll(".about_hero, .hero");

    function checkHeaderVariant() {
        let variant2 = false;

        targetSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Проверяем, видна ли хотя бы часть секции в верхней части экрана
            if (rect.top <= 0 && rect.bottom > 0) {
                variant2 = true;
            }
        });

        header.classList.toggle("header--variant2", variant2);
    }

    window.addEventListener("scroll", checkHeaderVariant);
    checkHeaderVariant();
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const targetSections = document.querySelectorAll(".about_hero, .hero");

    function checkHeaderVariant() {
        let variant2 = false;
        targetSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom > 0) {
                variant2 = true;
            }
        });
        header.classList.toggle("header--variant2", variant2);
    }

    window.addEventListener("scroll", checkHeaderVariant);
    checkHeaderVariant();

    // === Анимация появления блоков ===
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-show");
                obs.unobserve(entry.target); // Сработает только один раз
            }
        });
    }, {
        threshold: 0.1 // срабатывает, когда 10% блока видно
    });

    document.querySelectorAll(".animate-on-scroll").forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    let lastScroll = 0;
    const scrollTolerance = 5; // минимальное смещение, чтобы не дёргался

    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;

        if (Math.abs(currentScroll - lastScroll) <= scrollTolerance) return;

        if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
            // Скролл вниз — прячем хедер
            header.style.transform = "translateY(-100%)";
        } else {
            // Скролл вверх — показываем хедер
            header.style.transform = "translateY(0)";
        }

        lastScroll = currentScroll;
    });
});
