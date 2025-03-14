function buildCell(rowIndex) {
  const cell = rowIndex
    ? document.createElement('td')
    : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function getLiElements(el) {
  const ul = el.querySelector('ul');
  return ul ? Array.from(ul.children) : [];
}

export default function decorateTable(block) {
  // If no <ul> is found, try to decode HTML from a <p> tag
  if (!block.querySelector('ul')) {
    const p = block.querySelector('p');
    if (p) {
      const tempDiv = document.createElement('div');
      // p.textContent contains the escaped HTML, so setting it as innerHTML decodes it
      tempDiv.innerHTML = p.textContent;
      block.innerHTML = '';
      block.append(tempDiv);
    }
  }

  const table = document.createElement('table');
  const wrapperDiv = document.createElement('div');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Determine if a header should be built based on the block's class
  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  // Get the rows from the decoded <ul>
  const rows = getLiElements(block);
  rows.forEach((child, i) => {
    const row = document.createElement('tr');
    if (i === 0 && header) {
      thead.append(row);
    } else {
      tbody.append(row);
    }
    // Each row should have a nested <ul> with its cells
    const cells = getLiElements(child);
    cells.forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      if (col.innerHTML.includes('img') && col.textContent.trim()) {
        col.remove();
        const p = document.createElement('p');
        const span = document.createElement('span');
        span.append(col.textContent.trim());
        p.append(col.querySelector('img'));
        p.append(span);
        cell.append(p);
      } else if (col.innerHTML.includes('img')) {
        col.remove();
        cell.append(col.querySelector('img'));
      } else {
        cell.innerHTML = col.innerHTML;
      }
      row.append(cell);
    });
  });
  block.innerHTML = '';
  wrapperDiv.append(table);
  block.append(wrapperDiv);
}
