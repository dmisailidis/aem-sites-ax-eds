/*
export default function decorate(block) {
  // Crea l'elemento lista principale
  const list = document.createElement('ul');
  list.classList.add('list');

  [...block.children].forEach((row) => {
    // Estrai titolo e descrizione dalle colonne della riga
    const [title, description, link, icon] = row.children;
    console.log(`Title: ${title}, Description: ${description}`);

    */
/*//*
/ Crea l'elemento della lista
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
    list.appendChild(listItem);*//*

  });

  // Sostituisci il contenuto del blocco con la lista creata
*/
/*  block.textContent = '';
  block.appendChild(list);*//*

}
*/


export default function decorate(block) {
    // remove empty divs
    const items = [...block.children].filter((item) => {
        console.log("item", item);
        if (item.children.length === 1 &&
            item.children[0].tagName === 'DIV' &&
            item.children[0].children.length === 0 &&
            !item.children[0].textContent.trim()) {
            return false;
        }
        return true;
    });
    console.log("orderBy: ",orderBy)
    const list = document.createElement('ul');
    list.className = 'list';
    const addedItems = new Set(); // keep track of added items

    items.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        const components = [...item.children];
        let title = '';
        let description = '';
        let icon = null;
        let link = null;

        const iconElement = item.querySelector('img, .icon, [class*="icon"]');
        if (iconElement) {
            icon = iconElement.cloneNode(true);
        }

        const linkElement = item.querySelector('a');
        let linkContent = '';
        if (linkElement) {
            link = linkElement.cloneNode(true);
            linkContent = linkElement.textContent.trim();
        }

        // extract title and description from the components if present
        if (components.length >= 1) {
            title = components[0].textContent.trim();
        }

        if (components.length >= 2) {
            description = components[1].textContent.trim();
        }

        // create the content of the list item
        let itemContent = '';

        if (icon) {
            itemContent += `<span class="list-item-icon">${icon.outerHTML}</span>`;
        }

        if (title || description || link) {
            itemContent += '<span class="list-item-content">';

            // add title and description on the same row else print only title or description
            if(title && description){
                if(link){
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>`;
                }
                itemContent += `<span class="list-item-description">${description}</span>`;
            } else if(title && !description){
                // check if the link is present
                console.log("controlling link", link);
                if(link){
                    // add the title with the link on press
                    console.log("title with link", title, link);
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>`;
                }
            } else if(!title && description){
                itemContent += `<span class="list-item-description">${description}</span>`;
            }
            console.log("link", link);
            itemContent += '</span>';
        }

        // check if the item content is not empty and if the item is not already added
        const itemKey = title + description + (link ? link.href : '');
        if (itemContent && !addedItems.has(itemKey)) {
            listItem.innerHTML = itemContent;
            listItem.classList.add('list-item-row'); // Classe per stile riga
            list.appendChild(listItem);
            addedItems.add(itemKey);
        }
    });

    // Svuota il blocco e aggiungi la lista
    block.innerHTML = '';
    block.appendChild(list);
}


