function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

function setIconClass(menuTitle, isOpen, isPlusMinus) {
  const [openClass, closeClass] = isPlusMinus
    ? ['icon-minus', 'icon-plus']
    : ['icon-up-open-big', 'icon-down-open-big'];

  menuTitle.classList.toggle(openClass, isOpen);
  menuTitle.classList.toggle(closeClass, !isOpen);
}

function toggleAccordion(details, menuTitle, isPlusMinus) {
  const isOpen = !details.open;
  details.open = isOpen;
  menuTitle.setAttribute('aria-expanded', isOpen);
  setIconClass(menuTitle, isOpen, isPlusMinus);
}

export default function decorate(block) {
  const isPlusMinus = block.classList.contains('plus-minus');

  [...block.children].forEach((row) => {
    const [label, body] = row.children;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    if (!hasWrapper(summary)) {
      const heading = document.createElement('h3');
      heading.textContent = summary.innerText;
      summary.innerHTML = '';
      summary.appendChild(heading);
    }

    const buttonWithIcon = document.createElement('button');
    buttonWithIcon.className = 'accordion-button';
    buttonWithIcon.setAttribute('aria-expanded', 'false');
    buttonWithIcon.classList.add(isPlusMinus ? 'icon-plus' : 'icon-down-open-big');
    summary.appendChild(buttonWithIcon);

    const details = document.createElement('details');
    details.className = 'accordion-item';

    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = body.innerHTML;
      body.innerHTML = '';
      body.appendChild(paragraph);
    }

    details.append(summary, body);
    row.className = 'accordion-item-container';
    row.innerHTML = '';
    row.append(details);

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAccordion(details, buttonWithIcon, isPlusMinus);
    });
  });
}
