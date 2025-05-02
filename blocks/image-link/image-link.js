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

    // Create new anchor but preserve data attributes
    const newAnchor = document.createElement('a');
    newAnchor.setAttribute('href', url);

    // Copy any data-aue-* attributes from the original anchor
    Array.from(anchor.attributes)
      .filter((attr) => attr.name.startsWith('data-aue-'))
      .forEach((attr) => {
        newAnchor.setAttribute(attr.name, attr.value);
      });

    // Preserve data attributes on the picture element
    Array.from(picture.attributes)
      .filter((attr) => attr.name.startsWith('data-aue-'))
      .forEach((attr) => {
        picture.setAttribute(attr.name, attr.value);
      });

    newAnchor.appendChild(picture);

    // Instead of clearing innerHTML, remove children individually
    while (block.firstChild) {
      block.removeChild(block.firstChild);
    }

    block.appendChild(newAnchor);
  }
}
