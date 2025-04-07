export default function decorate(block) {

            // Inizializza items con tutti i figli del blocco
            const items = [...block.children].filter((item) => {
                // Verifica se l'elemento è un contenitore vuoto
                try {
                    // Logica meno aggressiva: conserva gli elementi che hanno contenuto
                    if (item.children.length > 0 &&
                        (item.textContent.trim() !== '' ||
                         item.querySelector('img, a, .icon') !== null)) {
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.error('Errore durante filtro:', e);
                    // In caso di errore, mantieni l'elemento
                    return true;
                }
            });

            // Controlla se items contiene elementi
            if (!items || items.length === 0) {
                console.warn('Nessun elemento trovato dopo il filtro');
                // Fallback: usa tutti i figli senza filtro
                items = [...block.children];
            }

            const list = document.createElement('ul');
            list.className = 'list';
            const addedItems = new Set();

            items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-item';
                const components = [...item.children];
                let title = '';
                let description = '';
                let icon = null;
                let link = null;

                // Decommenta questa parte per gestire le icone
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

                // Aggiungi l'icona solo se esiste
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