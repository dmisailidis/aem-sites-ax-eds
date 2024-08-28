export default function decorate(block) {
  const [href, text, iconName] = block.children;
  const btn = document.createElement('a');
  btn.classList.add(...block.classList);

  if (href.querySelector('a')) {
    btn.href = href.querySelector('a').href;
  }

  if (text.querySelector('p')) {
    btn.innerText = text.querySelector('p').innerText;
  }

  if (iconName.querySelector('p')) {
    btn.classList.add(iconName.querySelector('p').innerText);
  }

  block.insertAdjacentElement('afterend', btn);
  block.remove();
}
