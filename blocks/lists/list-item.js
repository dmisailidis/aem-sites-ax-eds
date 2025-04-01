/**
 * Decorates a list item block
 * @param {Element} block - The list item block element
 */
export default function decorate(block) {
  // Extract data from rows
  const rows = [...block.children];

  // Clear original content
  block.innerHTML = '';

  // Add list-item class
  block.classList.add('list-item');

  // Process rows based on their expected content
  if (rows.length >= 1) {
    // Title - first row
    const titleRow = rows[0];
    const title = titleRow?.querySelector('div')?.textContent.trim() || '';
    const titleEl = document.createElement('span');
    titleEl.classList.add('list-item-title');
    titleEl.textContent = title;
    block.appendChild(titleEl);

    // Description - second row (if exists)
    if (rows.length >= 2) {
      const descriptionRow = rows[1];
      const description = descriptionRow?.querySelector('div')?.textContent.trim() || '';
      if (description) {
        const descriptionEl = document.createElement('p');
        descriptionEl.classList.add('list-item-description');
        descriptionEl.textContent = description;
        block.appendChild(descriptionEl);
      }
    }

    // Link - third row (if exists)
    if (rows.length >= 3) {
      const linkRow = rows[2];
      const linkEl = linkRow?.querySelector('a');
      if (linkEl) {
        // If there's a link, wrap the title in it
        const link = linkEl.href;
        const titleEl = block.querySelector('.list-item-title');
        const linkWrapper = document.createElement('a');
        linkWrapper.href = link;
        linkWrapper.textContent = titleEl.textContent;
        titleEl.textContent = '';
        titleEl.appendChild(linkWrapper);
      }
    }

    // Icon - fourth row (if exists)
    if (rows.length >= 4) {
      const iconRow = rows[3];
      const icon = iconRow?.querySelector('div')?.textContent.trim() || '';
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.classList.add('list-item-icon', `icon-${icon}`);
        block.insertBefore(iconEl, block.firstChild);
      }
    }
  }
}