export default function decorate(block) {
  // Crea l'elemento lista principale
  const list = document.createElement('ul');
  list.classList.add('list');

  [...block.children].forEach((row) => {
    // Estrai titolo e descrizione dalle colonne della riga
    const title = row.children[0]?.textContent.trim() || '';
    const description = row.children[1]?.textContent.trim() || '';

    // Crea l'elemento della lista
    const listItem = document.createElement('li');
    listItem.classList.add('list-item');

    // Crea titolo
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.classList.add('list-item-title');
      titleElement.textContent = title;
      listItem.appendChild(titleElement);
    }

    // Crea descrizione
    if (description) {
      const descElement = document.createElement('div');
      descElement.classList.add('list-item-description');
      descElement.textContent = description;
      listItem.appendChild(descElement);
    }

    // Aggiungi l'elemento alla lista
    list.appendChild(listItem);
  });

  // Sostituisci il contenuto del blocco con la lista creata
  block.textContent = '';
  block.appendChild(list);
}
