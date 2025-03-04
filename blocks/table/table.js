/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(isHeader) {
  const cell = isHeader
    ? document.createElement('th')
    : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  // Read the number of rows and columns from data attributes.
  const rowCount = parseInt(block.getAttribute('data-row-count'), 10) || 0;
  const columnCount = parseInt(block.getAttribute('data-column-count'), 10) || 0;

  // Create table elements.
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Determine if a header row should be used.
  const hasHeader = !block.classList.contains('no-header');
  if (hasHeader) table.append(thead);
  table.append(tbody);

  // Find rows rendered in the block.
  const rows = [...block.querySelectorAll('.table-row')];

  for (let i = 0; i < rowCount; i++) {
    const row = document.createElement('tr');
    if (hasHeader && i === 0) {
      thead.append(row);
    } else {
      tbody.append(row);
    }
    // Use the matching .table-row element from the dialog output, if available.
    const rowEl = rows[i];
    // Get cells from the row element (each with class .table-cell).
    const cells = rowEl ? [...rowEl.querySelectorAll('.table-cell')] : [];
    for (let j = 0; j < columnCount; j++) {
      const cell = buildCell(hasHeader && i === 0);
      // Insert the cell's rich text content if available.
      if (cells[j]) {
        cell.innerHTML = cells[j].innerHTML;
      }
      row.append(cell);
    }
  }

  // Replace the original block content with the generated table.
  block.innerHTML = '';
  block.append(table);
}
