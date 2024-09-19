export default function decorate(block) {
  const [videoDiv, controlsDiv, autoplayDiv, mutedDiv, textDiv] = [...block.children];
  const url = videoDiv.querySelector('a').innerText;
  const richText = textDiv.querySelector('div');

  const video = document.createElement('video');
  if (controlsDiv.querySelector('p')) {
    if (controlsDiv.querySelector('p').innerText === 'true') {
      video.setAttribute('controls', '');
    } else {
      video.removeAttribute('controls');
    }
  } else {
    video.removeAttribute('controls');
  }
  if (autoplayDiv.querySelector('p')) {
    if (autoplayDiv.querySelector('p').innerText === 'true') {
      video.setAttribute('autoplay', '');
    } else {
      video.removeAttribute('autoplay');
    }
  } else {
    video.removeAttribute('autoplay');
  }
  if (mutedDiv.querySelector('p')) {
    if (mutedDiv.querySelector('p').innerText === 'true') {
      video.setAttribute('muted', '');
    } else {
      video.removeAttribute('muted');
    }
  } else {
    video.removeAttribute('muted');
  }
  const source = document.createElement('source');
  source.src = url;
  source.type = 'video/mp4';
  video.appendChild(source);
  video.innerHTML += 'Your browser does not support the video tag.';
  block.append(video);

  const firstP = richText.querySelector('p');
  const firstH1 = richText.querySelector('h1');
  const elementsAfterH1 = [];
  let nextElement = firstH1.nextElementSibling;

  while (nextElement && nextElement.tagName.toLowerCase() !== 'ul') {
    elementsAfterH1.push(nextElement);
    nextElement = nextElement.nextElementSibling;
  }

  const ulElement = richText.querySelector('ul');

  const newDiv = document.createElement('div');
  newDiv.classList.add('video-text');

  if (firstP) {
    const pretitle = document.createElement('p');
    pretitle.classList.add('pretitle');
    pretitle.textContent = firstP.textContent;
    newDiv.appendChild(pretitle);
  }

  const body = document.createElement('div');
  body.classList.add('body');
  body.appendChild(firstH1);
  elementsAfterH1.forEach((element) => {
    body.appendChild(element);
  });

  newDiv.appendChild(body);

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
}
