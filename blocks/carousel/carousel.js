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

  const isCarouselItem = row.dataset && (
    row.dataset.aueModel === 'carousel-item'
    || row.classList.contains('carousel-item')
    || row.classList.contains('carousel-slide-content')
    || row.hasAttribute('data-slide-index')
    || !!row.querySelector('.carousel-slide-content')
    || !!row.closest('[data-block-name="carousel"]')
  );

  console.log(`Slide ${slideIndex} isCarouselItem:`, isCarouselItem);

  if (isCarouselItem) {
    // Extract content from the slide
    console.log(`Processing slide ${slideIndex} as carousel item`);

    const imageColumn = row.querySelector('[data-aue-prop="image"], .carousel-slide-image, picture, img');

    // Find text content that might be title, button text, etc.
    const textElements = [...row.querySelectorAll('p, h1, h2, h3, h4, h5, h6, [data-aue-prop]')];

    // Use the first paragraph/heading as title if it's not too long
    let titleColumn = row.querySelector('[data-aue-prop="title"], .carousel-slide-title, h1, h2, h3');
    // If no explicit title found, try to find a short paragraph that could be a title
    if (!titleColumn) {
      titleColumn = textElements.find((el) => el.textContent.trim().length < 100
        && (el.tagName === 'P' || el.tagName.startsWith('H')));
    }

    // Get main content - anything that's not the title, image, or button
    let contentColumn = row.querySelector('[data-aue-prop="text"], .carousel-slide-content');
    if (!contentColumn && textElements.length > 1) {
      // If no explicit content, use paragraphs that aren't the title
      contentColumn = textElements.find((el) => el !== titleColumn);
    }

    // Try to identify button text and link
    const buttonText = row.children[3].children[0].textContent;
    const buttonTextColumn = row.querySelector('[data-aue-prop="buttonText"], .button, a[role="button"], a.button');
    const buttonLinkColumn = buttonTextColumn && buttonTextColumn.tagName === 'A'
      ? buttonTextColumn : row.querySelector('[data-aue-prop="buttonLink"], a');

    // Log what we found for debugging
    console.log(`Slide ${slideIndex} components:`, {
      imageColumn,
      titleColumn: titleColumn ? titleColumn.textContent : null,
      contentColumn: contentColumn ? contentColumn.textContent : null,
      buttonTextColumn: buttonTextColumn ? buttonTextColumn.textContent : null,
      buttonLinkColumn: buttonLinkColumn ? buttonLinkColumn.tagName : null,
    });

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
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('carousel-slide-content');

      // Check if the content already has HTML or is just text
      if (contentColumn.innerHTML.includes('<')) {
        // Clone the content with its structure
        contentWrapper.innerHTML = contentColumn.innerHTML;
      } else {
        // Simple text, create paragraph
        const p = document.createElement('p');
        p.textContent = contentColumn.textContent;
        contentWrapper.appendChild(p);
      }

      contentContainer.appendChild(contentWrapper);
    }

    console.log('Button text columns:', buttonTextColumn);

    // Add button if we found one
    if (buttonTextColumn && buttonLinkColumn) {
      const buttonElement = document.createElement('div');
      buttonElement.classList.add('carousel-slide-button');

      const link = document.createElement('a');

      // If buttonLinkColumn is an anchor, use its href
      if (buttonLinkColumn.tagName === 'A') {
        link.href = buttonLinkColumn.href || '#';
      } else {
        link.href = buttonLinkColumn.textContent.trim() || '#';
      }

      // Use button text from appropriate source
      if (buttonTextColumn.tagName === 'A') {
        link.textContent = buttonText.trim();
      } else {
        link.textContent = buttonText.trim() || 'Learn More';
      }

      link.setAttribute('role', 'button');

      buttonElement.appendChild(link);
      contentContainer.appendChild(buttonElement);
    }

    slide.appendChild(contentContainer);

    // Add image if found
    if (imageColumn) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('carousel-slide-image');

      // If it's already a picture or img element, clone it
      if (imageColumn.tagName === 'PICTURE' || imageColumn.tagName === 'IMG') {
        imageWrapper.appendChild(imageColumn.cloneNode(true));
      } else {
        // Otherwise, try to extract an image from the column
        const image = imageColumn.querySelector('img, picture');
        if (image) {
          imageWrapper.appendChild(image.cloneNode(true));
        } else {
          // Just copy the content as-is if no explicit image found
          imageWrapper.appendChild(imageColumn.cloneNode(true));
        }
      }

      slide.appendChild(imageWrapper);
    } else {
      // Create empty image column if none exists
      const emptyImage = document.createElement('div');
      emptyImage.classList.add('carousel-slide-image');
      slide.appendChild(emptyImage);
    }
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
