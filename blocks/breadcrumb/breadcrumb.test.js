beforeEach(() =>{
    document.body.innerHTML = `<div class="breadcrumb-wrapper">
                                    <div>
                                        <nav>
                                            <a href="home" title="Home" class="icon-home"> ::before </a>
                                            <span class="breadcrumb-separator">/</span>
                                            <span>Breadcrumb</span>
                                        </nav>
                                    </div>
                               </div>
                               //option hide current page active
                               <div class="breadcrumb-wrapper">
                                   <div>
                                       <nav>
                                           <a href="home" title="Home" class="icon-home"> ::before </a>
                                       </nav>
                                   </div>
                              </div>
                              //option hide breadcrumb active
                              <div class="breadcrumb-wrapper">
                                  <div>
                                  </div>
                             </div>`;
});

//check if the first breadcrumb is decorated correctly
test('decorates correctly breadcrumb block', () => {
    const block = document.querySelector('.breadcrumb-wrapper');
    // Check if the block has the correct class
    expect(block.classList.contains('breadcrumb-wrapper')).toBe(true);

    // Check if the breadcrumb is present
    const breadcrumb = block.querySelector('nav');
    expect(breadcrumb).not.toBeNull();

    // Check if the breadcrumb items are present
    const items = breadcrumb.querySelectorAll('a, span');
    expect(items.length).toBe(3);

    // Check if the home link is present
    const homeLink = items[0];
    expect(homeLink.href).toContain('home');
    expect(homeLink.title).toBe('Home');

    // Check if the separator is present
    const separator = items[1];
    expect(separator.classList.contains('breadcrumb-separator')).toBe(true);

    // Check if the last item is present
    const lastItem = items[2];
    expect(lastItem.textContent).toBe('Breadcrumb');
  });

//check if the first is okay, if the second has the link to the home page, and the third is empty
test('check different settings', () => {
  // Ottieni tutti i breadcrumb
  const breadcrumbs = document.querySelectorAll('.breadcrumb-wrapper');
  expect(breadcrumbs.length).toBe(3);

  // Verifica primo breadcrumb (completo)
  const firstBreadcrumb = breadcrumbs[0];
  const firstNav = firstBreadcrumb.querySelector('nav');
  expect(firstNav).not.toBeNull();
  expect(firstNav.querySelectorAll('a, span').length).toBe(3);

  // Verifica secondo breadcrumb (solo link home)
  const secondBreadcrumb = breadcrumbs[1];
  const secondNav = secondBreadcrumb.querySelector('nav');
  expect(secondNav).not.toBeNull();
  expect(secondNav.querySelectorAll('a').length).toBe(1);
  expect(secondNav.querySelector('a').classList.contains('icon-home')).toBe(true);
  expect(secondNav.querySelectorAll('span').length).toBe(0);

  // Verifica terzo breadcrumb (vuoto)
  const thirdBreadcrumb = breadcrumbs[2];
  expect(thirdBreadcrumb.querySelector('nav')).toBeNull();
});