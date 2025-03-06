/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(rowIndex) {
  const cell = rowIndex
    ? document.createElement('td')
    : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function getLiElements(el) {
  const ul = el.querySelector('ul');
  return ul?.children;
}
export default function decorateTable(block) {
  const table = document.createElement('table');
  const div = document.createElement('div');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...getLiElements(block)].forEach((child, i) => {
    const row = document.createElement('tr');
    if (i) tbody.append(row);
    else thead.append(row);
    [...getLiElements(child)].forEach((col) => {
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
  div.append(table);
  block.append(div);
}
