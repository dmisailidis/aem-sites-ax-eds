function updateActiveSlide(slide) {
  console.log('updateActiveSlide called with slide:', slide);
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  console.log(`Updating active slide: ${slideIndex} of ${slides.length} slides`);

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
  console.log('showSlide called with slideIndex:', slideIndex);
  const slides = block.querySelectorAll('.carousel-slide');
  console.log(`Found ${slides.length} slides for showing`);
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  console.log('Calculated realSlideIndex:', realSlideIndex);
  const activeSlide = slides[realSlideIndex];

  if (activeSlide) {
    activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
    const slidesContainer = block.querySelector('.carousel-slides');
    if (slidesContainer) {
      console.log(`Scrolling to slide ${realSlideIndex} at offset:`, activeSlide.offsetLeft);
      slidesContainer.scrollTo({
        top: 0,
        left: activeSlide.offsetLeft,
        behavior: 'smooth',
      });
    }
  }
}

function bindEvents(block) {
  console.log('bindEvents called for carousel');
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) {
    console.warn('No slide indicators found');
    return;
  }

  const indicatorButtons = slideIndicators.querySelectorAll('button');
  console.log(`Found ${indicatorButtons.length} indicator buttons`);
  indicatorButtons.forEach((button, idx) => {
    console.log(`Setting up click handler for indicator button ${idx}`);
    button.addEventListener('click', (e) => {
      console.log(`Indicator button ${idx} clicked`);
      const slideIndicator = e.currentTarget.parentElement;
      const targetSlide = parseInt(slideIndicator.dataset.targetSlide, 10);
      showSlide(block, targetSlide);
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  console.log('Navigation buttons found:', !!prevButton, !!nextButton);

  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      console.log('Previous button clicked');
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      console.log('Next button clicked');
      e.preventDefault();
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log('Slide observed intersecting:', entry.target.dataset.slideIndex);
        updateActiveSlide(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const slidesToObserve = block.querySelectorAll('.carousel-slide');
  console.log(`Setting up observer for ${slidesToObserve.length} slides`);
  slidesToObserve.forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  console.log(`Creating slide ${slideIndex} from row:`, row);
  console.log('Row HTML:', row.outerHTML);
  console.log('Row data attributes:', row.dataset);

  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  // Check if this is a carousel-item component
  const isCarouselItem = row.dataset && (
    row.dataset.aueModel === 'carousel-item'
    || row.classList.contains('carousel-item')
  );

  console.log(`Row is a carousel item: ${isCarouselItem}`);

  // Process differently based on if it's a carousel item or direct content
  if (isCarouselItem) {
    // For carousel items, we need to get the image and content sections
    const imageColumn = row.querySelector('[data-aue-prop="image"], .carousel-slide-image');
    const contentColumn = row.querySelector('[data-aue-prop="text"], .carousel-slide-content');

    console.log('Found image column:', !!imageColumn);
    console.log('Found content column:', !!contentColumn);

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
    console.log(`Found ${columns.length} columns in direct content row`);

    columns.forEach((column, colIdx) => {
      console.log(`Processing column ${colIdx}`);
      column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
      slide.append(column);
    });
  }

  console.log(`Slide ${slideIndex} created:`, slide);
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
  console.log(`Found ${allCarouselItems.length} total carousel-item components`);

  const orphanedItems = [];

  allCarouselItems.forEach((item, index) => {
    // Check if this item is not already inside a carousel
    const isInsideCarouselSlide = !!item.closest('.carousel-slide');
    console.log(`Carousel item #${index} inside carousel slide: ${isInsideCarouselSlide}`);
    console.log(`Carousel item #${index} resource:`, item.dataset.aueResource);

    if (!isInsideCarouselSlide) {
      orphanedItems.push(item);
    }
  });

  console.log(`Found ${orphanedItems.length} orphaned carousel items`);
  return orphanedItems;
}

// Track which elements we've processed to avoid duplicates
const processedElements = new WeakSet();

let carouselId = 0;
export default async function decorate(block) {
  console.log('======= CAROUSEL DECORATE START =======');
  console.log('Decorating carousel block:', block);
  console.log('Block HTML before processing:', block.innerHTML);
  console.log('Block data attributes:', block.dataset);

  // Skip if this block is set to display:none (likely a duplicated carousel)
  if (block.style.display === 'none') {
    console.log('Skipping carousel with display:none');
    return;
  }

  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  console.log(`Set carousel ID: ${carouselId}`);

  // First, find all direct child rows of this carousel
  const directRows = [...block.querySelectorAll(':scope > div')];
  console.log(`Found ${directRows.length} direct rows in carousel`);
  directRows.forEach((row, i) => {
    console.log(`Direct row #${i} HTML:`, row.outerHTML);
  });

  // Filter out rows we've already processed to avoid duplicates
  const rows = directRows.filter((row) => !processedElements.has(row));
  console.log(`After filtering, working with ${rows.length} unprocessed rows`);

  // Now look for orphaned carousel items that should be part of this carousel
  const orphanedItems = findOrphanedCarouselItems();

  // Add orphaned items to rows if they exist and are related to this carousel
  const addedOrphanedItems = [];

  orphanedItems.forEach((item, index) => {
    // Skip items we've already processed
    if (processedElements.has(item)) {
      console.log(`Skipping already processed orphaned item #${index}`);
      return;
    }

    // Only add items that appear to belong to this carousel
    const itemResource = item.dataset.aueResource || '';
    const blockResource = block.dataset.aueResource || '';

    console.log(`Checking if orphaned item #${index} belongs to this carousel:`);
    console.log('  Item resource:', itemResource);
    console.log('  Block resource:', blockResource);

    // Check if the item resource path suggests it's a child of this block
    const isChild = itemResource.includes(blockResource)
                   || itemResource.includes(`${blockResource}/item`);

    console.log(`  Is child of this carousel: ${isChild}`);

    if (isChild) {
      rows.push(item);
      addedOrphanedItems.push(item);
      // Mark as processed to avoid duplicates
      processedElements.add(item);
    }
  });

  console.log(`Added ${addedOrphanedItems.length} orphaned items to this carousel`);
  console.log(`Final row count for carousel #${carouselId}: ${rows.length}`);

  const isSingleSlide = rows.length < 2;
  console.log(`Is single slide carousel: ${isSingleSlide}`);

  const placeholders = '';

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    console.log('Creating navigation for multi-slide carousel');
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

  console.log('Processing rows to create slides');
  rows.forEach((row, idx) => {
    console.log(`Processing row #${idx}`);
    // Mark as processed to avoid duplicates
    processedElements.add(row);

    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      console.log(`Creating indicator for slide #${idx}`);
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }

    // Don't remove orphaned carousel items - they might be displayed elsewhere
    // In the AEM editor, removing them could cause issues
    if (!row.dataset || !row.dataset.aueModel) {
      console.log(`Removing original row #${idx}`);
      row.remove();
    }
  });

  container.append(slidesWrapper);
  block.prepend(container);

  console.log('Block HTML after processing:');
  console.log(block.innerHTML);

  if (!isSingleSlide) {
    console.log('Binding events for multi-slide carousel');
    bindEvents(block);
  }

  // Set active slide
  block.dataset.activeSlide = 0;

  // Hide any duplicate carousels created by AEM
  const orphanedCarousels = document.querySelectorAll('.carousel[style*="display: none"]');
  console.log(`Found ${orphanedCarousels.length} orphaned carousels`);

  orphanedCarousels.forEach((carousel, index) => {
    console.log(`Checking orphaned carousel #${index}`);
    // Only hide if it appears to be a duplicated carousel item container
    const hasCarouselItems = carousel.querySelector('[data-aue-model="carousel-item"]');
    console.log(`  Has carousel items: ${!!hasCarouselItems}`);

    if (hasCarouselItems) {
      console.log(`  Ensuring orphaned carousel #${index} stays hidden`);
      carousel.style.display = 'none';
    }
  });

  console.log('======= CAROUSEL DECORATE COMPLETE =======');
}
