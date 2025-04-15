beforeEach(() => {
    document.body.innerHTML = `<div class="carousel-wrapper">
                                    <div class="carousel block" id="carousel-1">
                                        <div>
                                            <div>
                                                <button class="slide-prev">
                                                </button>
                                                <button class="slide-next">
                                                </button>
                                            </div>
                                            <ul class="carousel-slides">
                                                <li data-slid-index="0" class="carousel-slide" id="carousel-1-slide-0">
                                                    <div class="carousel-slide-image">
                                                        <picture>
                                                            <img src="https://example.com/image1.jpg" alt="Image 1">
                                                        </picture>
                                                    </div>
                                                    <div class="carousel-slide-content">
                                                        <div>
                                                            <h3>Slide 1</h3>
                                                            <p>Description for slide 1.</p>
                                                            <ul>
                                                                <li>
                                                                    <a href="https://example.com/slide1" target="_blank">Link 1</a>
                                                                </li>
                                                                <li>
                                                                    <a href="https://example.com/slide2" target="_blank">Link 2</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li data-slid-index="1" class="carousel-slide" id="carousel-1-slide-1">
                                                    <div class="carousel-slide-image">
                                                        <picture>
                                                            <img src="https://example.com/image2.jpg" alt="Image 2">
                                                        </picture>
                                                    </div>
                                                    <div class="carousel-slide-content">
                                                        <div>
                                                            <h3>Slide 2</h3>
                                                            <p>Description for slide 2.</p>
                                                            <ul>
                                                                <li>
                                                                    <a href="https://example.com/slide3" target="_blank">Link 3</a>
                                                                </li>
                                                                <li>
                                                                    <a href="https://example.com/slide4" target="_blank">Link 4</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li data-slid-index="2" class="carousel-slide" id="carousel-1-slide-2">
                                                    <div class="carousel-slide-image">
                                                        <picture>
                                                            <img src="https://example.com/image3.jpg" alt="Image 3">
                                                        </picture>
                                                    </div>
                                                    <div class="carousel-slide-content">
                                                        <div>
                                                            <h3>Slide 3</h3>
                                                            <p>Description for slide 3.</p>
                                                            <ul>
                                                                <li>
                                                                    <a href="https://example.com/slide5" target="_blank">Link 5</a>
                                                                </li>
                                                                <li>
                                                                    <a href="https://example.com/slide6" target="_blank">Link 6</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>`;
})