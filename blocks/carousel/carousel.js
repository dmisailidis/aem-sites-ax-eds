function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

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
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');

  let realSlideIndex = slideIndex;

  // Handle boundary conditions
  if (slideIndex < 0) {
    realSlideIndex = slides.length - 1;
  } else if (slideIndex >= slides.length) {
    realSlideIndex = 0;
  }

  const activeSlide = slides[realSlideIndex];

  if (activeSlide) {
    // Update active slide in the dataset
    block.dataset.activeSlide = realSlideIndex;

    // Update ARIA states
    slides.forEach((slide, idx) => {
      slide.setAttribute('aria-hidden', idx !== realSlideIndex);
    });

    // Update button states
    const indicators = block.querySelectorAll('.carousel-slide-indicator button');
    indicators.forEach((button, idx) => {
      if (idx !== realSlideIndex) {
        button.removeAttribute('disabled');
      } else {
        button.setAttribute('disabled', 'true');
      }
    });

    activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
    const slidesContainer = block.querySelector('.carousel-slides');
    if (slidesContainer) {
      slidesContainer.scrollTo({
        top: 0,
        left: activeSlide.offsetLeft,
        behavior: 'smooth',
      });
    }
  }
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) {
    return;
  }

  const indicatorButtons = slideIndicators.querySelectorAll('button');
  indicatorButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      const targetSlide = parseInt(slideIndicator.dataset.targetSlide, 10);
      showSlide(block, targetSlide);
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide + 1);
    });
  }

  // Add observer for automatic slide detection
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const slidesToObserve = block.querySelectorAll('.carousel-slide');
  slidesToObserve.forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  // Check if this is a carousel-item component
  const isCarouselItem = row.dataset && (
    row.dataset.aueModel === 'carousel-item'
    || row.classList.contains('carousel-item')
  );

  // Process differently based on if it's a carousel item or direct content
  if (isCarouselItem) {
    // For carousel items, we need to get the image and content sections
    const imageColumn = row.querySelector('[data-aue-prop="image"], .carousel-slide-image');
    const titleColumn = row.querySelector('[data-aue-prop="title"], .carousel-slide-title');
    const contentColumn = row.querySelector('[data-aue-prop="text"], .carousel-slide-content');
    const buttonTextColumn = row.querySelector('[data-aue-prop="buttonText"], .carousel-slide-button-text');
    const buttonLinkColumn = row.querySelector('[data-aue-prop="buttonLink"], .carousel-slide-button-link');

    // Create a container for the content to position it above the image
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('carousel-slide-content-container');

    // Add title if present
    if (titleColumn && titleColumn.textContent.trim()) {
      const titleElement = document.createElement('div');
      titleElement.classList.add('carousel-slide-title');
      titleElement.innerHTML = `<h2>${titleColumn.textContent.trim()}</h2>`;
      contentContainer.appendChild(titleElement);
    }

    // Add content text
    if (contentColumn) {
      contentColumn.classList.add('carousel-slide-content');
      contentContainer.appendChild(contentColumn);
    } else {
      // Create empty content column if none exists
      const emptyContent = document.createElement('div');
      emptyContent.classList.add('carousel-slide-content');
      contentContainer.appendChild(emptyContent);
    }

    // Add button if both text and link are present
    if (buttonTextColumn && buttonLinkColumn && buttonTextColumn.textContent
      && buttonLinkColumn.textContent) {
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('carousel-slide-button');

      const link = document.createElement('a');
      link.href = buttonLinkColumn.textContent.trim();
      link.textContent = buttonTextColumn.textContent.trim();

      buttonElement.appendChild(link);
      contentContainer.appendChild(buttonElement);
    }

    slide.appendChild(contentContainer);

    if (imageColumn) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('carousel-slide-image');
      imageWrapper.appendChild(imageColumn);
      slide.appendChild(imageWrapper);
    } else {
      // Create empty image column if none exists
      const emptyImage = document.createElement('div');
      emptyImage.classList.add('carousel-slide-image');
      slide.appendChild(emptyImage);
    }
  } else {
    // For direct content, process the columns as before
    const columns = row.querySelectorAll(':scope > div');

    // Create a container for the content
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('carousel-slide-content-container');

    columns.forEach((column, colIdx) => {
      if (colIdx === 0) {
        // Image column
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('carousel-slide-image');
        imageWrapper.appendChild(column);
        slide.appendChild(imageWrapper);
      } else {
        // Content column
        column.classList.add('carousel-slide-content');
        contentContainer.appendChild(column);
      }
    });

    slide.prepend(contentContainer);
  }

  // Set aria-labelledby if there's a heading
  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy && labeledBy.getAttribute('id')) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  // Skip if this block is set to display:none (likely a duplicated carousel)
  if (block.style.display === 'none') {
    return;
  }

  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);

  // Only process direct carousel items - don't look for orphaned ones
  // This fixes the duplication issue
  const carouselItems = [...block.querySelectorAll(':scope > div[data-aue-model="carousel-item"]')];

  // If no carousel items found, fall back to direct children divs
  const rows = carouselItems.length > 0 ? carouselItems : [...block.querySelectorAll(':scope > div')];

  const isSingleSlide = rows.length < 2;
  const placeholders = '';

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
        <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"><span class="icon-left-open-big"></span></button>
        <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"><span class="icon-right-open-big"></span></button>
      `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }

    // Keep the carousel item components but hide them
    // This preserves their structure for AEM editing
    if (row.dataset && row.dataset.aueModel === 'carousel-item') {
      // Instead of removing, hide the original components to maintain editor structure
      row.style.display = 'none';
    } else {
      // For non-carousel items, remove them as they've been incorporated into slides
      row.remove();
    }
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  // Set active slide
  block.dataset.activeSlide = 0;
}
