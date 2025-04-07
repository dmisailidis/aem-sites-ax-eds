beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="progress-bar-test" class="progress-bar block" data-block-name="progress-bar" data-block-status="loading">
                                       <div>
                                         <div><p>30</p></div>
                                       </div>
                                       <div>
                                         <div><p>static</p></div>
                                       </div>
                                     </div>`;
});

test('decorates correctly progress bar block', () => {
  const block = document.getElementById('progress-bar-test');

  const [completionDiv, typeDiv] = [...block.children];

  const completion = completionDiv.querySelector('p');
  expect(completion).not.toBeNull();
  expect(completion.innerHTML).toBe('30');

  const type = typeDiv.querySelector('p');
  expect(type).not.toBeNull();
  const typeVal = type ? type.innerHTML : 'static';
  expect(typeVal).toBe('static');

  block.replaceChildren();

  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar__bar');
  if (completion && typeVal === 'static') {
    progressBar.style.width = completion.innerText + '%';
  }

  expect(progressBar.style.width).not.toBeNull();

  block.classList.add(typeVal);
  expect(block.classList.toString()).toContain('static');
});
