export default function decorate(block) {
  const [videoDiv, textDiv] = [...block.children];
  block.replaceChildren();
  const url = videoDiv.querySelector('a').innerText;
  const text = textDiv.querySelector('div');
  const video = document.createElement('video');
  video.controls = true;
  video.autoplay = true;
  video.muted = true;

  const content = document.createElement('div');
  content.classList.add('video-text');

  if (text.children[0].tagName.toLowerCase() === 'p') {
    const pretitle = document.createElement('p');
    pretitle.classList.add('video-pretitle');
    pretitle.innerHTML = text.children[0].innerHTML;
    content.appendChild(pretitle);
  }

  const videoTitle = text.querySelector('h1');
  const ulElement = text.querySelector('ul');

  const body = videoTitle.nextElementSibling;
  videoTitle.className = 'video-title';
  content.appendChild(videoTitle);
  const videoBody = document.createElement('p');
  videoBody.classList.add('video-body');
  videoBody.innerHTML = body.innerHTML;
  content.appendChild(videoBody);

  let sibling = videoTitle.nextElementSibling;
  while (sibling && sibling !== ulElement) {
    if (sibling.tagName.toLowerCase() === 'p' || sibling.tagName.toLowerCase().startsWith('h')) {
      videoBody.innerHTML += sibling.outerHTML;
    }
    sibling = sibling.nextElementSibling;
  }

  if (ulElement) {
    const cta = document.createElement('div');
    cta.className = 'video-cta icon-button';

    ulElement.querySelectorAll('li').forEach((li) => {
      const anchor = li.querySelector('a');
      if (anchor) {
        const button = document.createElement('button');
        const buttonAnchor = document.createElement('a');
        buttonAnchor.href = anchor.href;
        buttonAnchor.textContent = anchor.textContent;
        button.appendChild(buttonAnchor);
        cta.appendChild(button);
      }
    });

    content.appendChild(cta);
  }

  const source = document.createElement('source');
  source.src = url;
  source.type = 'video/mp4';
  video.appendChild(source);
  video.innerHTML += 'Your browser does not support the video tag.';
  block.append(video, content);
}
