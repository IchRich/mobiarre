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
// === Модальное окно со слайдером ===
document.addEventListener("DOMContentLoaded", () => {
  console.log('🔍 Инициализация модального окна со слайдером...');
  
  const modalOverlay = document.getElementById('modalOverlay');
  const modalSlideImage = document.getElementById('modalSlideImage');
  const prevSlide = document.getElementById('prevSlide');
  const nextSlide = document.getElementById('nextSlide');
  const modalThumbnails = document.getElementById('modalThumbnails');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const projectSlides = document.querySelectorAll('.project_slide');
  const productGalleryImgs = document.querySelectorAll('.product_gallery img');
  
  console.log('📋 Найденные элементы:', {
    modalOverlay: !!modalOverlay,
    modalSlideImage: !!modalSlideImage,
    prevSlide: !!prevSlide,
    nextSlide: !!nextSlide,
    modalThumbnails: !!modalThumbnails,
    projectSlidesCount: projectSlides.length,
    productGalleryImgs: productGalleryImgs.length
  });
  
  if (!modalOverlay || !modalSlideImage || !modalThumbnails) {
    console.error('❌ Не найдены необходимые элементы модального окна');
    return;
  }

  let currentSlideIndex = 0;
  let slides = Array.from(projectSlides).map(slide => {
    const img = slide.querySelector('img');
    return img ? img.src : '';
  }).filter(src => src);

  // Если это страница товара, собираем изображения из галереи
  if (slides.length === 0 && productGalleryImgs.length > 0) {
    slides = Array.from(productGalleryImgs).map(img => img.src);
  }

  console.log('🖼️ Найденные слайды:', slides);

  // Создаем миниатюры
  function createThumbnails() {
    modalThumbnails.innerHTML = '';
    slides.forEach((slideSrc, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'modal_thumbnail';
      thumbnail.dataset.index = index;
      
      const img = document.createElement('img');
      img.src = slideSrc;
      img.alt = `Миниатюра ${index + 1}`;
      
      thumbnail.appendChild(img);
      modalThumbnails.appendChild(thumbnail);
      
      // Добавляем обработчик клика на миниатюру
      thumbnail.addEventListener('click', (e) => {
        console.log(`🖱️ Клик по миниатюре ${index}`);
        e.stopPropagation(); // Предотвращаем закрытие модального окна
        currentSlideIndex = index;
        updateSlide();
        updateThumbnails();
      });
    });
  }

  // Обновляем выделение активной миниатюры
  function updateThumbnails() {
    const thumbnails = modalThumbnails.querySelectorAll('.modal_thumbnail');
    thumbnails.forEach((thumb, index) => {
      if (index === currentSlideIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  function openModalAt(index) {
    currentSlideIndex = index;
    openModal();
  }

  // Инициализация
  createThumbnails();

  // Открытие модального окна при клике на миниатюры/слайды проекта
  projectSlides.forEach((slide, index) => {
    console.log(`🎯 Добавляю обработчик для слайда ${index}:`, slide);
    
    const openModalForSlide = (e) => {
      console.log(`🖱️ Сработал обработчик для слайда ${index}`, e);
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openModalAt(index);
      return false;
    };
    
    slide.addEventListener('click', openModalForSlide, { capture: true });
    slide.addEventListener('mousedown', openModalForSlide, { capture: true });
    slide.addEventListener('touchstart', openModalForSlide, { capture: true, passive: false });
    
    const img = slide.querySelector('img');
    if (img) {
      img.addEventListener('click', openModalForSlide, { capture: true });
      img.addEventListener('mousedown', openModalForSlide, { capture: true });
      img.addEventListener('touchstart', openModalForSlide, { capture: true, passive: false });
    }
  });

  // Открытие модального окна при клике на галерею товара
  if (productGalleryImgs.length > 0) {
    Array.from(productGalleryImgs).forEach((img, index) => {
      const handler = (e) => {
        console.log(`🖱️ Клик по изображению галереи товара ${index}`, e);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openModalAt(index);
        return false;
      };
      img.addEventListener('click', handler, { capture: true });
      img.addEventListener('mousedown', handler, { capture: true });
      img.addEventListener('touchstart', handler, { capture: true, passive: false });
    });
  }

  // Дополнительная проверка - делегирование (для projectSlider)
  const projectSlider = document.getElementById('projectSlider');
  if (projectSlider) {
    console.log('🎯 Добавляю делегированный обработчик на слайдер');
    projectSlider.addEventListener('click', (e) => {
      const slide = e.target.closest('.project_slide');
      if (slide) {
        const index = Array.from(projectSlides).indexOf(slide);
        console.log(`🖱️ Делегированный клик по слайду ${index}`, e);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openModalAt(index);
        return false;
      }
    }, { capture: true });
  }

  // Закрытие модального окна при клике в любое место
  modalOverlay.addEventListener('click', (e) => {
    const isArrow = e.target.closest('.slider_arrow');
    const isThumbnail = e.target.closest('.modal_thumbnail');
    const isThumbnailsContainer = e.target.closest('.modal_thumbnails');
    
    if (!isArrow && !isThumbnail && !isThumbnailsContainer) {
      console.log('❌ Клик по фону модального окна - закрытие');
      closeModal();
    }
  });

  // Навигация по стрелкам
  prevSlide.addEventListener('click', (e) => {
    console.log('⬅️ Клик по стрелке "назад"');
    e.stopPropagation();
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    updateSlide();
    updateThumbnails();
  });

  nextSlide.addEventListener('click', (e) => {
    console.log('➡️ Клик по стрелке "вперед"');
    e.stopPropagation();
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    updateSlide();
    updateThumbnails();
  });

  // Навигация по клавиатуре
  document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        console.log('⌨️ Нажата клавиша Escape');
        closeModal();
        break;
      case 'ArrowLeft':
        console.log('⌨️ Нажата стрелка влево');
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateSlide();
        updateThumbnails();
        break;
      case 'ArrowRight':
        console.log('⌨️ Нажата стрелка вправо');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSlide();
        updateThumbnails();
        break;
    }
  });

  function openModal() {
    console.log('🚀 Открытие модального окна, слайд:', currentSlideIndex);
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Установим название проекта (если есть на странице)
    if (modalProjectTitle) {
      const titleEl = document.querySelector('.product_title_main');
      modalProjectTitle.textContent = titleEl ? titleEl.textContent.trim() : '';
    }
    updateSlide();
    updateThumbnails();
  }

  function closeModal() {
    console.log('🔒 Закрытие модального окна');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateSlide() {
    console.log('🔄 Обновление слайда:', currentSlideIndex, slides[currentSlideIndex]);
    if (slides[currentSlideIndex]) {
      modalSlideImage.src = slides[currentSlideIndex];
    }
  }
  
  console.log('✅ Модальное окно инициализировано');
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

        header.classList.toggle("header_variant2", variant2);
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
        header.classList.toggle("header_variant2", variant2);
    }

    window.addEventListener("scroll", checkHeaderVariant);
    checkHeaderVariant();

    // === Анимация появления блоков ===
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate_show");
                obs.unobserve(entry.target); // Сработает только один раз
            }
        });
    }, {
        threshold: 0.1 // срабатывает, когда 10% блока видно
    });

    document.querySelectorAll(".animate_on_scroll").forEach(el => observer.observe(el));
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


// === Конец модального окна со слайдером ===

// document.addEventListener("DOMContentLoaded", () => {
//   const aboutSection = document.querySelector('.about');
//   const animImage = document.querySelector('.about_img_animation');
//   const aboutImage = document.querySelector('.about_image');
  
//   if (!aboutSection || !animImage || !aboutImage) return;

//   function animateImageOnScroll() {
//     const sectionRect = aboutSection.getBoundingClientRect();
//     const imageTargetRect = aboutImage.getBoundingClientRect();
//     const windowHeight = window.innerHeight;
//     const windowWidth = window.innerWidth;

//     // Модификация: увеличен буфер до 400px
//     const triggerStart = sectionRect.top < windowHeight + 400 && sectionRect.bottom > 0;
    
//     if (!triggerStart) {
//       animImage.style.opacity = '0';
//       aboutImage.classList.remove('about_image--hidden');
//       return;
//     }

//     animImage.style.opacity = '1';
//     aboutImage.classList.add('about_image--hidden');

//     // Модификация: начинаем анимацию раньше
//     const animStart = sectionRect.top + window.scrollY - 200; // -200px раньше
//     const animEnd = imageTargetRect.top + window.scrollY + 80 ;
//     const scrollY = window.scrollY;
//     let progress = (scrollY - animStart) / (animEnd - animStart);
//     progress = Math.max(0, Math.min(1, progress));

//     const startWidth = windowWidth;
//     const startHeight = windowHeight;
//     const startLeft = 0;
//     const startTop = 0;
//     const endWidth = imageTargetRect.width;
//     const endHeight = imageTargetRect.height;
//     const endLeft = imageTargetRect.left;
//     const endTop = imageTargetRect.top;
//     const endRadius = 24;

//     const width = startWidth + (endWidth - startWidth) * progress;
//     const height = startHeight + (endHeight - startHeight) * progress;
//     const left = startLeft + (endLeft - startLeft) * progress;
//     const top = startTop + (endTop - startTop) * progress;
//     const borderRadius = 0 + endRadius * progress;

//     animImage.style.width = width + 'px';
//     animImage.style.height = height + 'px';
//     animImage.style.left = left + 'px';
//     animImage.style.top = top + 'px';
//     animImage.style.borderRadius = borderRadius + 'px';

//     if (progress >= 1) {
//       animImage.style.opacity = '0';
//       aboutImage.classList.remove('about_image--hidden');
//     }
//   }

//   let ticking = false;
//   function updateAnimation() {
//     if (!ticking) {
//       requestAnimationFrame(() => {
//         animateImageOnScroll();
//         ticking = false;
//       });
//       ticking = true;
//     }
//   }

//   window.addEventListener('scroll', updateAnimation);
//   window.addEventListener('resize', updateAnimation);
//   animateImageOnScroll();
// });
        document.addEventListener('DOMContentLoaded', () => {
            const productInfo = document.querySelector('.product_info');
            const productTop = document.querySelector('.product_top');
            const productPage = document.querySelector('.product_page');
            
            if (!productInfo || !productTop || !productPage) return;
            
            function updateProductInfoPosition() {
                const scrollY = window.scrollY;
                const productTopRect = productTop.getBoundingClientRect();
                const productPageRect = productPage.getBoundingClientRect();
                
                // Получаем позицию элемента относительно документа
                const productTopOffset = productTop.offsetTop;
                const productPageHeight = productPage.offsetHeight;
                const productInfoHeight = productInfo.offsetHeight;
                
                // Вычисляем, когда начинать и заканчивать фиксацию
                const startSticky = productTopOffset - 80;
                const endSticky = productTopOffset + productPageHeight - productInfoHeight - 275;
                
                // Убираем все классы позиционирования
                productInfo.classList.remove('fixed', 'absolute');
                
                if (scrollY > startSticky && scrollY < endSticky) {
                    // Фиксированное позиционирование в середине скролла
                    productInfo.classList.add('fixed');
                } else if (scrollY >= endSticky) {
                    // Абсолютное позиционирование в конце секции
                    productInfo.classList.add('absolute');
                }
                // В остальных случаях - статическое позиционирование (по умолчанию)
            }
            
            // Оптимизация производительности
            let ticking = false;
            function onScroll() {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updateProductInfoPosition();
                        ticking = false;
                    });
                    ticking = true;
                }
            }
            
            // Слушатели событий
            window.addEventListener('scroll', onScroll);
            window.addEventListener('resize', onScroll);
            
            // Инициализация
            updateProductInfoPosition();
        });

// === FAQ Accordion Functionality ===
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq_item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq_question');
        const answer = item.querySelector('.faq_answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключаем текущий элемент
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
});
// === Конец FAQ Accordion Functionality ===