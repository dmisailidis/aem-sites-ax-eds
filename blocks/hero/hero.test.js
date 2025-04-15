beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="hero-test" class="hero block" data-block-name="hero" data-block-status="loaded">
                                       <div>
                                         <div>
                                           <picture>
                                             <source type="image/webp" srcset="./media_19b2a5db34e3791a6a89d2397a6608af941dbad9e.jpeg?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
                                             <source type="image/webp" srcset="./media_19b2a5db34e3791a6a89d2397a6608af941dbad9e.jpeg?width=750&amp;format=webply&amp;optimize=medium">
                                             <source type="image/jpeg" srcset="./media_19b2a5db34e3791a6a89d2397a6608af941dbad9e.jpeg?width=2000&amp;format=jpeg&amp;optimize=medium" media="(min-width: 600px)">
                                             <img loading="eager" alt="" src="./media_19b2a5db34e3791a6a89d2397a6608af941dbad9e.jpeg?width=750&amp;format=jpeg&amp;optimize=medium" width="1200" height="800">
                                           </picture>
                                         </div>
                                       </div>
                                       <div>
                                         <div>
                                           <h1 id="deloitte-digital-2025">Deloitte Digital 2025</h1>
                                         </div>
                                       </div>
                                     </div>`;
});

test('decorates correctly hero block', () => {
  const block = document.getElementById('hero-test');

  const [imgDiv, textDiv] = [...block.children];

  const picture = imgDiv.querySelector('picture');
  expect(picture).not.toBeNull();
  const img = picture.querySelector('img');
  expect(img.src).toContain('media_19b2a5db34e3791a6a89d2397a6608af941dbad9e.jpeg?width=750&format=jpeg&optimize=medium');

  const text = textDiv.querySelector('h1');
  expect(text).not.toBeNull();
  expect(text.innerHTML).toBe('Deloitte Digital 2025');
});
