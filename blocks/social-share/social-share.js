const iconsMap = ['icon-facebook-squared', 'icon-twitter', 'icon-instagram', 'icon-linkedin'];

export default async function decorate(block) {
  let counter = 0;
  [...block.children].forEach((child) => {
    const link = child.querySelector('a');
    child.replaceChildren();
    if (link) {
      child.className = 'icon-button';
      const button = document.createElement('button');
      const anchor = document.createElement('a');
      anchor.className = iconsMap[counter];
      anchor.href = link.href;
      button.setAttribute('type', 'button');
      button.appendChild(anchor);
      child.appendChild(button);
    } else {
      child.remove();
    }
    counter += 1;
  });
}
