beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="columns-test" class="columns block" data-block-name="columns" data-block-status="loading">
                                       <div>
                                         <div><p>1,1</p></div>
                                         <div><p>1,2</p></div>
                                         <div><p>1,3</p></div>
                                       </div>
                                       <div>
                                         <div><p>2,1</p></div>
                                         <div><p>2,2</p></div>
                                         <div><p>2,3</p></div>
                                       </div>
                                       <div>
                                         <div><p>3,1</p></div>
                                         <div><p>3,2</p></div>
                                         <div><p>3,3</p></div>
                                       </div>
                                     </div>`;
});

test('decorates correctly columns block', () => {
  const block = document.getElementById('columns-test');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  expect(block.classList.toString()).toContain('columns-3-cols');

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      expect(pic).toBeNull();
    });
  });
});
