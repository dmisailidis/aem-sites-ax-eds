function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}
function toggleAccordion(navToggle) {
  navToggle.open = !navToggle.open;
}
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `
        <h3>${summary.innerHTML}</h3>
     `;
    }

    const buttonWithIcon = document.createElement('button');
    buttonWithIcon.classList.add('accordion-button');
    buttonWithIcon.setAttribute('aria-expanded', 'false');
    buttonWithIcon.innerHTML = '<span class="plus-icon" aria-expanded="false"></span>';
    summary.appendChild(buttonWithIcon);

    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.classList.add('accordion-item-container');
    row.innerHTML = '';
    row.append(details);

    const menuTitle = summary.querySelector('button');

    menuTitle.addEventListener('click', () => {
      toggleAccordion(details);
    });
  });
}
