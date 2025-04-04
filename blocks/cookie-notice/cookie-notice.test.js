beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="cookie-notice-test" class="cookie-notice block" data-block-name="cookie-notice" data-block-status="loading">
                                <div>
                                  <div><p>This is a cookie notice. <a href="/blocks/cookie-notice" title="Read more.">Read more.</a></p></div>
                                </div>
                                <div>
                                  <div><p>Accept</p></div>
                                </div>
                                <div>
                                  <div><p>2.0</p></div>
                                </div>
                              </div>`;
});

test('decorates correctly cookie notice block', () => {
  const block = document.getElementById('cookie-notice-test');

  const [textDiv, buttonDiv, versionDiv] = [...block.children];

  const text = textDiv.querySelector('p');
  expect(text).not.toBeNull();
  expect(text.innerHTML).toBe('This is a cookie notice. <a href="/blocks/cookie-notice" title="Read more.">Read more.</a>');

  const btn = buttonDiv.querySelector('p');
  expect(btn).not.toBeNull();
  expect(btn.innerHTML).toBe('Accept');

  const version = versionDiv.querySelector('p');
  expect(version).not.toBeNull();
  expect(version.innerHTML).toBe('2.0');
});

test('handles missing version gracefully', () => {
  document.body.innerHTML = `<div id="cookie-notice-test" class="cookie-notice block" data-block-name="cookie-notice" data-block-status="loading">
                                  <div>
                                    <div><p>This is a cookie notice. <a href="/blocks/cookie-notice" title="Read more.">Read more.</a></p></div>
                                  </div>
                                  <div>
                                    <div><p>Accept</p></div>
                                  </div>
                                </div>`;

  const block = document.getElementById('cookie-notice-test');

  const [textDiv, buttonDiv, versionDiv] = [...block.children];

  const text = textDiv.querySelector('p');
  expect(text).not.toBeNull();
  expect(text.innerHTML).toBe('This is a cookie notice. <a href="/blocks/cookie-notice" title="Read more.">Read more.</a>');

  const btn = buttonDiv.querySelector('p');
  expect(btn).not.toBeNull();
  expect(btn.innerHTML).toBe('Accept');

  expect(versionDiv).toBeUndefined();
});
