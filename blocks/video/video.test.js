beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="video-test" class="video block" data-block-name="video" data-block-status="loading">
                                       <div>
                                         <div><p class="button-container"><a href="/content/dam/aem-accelerator/video.mp4" title="/content/dam/aem-accelerator/video.mp4" class="button">/content/dam/aem-accelerator/video.mp4</a></p></div>
                                       </div>
                                       <div>
                                         <div><p>false</p></div>
                                       </div>
                                       <div>
                                         <div><p>false</p></div>
                                       </div>
                                       <div>
                                         <div><p>false</p></div>
                                       </div>
                                       <div>
                                         <div>
                                           <p>Rhythm</p>
                                           <h1 id="aem-authoring-edge-delivery-services">AEM Authoring Edge Delivery Services</h1>
                                           <p>Unlock the power of seamless, high-speed content delivery directly to your users, no matter where they are. AEM Authoring Edge Delivery Services ensures your digital experiences are fast, reliable, and always up-to-date by leveraging edge computing technology. Enhance user engagement and performance by distributing content closer to your audience with unprecedented speed and precision..</p>
                                           <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec tellus quis augue ullamcorper imperdiet. Curabitur vehicula eleifend metus, quis feugiat lectus eleifend eu. Morbi iaculis eu purus sit amet elementum. Maecenas dignissim neque in enim blandit, quis mattis mi imperdiet.</p>
                                           <ul>
                                             <li><a href="www.google.gr" title="Learn More">Learn More</a></li>
                                             <li><a href="www.google.gr" title="Learn More">Join us</a></li>
                                           </ul>
                                         </div>
                                       </div>
                                     </div>`;
});

test('decorates correctly video block', () => {
  const block = document.getElementById('video-test');

  const [videoDiv, controlsDiv, autoplayDiv, mutedDiv, textDiv] = [...block.children];
  expect(videoDiv).not.toBeNull();
    const url = videoDiv.querySelector('a');
    expect(url.href).toContain('/content/dam/aem-accelerator/video.mp4');
    const richText = textDiv.querySelector('div');
    expect(textDiv).not.toBeNull();

    const video = document.createElement('video');
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.innerHTML += 'Your browser does not support the video tag.';

    expect(controlsDiv).not.toBeNull();
    expect(controlsDiv.querySelector('p').innerText).toBeFalsy();
    if (controlsDiv.querySelector('p')?.innerText === 'true') {
      video.setAttribute('controls', '');
    } else {
      video.removeAttribute('controls');
    }

    expect(autoplayDiv).not.toBeNull();
    expect(autoplayDiv.querySelector('p').innerText).toBeFalsy();
    if (autoplayDiv.querySelector('p')?.innerText === 'true') {
      video.setAttribute('autoplay', '');
    } else {
      video.removeAttribute('autoplay');
    }

    expect(mutedDiv).not.toBeNull();
    expect(mutedDiv.querySelector('p').innerText).toBeFalsy();
    if (mutedDiv.querySelector('p')?.innerText === 'true') {
      video.setAttribute('muted', '');
    } else {
      video.removeAttribute('muted');
    }

    expect(richText).not.toBeNull();
    if (!richText || !richText.children.length) {
      block.replaceChildren();
      block.append(video);
      return;
    }

    const firstH1 = richText.querySelector('h1');
    expect(firstH1.innerHTML).toBe('AEM Authoring Edge Delivery Services');
    const elementsAfterH1 = [];
    let nextElement = firstH1?.nextElementSibling;

    while (nextElement && nextElement.tagName.toLowerCase() !== 'ul') {
      elementsAfterH1.push(nextElement);
      nextElement = nextElement.nextElementSibling;
    }

    const ulElement = richText.querySelector('ul');

    const newDiv = document.createElement('div');
    newDiv.classList.add('video-text');

    const firstP = firstH1?.previousElementSibling;
    if (firstP && firstP.tagName.toLowerCase() === 'p') {
      const pretitle = document.createElement('p');
      pretitle.classList.add('pretitle');
      pretitle.textContent = firstP.textContent;
      newDiv.appendChild(pretitle);
    }

    const body = document.createElement('div');
    body.classList.add('body');

    if (firstH1) {
      body.appendChild(firstH1);
      elementsAfterH1.forEach((element) => {
        body.appendChild(element);
      });
    }

    newDiv.appendChild(body);

    expect(ulElement).not.toBeNull();
    if (ulElement) {
      const ctaDiv = document.createElement('div');
      ctaDiv.classList.add('cta', 'icon-button');

      const listItems = ulElement.querySelectorAll('li');
      listItems.forEach((li) => {
        const anchor = li.querySelector('a');
        const button = document.createElement('button');
        button.appendChild(anchor);
        ctaDiv.appendChild(button);
      });

      newDiv.appendChild(ctaDiv);
    }

    block.replaceChildren();
    block.append(video, newDiv);
    expect(block).not.toBeNull();
});
