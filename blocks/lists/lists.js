export default function decorate(block) {
    // Rilevamento più robusto dell'editor
    const isInEditor = document.body.classList.contains('editor') || 
                       document.body.classList.contains('universal-editor-page') ||
                       window.location.href.includes('/editor.html') || 
                       window.location.pathname.includes('/universal-editor/') ||
                       document.querySelector('.universal-editor-container') !== null;

    // Estrazione delle configurazioni
    let linkItems = false;
    let showDescription = false;
    let id = '0';
    let sortOrder = 'ascending';
    
    // Leggi ID
    if (block.children.length >= 2 && block.children[1].children.length > 0) {
        const IDtext = block.children[1].children[0].textContent.trim();
        if (!isNaN(IDtext)) id = IDtext;
    }
    
    // Leggi linkItems
    if (block.children.length >= 4 && block.children[2].children.length > 0) {
        linkItems = block.children[2].children[0].textContent.trim().toLowerCase() === 'true';
    }
    
    // Leggi showDescription
    if (block.children.length >= 5 && block.children[3].children.length > 0) {
        showDescription = block.children[3].children[0].textContent.trim().toLowerCase() === 'true';
    }

    // Se siamo nell'editor, non manipolare profondamente il DOM
    if (isInEditor) {
        // Nascondi solo i div di configurazione
        if (block.children.length >= 2) block.children[1].style.display = 'none';
        if (block.children.length >= 3) block.children[2].style.display = 'none';
        if (block.children.length >= 4) block.children[3].style.display = 'none';
        return;
    }

    // Filtra gli elementi validi
    const items = [...block.children].filter((item, index) => {
        return !(index === 1 || index === 2 || index === 3 || 
                (item.children.length === 1 && 
                 item.children[0].tagName === 'DIV' && 
                 !item.children[0].textContent.trim()));
    });

    // Determina l'ordinamento
    const orderBy = block.classList.contains('description') ? 'description' : 'title';

    // Ottieni gli elementi e i loro dati per l'ordinamento
    const listItemsData = [];
    items.forEach((item) => {
        const components = [...item.children];
        let title = '';
        let description = '';
        let link = null;

        if (components.length >= 1) title = components[0].textContent.trim();
        if (components.length >= 2) description = components[1].textContent.trim();

        const linkElement = item.querySelector('a');
        if (linkElement) link = linkElement.cloneNode(true);

        if (title === 'ascending' || title === 'descending') {
            sortOrder = title;
            return;
        }

        if (title || (description && showDescription)) {
            listItemsData.push({
                originalItem: item,
                title,
                description,
                link
            });
        }
    });

    // Ordina gli elementi
    listItemsData.sort((a, b) => {
        const valueA = a[orderBy] ? a[orderBy].toLowerCase() : '';
        const valueB = b[orderBy] ? b[orderBy].toLowerCase() : '';
        return sortOrder === 'descending' 
            ? valueB.localeCompare(valueA) 
            : valueA.localeCompare(valueB);
    });

    // Crea una lista preservando gli elementi esistenti
    const existingList = block.querySelector('ul') || document.createElement('ul');
    existingList.className = 'list';
    existingList.id = `list-${id}`;
    
    // Svuota la lista esistente in modo sicuro
    while (existingList.firstChild) {
        existingList.removeChild(existingList.firstChild);
    }

    // Aggiungi gli elementi alla lista
    listItemsData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item list-item-row';
        
        let itemContent = '<span class="list-item-content">';
        
        if (item.title) {
            if (item.link && linkItems) {
                itemContent += `<span class="list-item-title"><a href="${item.link.href}" ${item.link.target ? `target="${item.link.target}"` : ''}>${item.title}</a></span>`;
            } else {
                itemContent += `<span class="list-item-title">${item.title}</span>`;
            }
            
            if (showDescription && item.description) {
                itemContent += `<span class="list-item-separator"></span><span class="list-item-description">${item.description}</span>`;
            }
        } else if (item.description && showDescription) {
            itemContent += `<span class="list-item-description">${item.description}</span>`;
        }
        
        itemContent += '</span>';
        listItem.innerHTML = itemContent;
        existingList.appendChild(listItem);
    });

    // Modifica in modo non distruttivo il contenuto del blocco
    // Rimuovi solo i div di configurazione e gli elementi vuoti
    [...block.children].forEach((child, index) => {
        if (index === 1 || index === 2 || index === 3 || 
            (child.children.length === 1 && 
             child.children[0].tagName === 'DIV' && 
             !child.children[0].textContent.trim())) {
            block.removeChild(child);
        }
    });
    
    // Assicurati che la lista sia nel blocco
    if (!block.contains(existingList)) {
        block.appendChild(existingList);
    }
}