beforeEach(() => {
    document.body.innerHTML = `<div class = "section icon-button-container" data-section-status="loaded" style>
                                    <div class="icon-button-wrapper">
                                        <div class = "icon-button block">
                                            <button>
                                                <a href="https://www.example.com">Text</a>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="icon-button-wrapper">
                                        <div class = "icon-button icon-button-secondary-outline block">
                                            <button>
                                                <a href="https://www.example.com">Text</a>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="icon-button-wrapper">
                                        <div class = "icon-button icon-button-secondary block">
                                            <button>
                                                <p class="icon-instagram">
                                                    ::before
                                                    "text"
                                                </p>
                                            </button>
                                        </div>
                                    </div>
                                </div>`;
});

// check if there is the tag "a" for the first two buttons
test('Icon Button should have a tag "a"', () => {
    const wrappers = document.querySelectorAll('.icon-button-wrapper');
    expect(wrappers[0].querySelector('a')).not.toBeNull();
    expect(wrappers[1].querySelector('a')).not.toBeNull();
});

//check if there is an icon in the button
test('Icon Button should have an icon', () => {
    const wrappers = document.querySelectorAll('.icon-button-wrapper');
    const iconElement = wrappers[2].querySelector('p[class^="icon-"]');
    expect(iconElement).not.toBeNull();
});

// check if there is at least one button with class secondary-outline
test('Icon Button should have at least one button with class secondary-outline', () => {
    const buttonWithSecondaryOutline = document.querySelector('.icon-button-secondary-outline');
    expect(buttonWithSecondaryOutline).not.toBeNull();
});
