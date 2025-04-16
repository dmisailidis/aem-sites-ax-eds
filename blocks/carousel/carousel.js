function updateActiveSlide(slide) {
  console.log('updateActiveSlide called with slide:', slide);
  const block = slide.closest('.carousel');
  console.log('Found parent block:', block);
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  console.log('Slide index:', slideIndex);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  console.log('Found slides:', slides.length);

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  console.log('Found indicators:', indicators.length);
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  console.log('showSlide called with block:', block, 'slideIndex:', slideIndex);
  const slides = block.querySelectorAll('.carousel-slide');
  console.log('Found slides for showing:', slides.length);
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  console.log('Calculated realSlideIndex:', realSlideIndex);
  const activeSlide = slides[realSlideIndex];
  console.log('Active slide:', activeSlide);

  if (activeSlide) {
    activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
    const slidesContainer = block.querySelector('.carousel-slides');
    console.log('Slides container:', slidesContainer);
    if (slidesContainer) {
      console.log('Scrolling to offset:', activeSlide.offsetLeft);
      slidesContainer.scrollTo({
        top: 0,
        left: activeSlide.offsetLeft,
        behavior: 'smooth',
      });
    } else {
      console.warn('No slides container found');
    }
  } else {
    console.warn('No active slide found');
  }
}

function bindEvents(block) {
  console.log('bindEvents called with block:', block);
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  console.log('Slide indicators:', slideIndicators);
  if (!slideIndicators) {
    console.warn('No slide indicators found, returning early');
    return;
  }

  const indicatorButtons = slideIndicators.querySelectorAll('button');
  console.log('Indicator buttons found:', indicatorButtons.length);
  indicatorButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      console.log('Indicator button clicked');
      const slideIndicator = e.currentTarget.parentElement;
      const targetSlide = parseInt(slideIndicator.dataset.targetSlide, 10);
      console.log('Targeting slide:', targetSlide);
      showSlide(block, targetSlide);
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  console.log('Navigation buttons:', { prev: prevButton, next: nextButton });

  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      console.log('Previous slide button clicked');
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      console.log('Current slide:', currentSlide, 'Moving to:', currentSlide - 1);
      showSlide(block, currentSlide - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      console.log('Next slide button clicked');
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      console.log('Current slide:', currentSlide, 'Moving to:', currentSlide + 1);
      showSlide(block, currentSlide + 1);
    });
  }

  console.log('Setting up IntersectionObserver for slides');
  const slideObserver = new IntersectionObserver((entries) => {
    console.log('IntersectionObserver triggered with entries:', entries.length);
    entries.forEach((entry) => {
      console.log('Entry is intersecting:', entry.isIntersecting, 'Target:', entry.target);
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  const slidesToObserve = block.querySelectorAll('.carousel-slide');
  console.log('Slides to observe:', slidesToObserve.length);
  slidesToObserve.forEach((slide) => {
    console.log('Observing slide:', slide);
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  console.log('createSlide called with row:', row, 'slideIndex:', slideIndex, 'carouselId:', carouselId);
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');
  console.log('Created slide element:', slide);

  const columns = row.querySelectorAll(':scope > div');
  console.log('Found columns in row:', columns.length);

  columns.forEach((column, colIdx) => {
    console.log('Processing column:', colIdx);
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  console.log('Found heading for aria-labelledby:', labeledBy);
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  console.log('Carousel decorate function starting with block:', block);
  console.log('Block HTML before processing:', block.innerHTML);

  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  console.log('Set carousel ID:', carouselId);

  const rows = block.querySelectorAll(':scope > div');
  console.log('Found rows:', rows.length);
  console.log('Rows content:', [...rows].map((row) => row.innerHTML));

  const isSingleSlide = rows.length < 2;
  console.log('Is single slide:', isSingleSlide);

  const placeholders = '';

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');
  console.log('Created container:', container);

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  console.log('Created slidesWrapper:', slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    console.log('Creating indicators for multi-slide carousel');
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    console.log('Appending indicators nav to block');
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
        <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
        <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
      `;
    console.log('Created navigation buttons:', slideNavButtons);

    container.append(slideNavButtons);
  }

  console.log('Processing rows to create slides');
  rows.forEach((row, idx) => {
    console.log('Processing row:', idx);
    const slide = createSlide(row, idx, carouselId);
    console.log('Created slide:', slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      console.log('Creating indicator for slide:', idx);
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    console.log('Removing original row');
    row.remove();
  });

  console.log('Appending slidesWrapper to container');
  container.append(slidesWrapper);
  console.log('Prepending container to block');
  block.prepend(container);

  console.log('Block HTML after processing:', block.innerHTML);

  if (!isSingleSlide) {
    console.log('Binding events for multi-slide carousel');
    bindEvents(block);
  }
  console.log('Carousel decorate function completed');
}
