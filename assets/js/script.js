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