export default function decorate(block) {
  const picture = block.querySelector('picture');
  const firstParagraph = block.querySelector('p');
  const anchor = block.querySelector('a');

  if (picture && firstParagraph && anchor) {
    const url = anchor.getAttribute('href');
    const altText = firstParagraph.textContent.trim();
    const img = picture.querySelector('img');
    if (img) {
      img.setAttribute('alt', altText);
    }
    const newAnchor = document.createElement('a');
    newAnchor.setAttribute('href', url);
    newAnchor.appendChild(picture);
    block.innerHTML = '';
    block.appendChild(newAnchor);
  }
}
