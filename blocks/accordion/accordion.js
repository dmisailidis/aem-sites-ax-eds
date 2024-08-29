function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}
function toggleAccordion(navToggle, menuTitle) {
  navToggle.open = !navToggle.open;
  const ariaExpanded = navToggle.open ? 'true' : 'false';
  menuTitle.setAttribute('aria-expanded', ariaExpanded);
  menuTitle.classList.toggle('icon-down-open-big', !navToggle.open);
  menuTitle.classList.toggle('icon-up-open-big', navToggle.open);
}
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `
        <h3>${summary.innerText}</h3>
     `;
    }

    const buttonWithIcon = document.createElement('button');
    buttonWithIcon.classList.add('accordion-button');
    buttonWithIcon.setAttribute('aria-expanded', 'false');
    buttonWithIcon.classList.add('icon-down-open-big');
    summary.appendChild(buttonWithIcon);

    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.classList.add('accordion-item-container');
    row.innerHTML = '';
    row.append(details);

    const menuTitle = summary.querySelector('button');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAccordion(details, menuTitle);
    });
  });
}
