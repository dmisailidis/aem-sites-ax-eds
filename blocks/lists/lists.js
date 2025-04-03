export default function decorate(block) {
    // remove empty divs
    const items = [...block.children].filter((item) => {
        if (item.children.length === 1 &&
            item.children[0].tagName === 'DIV' &&
            item.children[0].children.length === 0 &&
            !item.children[0].textContent.trim()) {
            return false;
        }
        return true;
    });

    const list = document.createElement('ul');
    list.className = 'list';
    const addedItems = new Set(); // keep track of added items
    
    items.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        
        // Analizza i componenti dell'elemento
        const components = [...item.children];
        let title = '';
        let description = '';
        let icon = null;
        let link = null;
        
        // Identifica icona se presente (immagine o elemento con classe contiene 'icon')
        const iconElement = item.querySelector('img, .icon, [class*="icon"]');
        if (iconElement) {
            icon = iconElement.cloneNode(true);
        }
        
        // Identifica link se presente
        const linkElement = item.querySelector('a');
        let linkContent = '';
        if (linkElement) {
            link = linkElement.cloneNode(true);
            linkContent = linkElement.textContent.trim();
        }
        
        // Estrai titolo e descrizione
        if (components.length >= 1) {
            title = components[0].textContent.trim();
        }
        
        if (components.length >= 2) {
            description = components[1].textContent.trim();
        }
        
        // Crea la struttura dell'elemento sulla stessa riga
        let itemContent = '';

        if (icon) {
            itemContent += `<span class="list-item-icon">${icon.outerHTML}</span>`;
        }
        
        if (title || description || link) {
            itemContent += '<span class="list-item-content">';

            // add title and description on the same row else print only title or description
            if(title && description){
                if(link){
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>` + " " + `<span class="list-item-description">${description}</span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>` + " " + `<span class="list-item-description">${description}</span>`;
                }
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
        
        // Verifica se ha contenuto e non è già stato aggiunto
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
