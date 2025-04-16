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
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  if (activeSlide) {
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

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
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
    const contentColumn = row.querySelector('[data-aue-prop="text"], .carousel-slide-content');

    if (imageColumn) {
      imageColumn.classList.add('carousel-slide-image');
      slide.append(imageColumn);
    } else {
      // Create empty image column if none exists
      const emptyImage = document.createElement('div');
      emptyImage.classList.add('carousel-slide-image');
      slide.append(emptyImage);
    }

    if (contentColumn) {
      contentColumn.classList.add('carousel-slide-content');
      slide.append(contentColumn);
    } else {
      // Create empty content column if none exists
      const emptyContent = document.createElement('div');
      emptyContent.classList.add('carousel-slide-content');
      slide.append(emptyContent);
    }
  } else {
    // For direct content, process the columns as before
    const columns = row.querySelectorAll(':scope > div');

    columns.forEach((column, colIdx) => {
      column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
      slide.append(column);
    });
  }

  // Set aria-labelledby if there's a heading
  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

/**
 * Find all carousel items in the document that aren't already part of a carousel
 * This handles the AEM author case where carousel items are separate components
 * @returns {Array} Array of carousel item elements
 */
function findOrphanedCarouselItems() {
  // Find all carousel-item components
  const allCarouselItems = document.querySelectorAll('[data-aue-model="carousel-item"]');
  const orphanedItems = [];

  allCarouselItems.forEach((item) => {
    // Check if this item is not already inside a carousel
    if (!item.closest('.carousel-slide')) {
      orphanedItems.push(item);
    }
  });

  return orphanedItems;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);

  // First, find all direct child rows of this carousel
  const rows = [...block.querySelectorAll(':scope > div')];

  // Now look for orphaned carousel items that should be part of this carousel
  const orphanedItems = findOrphanedCarouselItems();

  // Add orphaned items to rows if they exist and are related to this carousel
  // For AEM, we need to check if they're children of this carousel's block
  orphanedItems.forEach((item) => {
    // Only add items that appear to belong to this carousel
    // This check varies based on your AEM structure, but looking at parent blocks is common
    const itemResource = item.dataset.aueResource || '';
    const blockResource = block.dataset.aueResource || '';

    // Check if the item resource path suggests it's a child of this block
    if (itemResource.includes(blockResource) || itemResource.includes(`${blockResource}/item`)) {
      rows.push(item);
    }
  });

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
        <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
        <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
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

    // Don't remove orphaned carousel items - they might be displayed elsewhere
    // In the AEM editor, removing them could cause issues
    if (!row.dataset || !row.dataset.aueModel) {
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

  // If there are display:none carousels that were created by AEM editor
  // as part of adding carousel items, we can hide them now
  const orphanedCarousels = document.querySelectorAll('.carousel[style*="display: none"]');
  orphanedCarousels.forEach((carousel) => {
    // Only hide if it appears to be a duplicated carousel item container
    const hasCarouselItems = carousel.querySelector('[data-aue-model="carousel-item"]');
    if (hasCarouselItems) {
      carousel.style.display = 'none';
    }
  });
}
