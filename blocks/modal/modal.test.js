beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="modal-test" class="section" data-section-status="loaded" style="">
                                <div class="default-content-wrapper">
                                    <h1 id="test">Test</h1>
                                    <p>Test test</p>
                                </div>
                            </div>`;
});

test('correctly build modal block', () => {
  const contentNodes = document.getElementById('modal-test').querySelector('.default-content-wrapper').children;

  const dialog = document.createElement('dialog');
  const dialogContent = document.createElement('div');
  dialogContent.classList.add('modal-content');
  dialogContent.append(...contentNodes);
  dialog.append(dialogContent);

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.type = 'button';
  closeButton.innerHTML = '<span class="icon icon-cancel"></span>';
  closeButton.addEventListener('click', () => dialog.close());
  dialog.prepend(closeButton);

  expect(dialog).not.toBeNull();
});
