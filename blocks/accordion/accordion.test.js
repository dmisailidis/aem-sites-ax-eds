beforeEach(() => {
    document.body.innerHTML = `<div class ="accordion-wrapper">
                                    <div class ="accordion plus-minus block">
                                        <div>
                                           <details class="accordion-item">
                                                <summary class="accordion-title-label">
                                                    <h3>Title 1</h3>
                                                    <button class = "accordion-button icon-plus" aria-expanded="false"></button>
                                                </summary>
                                                <div class = "accordion-item-body">
                                                    <div>
                                                        <h4>Content 1</h4>
                                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                                    </div>
                                                </div>
                                           </details>
                                        </div>
                                    </div>
                               </div>

                               <div class ="accordion-wrapper">
                                  <div class ="accordion plus-minus block">
                                     <div>
                                      <details class="accordion-item">
                                           <summary class="accordion-title-label">
                                               <h3>Title 1</h3>
                                               <button class = "accordion-button icon-down-open-big" aria-expanded="false"></button>
                                           </summary>
                                           <div class = "accordion-item-body">
                                               <div>
                                                   <h4>Content 1</h4>
                                                   <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                               </div>
                                           </div>
                                      </details>
                                     </div>
                                  </div>
                               </div>

                               <div class ="accordion-wrapper">
                                  <div class ="accordion plus-minus block">
                                     <div>
                                          <details class="accordion-item">
                                               <summary class="accordion-title-label">
                                                   <h3></h3>
                                                   <button class = "accordion-button icon-down-open-big" aria-expanded="false"></button>
                                               </summary>
                                               <div class="accordion-item-body">
                                                   <p></p>
                                               </div>
                                          </details>
                                     </div>
                                  </div>
                               </div>
                               `;
});

test('Verifica struttura generale degli accordion', () => {
  // get all accordion wrappers
  const accordions = document.querySelectorAll('.accordion-wrapper');
  expect(accordions.length).toBe(3);

  // check if the first accordion is present
  const firstAccordion = accordions[0];
  expect(firstAccordion.querySelector('.accordion-title-label h3').textContent).toBe('Title 1');
  expect(firstAccordion.querySelector('.accordion-button').classList.contains('icon-plus')).toBe(true);
  expect(firstAccordion.querySelector('.accordion-item-body h4').textContent).toBe('Content 1');
  expect(firstAccordion.querySelector('.accordion-item-body p')).not.toBeNull();

  // check if the second accordion is present with different icon
  const secondAccordion = accordions[1];
  expect(secondAccordion.querySelector('.accordion-title-label h3').textContent).toBe('Title 1');
  expect(secondAccordion.querySelector('.accordion-button').classList.contains('icon-down-open-big')).toBe(true);
  expect(secondAccordion.querySelector('.accordion-item-body h4').textContent).toBe('Content 1');
  expect(secondAccordion.querySelector('.accordion-item-body p')).not.toBeNull();

  // check if the third accordion is present with empty title and content
  const thirdAccordion = accordions[2];
  expect(thirdAccordion.querySelector('.accordion-title-label h3').textContent).toBe('');
  expect(thirdAccordion.querySelector('.accordion-item-body p').textContent).toBe('');
});

test('Verifica differenze tra icone e funzionalità degli accordion', () => {
  const accordions = document.querySelectorAll('.accordion-wrapper');

  // check different icons
  expect(accordions[0].querySelector('.accordion-button').classList.contains('icon-plus')).toBe(true);
  expect(accordions[1].querySelector('.accordion-button').classList.contains('icon-down-open-big')).toBe(true);

  // check aria-expanded
  expect(accordions[0].querySelector('.accordion-button').getAttribute('aria-expanded')).toBe('false');
  expect(accordions[1].querySelector('.accordion-button').getAttribute('aria-expanded')).toBe('false');

  // check summary and details elements
  expect(accordions[0].querySelector('details')).not.toBeNull();
  expect(accordions[0].querySelector('summary')).not.toBeNull();
  expect(accordions[1].querySelector('details')).not.toBeNull();
  expect(accordions[1].querySelector('summary')).not.toBeNull();
});