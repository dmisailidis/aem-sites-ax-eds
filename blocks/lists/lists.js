export default function decorate(block) {
  // Crea l'elemento lista principale
  const list = document.createElement('ul');
  list.classList.add('list');

  // Itera attraverso ogni riga del blocco
  [...block.children].forEach((row) => {
    // Estrazione dei dati da ogni cella
    const cells = [...row.children];

    // Determina titolo e descrizione dalle prime due celle
    let title = cells[0]?.textContent.trim() || "";
    let description = cells[1]?.textContent.trim() || "";

    // Ottieni il link se presente nella prima cella
    const link = cells[0]?.querySelector('a');
    const href = link?.getAttribute('href') || "";

    // Ottieni l'icona se presente nella terza cella
    const icon = cells[2]?.querySelector('img, span.icon') || null;

    // Crea l'elemento lista
    const listItem = document.createElement('li');
    listItem.classList.add('list-item');

    // Struttura per l'elemento della lista
    let html = '<div class="list-item-row">';

    // Aggiungi icona se presente
    if (icon) {
      html += '<div class="list-item-icon">';
      if (icon.tagName === 'IMG') {
        html += icon.outerHTML;
      } else {
        html += `<span class="${icon.className}"></span>`;
      }
      html += '</div>';
    }

    // Aggiungi contenuto (titolo e descrizione)
    html += '<div class="list-item-content">';

    // Titolo con o senza link
    html += '<div class="list-item-title">';
    if (href && block.classList.contains('links')) {
      html += `<a href="${href}" title="${title}">${title}</a>`;
    } else {
      html += title;
    }
    html += '</div>';

    // Descrizione se presente
    if (description && block.classList.contains('show-description')) {
      html += `<div class="list-item-description">${description}</div>`;
    }

    html += '</div>'; // Chiude list-item-content
    html += '</div>'; // Chiude list-item-row

    listItem.innerHTML = html;
    list.appendChild(listItem);
  });

  // Svuota il blocco e inserisci la nuova lista
  block.innerHTML = '';
  block.appendChild(list);

  // Applicazione degli ordinamenti se definiti come classi del blocco
  const sortElements = () => {
    const items = [...list.querySelectorAll('.list-item')];
    const orderBy = block.classList.contains('order-by-description') ? 'description' : 'title';
    const isDescending = block.classList.contains('descending');

    items.sort((a, b) => {
      const aText = a.querySelector(orderBy === 'description' ? '.list-item-description' : '.list-item-title').textContent.trim().toLowerCase();
      const bText = b.querySelector(orderBy === 'description' ? '.list-item-description' : '.list-item-title').textContent.trim().toLowerCase();

      return isDescending ? bText.localeCompare(aText) : aText.localeCompare(bText);
    });

    // Riapplica gli elementi ordinati
    items.forEach(item => {
      list.appendChild(item);
    });
  };

  // Ordina gli elementi se necessario
  if (block.classList.contains('order-by-title') ||
      block.classList.contains('order-by-description')) {
    sortElements();
  }
}
