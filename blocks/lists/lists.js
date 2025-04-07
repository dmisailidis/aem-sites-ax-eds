export default function decorate(block) {
    let items;
    try {
        items = [...block.children].filter(item => {
            // Mantieni qualsiasi elemento che abbia contenuto visibile o elementi interattivi
            return item.textContent.trim() !== '' ||
                   item.querySelector('img, a, .icon') !== null;
        });

        console.log(`Filtrati ${block.children.length - items.length} elementi vuoti`);
    } catch (error) {
        console.error('Errore durante il filtraggio:', error);
        // In caso di qualsiasi errore, usa tutti gli elementi senza filtrare
        items = [...block.children];
    }

    // Se il filtro ha rimosso tutti gli elementi, ripristina l'originale
    if (!items || items.length === 0) {
        console.warn('Filtro troppo restrittivo: nessun elemento rimasto');
        items = [...block.children];
    }

    const list = document.createElement('ul');
    list.className = 'list';
    const addedItems = new Set();

    // Resto del codice invariato
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
        if (linkElement) {
            link = linkElement.cloneNode(true);
        }

        if (components.length >= 1) {
            title = components[0].textContent.trim();
        }

        if (components.length >= 2) {
            description = components[1].textContent.trim();
        }

        let itemContent = '';

        if (icon && icon.outerHTML) {
            itemContent += `<span class="list-item-icon">${icon.outerHTML}</span>`;
        }

        if (title || description || (link && link.href)) {
            itemContent += '<span class="list-item-content">';

            if(title && description) {
                if(link && link.href) {
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>`;
                }
                itemContent += `<span class="list-item-description">${description}</span>`;
            } else if(title && !description) {
                if(link && link.href) {
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>`;
                }
            } else if(!title && description) {
                itemContent += `<span class="list-item-description">${description}</span>`;
            }
            itemContent += '</span>';
        }

        const itemKey = title + description + (link && link.href ? link.href : '');
        if (itemContent && !addedItems.has(itemKey)) {
            listItem.innerHTML = itemContent;
            listItem.classList.add('list-item-row');
            list.appendChild(listItem);
            addedItems.add(itemKey);
        }
    });

    block.innerHTML = '';
    block.appendChild(list);
}