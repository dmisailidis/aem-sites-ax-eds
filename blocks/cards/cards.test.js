beforeEach(() => {
    // Set up the mocked HTML block
    document.body.innerHTML = `<div id="cards-test" class="cards block" data-block-name="cards" data-block-status="loading">
                                        <ul>
                                            <li>
                                                <div>
                                                    <picture>
                                                        <source srcset="https://example.com/image1.webp" type="image/webp">
                                                        <img src="https://example.com/image1.jpg" alt="Image 1">
                                                    </picture>
                                                </div>
                                                <div>
                                                    <div>
                                                        <p>Card 1</p>
                                                        <h3>Title 1</h3>
                                                        <p>Subtitle 1</p>
                                                    </div>
                                                 </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <picture>
                                                        <source srcset="https://example.com/image2.webp" type="image/webp">
                                                        <img src="https://example.com/image2.jpg" alt="Image 2">
                                                    </picture>
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <div>
                                                        <p>Card 3</p>
                                                        <h3>Title 3</h3>
                                                        <p>Subtitle 3</p>
                                                    </div>
                                                 </div>
                                            </li>
                                        </ul>`;
});

test('decorates correctly cards block', () => {
    const block = document.getElementById('cards-test');
    const ul = block.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul.tagName).toBe('UL');

    const lis = ul.querySelectorAll('li');
    expect(lis.length).toBe(3);

    // first, image + text
    expect(lis[0].querySelector('picture')).not.toBeNull();
    expect(lis[0].querySelector('h3')).not.toBeNull();

    // second, image only
    expect(lis[1].querySelector('picture')).not.toBeNull();

    // third, text only
    expect(lis[2].querySelector('h3')).not.toBeNull();
});

test('check if second element has image while the third element has text', () => {
  const block = document.getElementById('cards-test');
  const lis = block.querySelectorAll('li');

  // first element
  expect(lis[0].querySelector('picture')).not.toBeNull();
  expect(lis[0].querySelector('h3')).not.toBeNull();
  expect(lis[0].querySelector('h3').textContent).toBe('Title 1');

  // second element
  expect(lis[1].querySelector('picture')).not.toBeNull();
  expect(lis[1].querySelector('h3')).toBeNull();  // Modificato

  // third element
  expect(lis[2].querySelector('picture')).toBeNull();
  expect(lis[2].querySelector('h3')).not.toBeNull();
  expect(lis[2].querySelector('h3').textContent).toBe('Title 3');
});