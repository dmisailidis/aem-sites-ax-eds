beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="author-info-wrapper-test" class="author-info block" data-block-name="author-info" data-block-status="loading">
                                        <div>
                                            <img src="https://example.com/author.jpg" alt="Author Image" />
                                        </div>
                                        <div>
                                          <div><p>Author Name</p></div>
                                          <div><p>Author Bio</p></div>
                                        </div>
                                      </div>`;
});
test('decorates correctly author-info block', () => {
  const block = document.getElementById('author-info-wrapper-test');

  // Check if the block has the correct class
  expect(block.classList.contains('author-info')).toBe(true);

  // Check if the image is present
  const img = block.querySelector('img');
  expect(img).not.toBeNull();
  expect(img.src).toBe('https://example.com/author.jpg');
  expect(img.alt).toBe('Author Image');

  // Check if the author name and bio are present
  const authorName = block.querySelector('div > div:nth-child(1) > p');
  const authorBio = block.querySelector('div > div:nth-child(2) > p');
  expect(authorName.textContent).toBe('Author Name');
  expect(authorBio.textContent).toBe('Author Bio');
});

test('decorates correctly author-info block with no image', () => {
  // Set up the mocked HTML block without an image
  document.body.innerHTML = `<div id="author-info-wrapper-test-no-image" class="author-info block" data-block-name="author-info" data-block-status="loading">
                                        <div>
                                          <div><p>Author Name</p></div>
                                          <div><p>Author Bio</p></div>
                                        </div>
                                      </div>`;
  const block = document.getElementById('author-info-wrapper-test-no-image');

  // Check if the block has the correct class
  expect(block.classList.contains('author-info')).toBe(true);

  // Check if the image is absent
  const img = block.querySelector('img');
  expect(img).toBeNull();

  // Check if the author name and bio are present
  const authorName = block.querySelector('div > div:nth-child(1) > p');
  const authorBio = block.querySelector('div > div:nth-child(2) > p');
  expect(authorName.textContent).toBe('Author Name');
  expect(authorBio.textContent).toBe('Author Bio');
});