export default function decorate(block) {
  const [href, text, iconName] = block.children;
  const btn = href.querySelector('a') ? document.createElement('a') : document.createElement('p');
  block.replaceChildren();

  if (href.querySelector('a')) {
    btn.href = href.querySelector('a').href;
  }

  if (text.querySelector('p')) {
    btn.innerText = text.querySelector('p').innerText;
  }

  if (iconName.querySelector('p')) {
    btn.classList.add(iconName.querySelector('p').innerText);
  }

  const buttonElement = document.createElement('button');

  buttonElement.setAttribute('type', 'button');
  buttonElement.appendChild(btn);
  block.appendChild(buttonElement);
}
