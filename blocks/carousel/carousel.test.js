beforeEach(() => {
    document.body.innerHTML = `<div class="carousel-wrapper">
                                    <div class="carousel block" id="carousel-1">
                                        <div>
                                            <div>
                                                <button class="slide-prev">
                                                    <span> ::before </span>
                                                </button>
                                                <button class="slide-next">
                                                    <span> ::before </span>
                                                </button>
                                            </div>
                                            <ul class="carousel-slides">
                                                <li data-slide-index="0" class="carousel-slide" id="carousel-1-slide-0">
                                                    <div>
                                                       <div>
                                                            <h2> Title 1 </h2>
                                                       </div>
                                                        <div class="carousel-slide-content">
                                                            <p>Description for slide 1.</p>
                                                        </div>
                                                        <div>
                                                            <a href="https://example.com/slide1" target="_blank">Link 1</a>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <picture>
                                                            <img src="https://example.com/image1.jpg" alt="Image 1">
                                                        </picture>
                                                    </div>
                                                </li>
                                                <li data-slide-index="1" class="carousel-slide" id="carousel-1-slide-1">
                                                    <div>
                                                       <div>
                                                            <h2> Title 2 </h2>
                                                       </div>
                                                        <div class="carousel-slide-content">
                                                            <p>Description for slide 2.</p>
                                                        </div>
                                                        <div>
                                                            <a href="https://example.com/slide2" target="_blank">Link 2</a>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <picture>
                                                            <img src="https://example.com/image2.jpg" alt="Image 2">
                                                        </picture>
                                                    </div>
                                                </li>
                                                <li data-slide-index="2" class="carousel-slide" id="carousel-1-slide-2">
                                                    <div>
                                                       <div>
                                                            <h2> Title 3 </h2>
                                                       </div>
                                                        <div class="carousel-slide-content">
                                                            <p>Description for slide 3.</p>
                                                        </div>
                                                        <div>
                                                            <a href="https://example.com/slide3" target="_blank">Link 3</a>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <picture>
                                                            <img src="https://example.com/image3.jpg" alt="Image 3">
                                                        </picture>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>`;
})

test('Structural check', () => {
    // check the main carousel element
    const carousel = document.querySelector('.carousel');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevButton = carousel.querySelector('.slide-prev');
    const nextButton = carousel.querySelector('.slide-next');

    // check if the carousel and its elements are present
    expect(carousel).toBeTruthy();
    expect(slides.length).toBe(3);
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();

    // check attributes and classes
    slides.forEach((slide, index) => {
        expect(slide.getAttribute('data-slide-index')).toBe(String(index));
        expect(slide.querySelector('h2')).toBeTruthy();
        expect(slide.querySelector('a')).toBeTruthy();
        expect(slide.querySelector('picture img')).toBeTruthy();
    });
});

test('Add a new slide', () => {
    const carousel = document.querySelector('.carousel');
    const slidesContainer = carousel.querySelector('.carousel-slides');
    const initialSlidesCount = slidesContainer.children.length;

    // create a new slide
    const newSlide = document.createElement('li');
    newSlide.classList.add('carousel-slide');
    newSlide.setAttribute('data-slide-index', '3');
    newSlide.id = 'carousel-1-slide-3';

    // add the html content for the new slide
    newSlide.innerHTML = `
        <div>
            <div><h2>Title 4</h2></div>
            <div class="carousel-slide-content">
                <p>Description for slide 4.</p>
            </div>
            <div>
                <a href="https://example.com/slide4" target="_blank">Link 4</a>
            </div>
        </div>
        <div>
            <picture>
                <img src="https://example.com/image4.jpg" alt="Image 4">
            </picture>
        </div>
    `;

    // add the new slide to the slides container
    slidesContainer.appendChild(newSlide);

    // check if the new slide was added correctly
    expect(slidesContainer.children.length).toBe(initialSlidesCount + 1);
    expect(slidesContainer.lastElementChild).toBe(newSlide);
    expect(slidesContainer.lastElementChild.getAttribute('data-slide-index')).toBe('3');
    expect(slidesContainer.lastElementChild.querySelector('h2').textContent).toContain('Title 4');
    expect(slidesContainer.lastElementChild.querySelector('a').getAttribute('href')).toBe('https://example.com/slide4');

    // check if the image is present
    const newImage = newSlide.querySelector('img');
    expect(newImage.getAttribute('src')).toBe('https://example.com/image4.jpg');
    expect(newImage.getAttribute('alt')).toBe('Image 4');
});