beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="pdf-viewer-test" class="pdf-viewer block" data-block-name="pdf-viewer" data-block-status="loading">
                                       <div>
                                         <div><p class="button-container"><a href="/content/dam/aem-sites-ax-eds/lorem-ipsum.pdf" title="/content/dam/aem-sites-ax-eds/Lorem_ipsum.pdf" class="button">/content/dam/aem-sites-ax-eds/Lorem_ipsum.pdf</a></p></div>
                                       </div>
                                       <div>
                                         <div><p>SIZED_CONTAINER</p></div>
                                       </div>
                                     </div>`;
});

test('decorates correctly pdf viewer block', () => {
  const block = document.getElementById('pdf-viewer-test');

  const [fileDiv, typeDiv] = [...block.children];

  const filePath = fileDiv.querySelector('p');
  expect(filePath).not.toBeNull();
  const fileHref = filePath.querySelector('a');
  expect(fileHref.innerHTML).toBe('/content/dam/aem-sites-ax-eds/Lorem_ipsum.pdf');

  const type = typeDiv.querySelector('p');
  expect(type).not.toBeNull();
  expect(type.innerHTML).toBe('SIZED_CONTAINER');
});
