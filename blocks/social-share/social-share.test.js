beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="social-share-test" class="social-share block" data-block-name="social-share" data-block-status="loading">
                                       <div>
                                         <div><p><a href="https://www.facebook.com/DeloitteDigital" title="https://www.facebook.com/DeloitteDigital">https://www.facebook.com/DeloitteDigital</a></p></div>
                                       </div>
                                       <div>
                                         <div><p><a href="https://x.com/DeloitteDigital" title="https://x.com/DeloitteDigital">https://x.com/DeloitteDigital</a></p></div>
                                       </div>
                                       <div>
                                         <div><p><a href="https://www.instagram.com/deloittedigital/" title="https://www.instagram.com/deloittedigital/">https://www.instagram.com/deloittedigital/</a></p></div>
                                       </div>
                                       <div>
                                         <div><p><a href="https://www.linkedin.com/company/deloitte-digital/posts/?feedView=all" title="https://www.linkedin.com/company/deloitte-digital/posts/?feedView=all">https://www.linkedin.com/company/deloitte-digital/posts/?feedView=all</a></p></div>
                                       </div>
                                     </div>`;
});

test('decorates correctly social share block', () => {
  const block = document.getElementById('social-share-test');

  let counter = 0;
  [...block.children].forEach((child) => {
    expect(child).not.toBeNull();
    const link = child.querySelector('a');
    child.replaceChildren();
    expect(link).not.toBeNull();
    if (link) {
      child.className = 'icon-button';
      const button = document.createElement('button');
      const anchor = document.createElement('a');
      anchor.href = link.href;
      button.setAttribute('type', 'button');
      button.appendChild(anchor);
      child.appendChild(button);
    } else {
      child.remove();
    }
    counter += 1;
  });
  expect(counter).toBeGreaterThan(0);
});
