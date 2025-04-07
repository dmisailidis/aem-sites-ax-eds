export default function decorate(block) {
            // Ottieni tutti i figli e filtra quelli che sono vuoti o contengono solo div vuoti
            const listElements = [...block.children].filter(item => {
                // Caso 1: L'elemento ha testo diretto
                if (item.textContent.trim()) return true;

                // Caso 2: L'elemento contiene figli non vuoti
                if (item.children.length === 0) return false;

                // Verifica se tutti i figli sono div vuoti
                const allChildrenAreEmptyDivs = [...item.children].every(child => {
                    return child.tagName === 'DIV' && !child.textContent.trim() && !child.querySelector('img, a');
                });

                return !allChildrenAreEmptyDivs;
            });

            // Crea elemento lista
            const list = document.createElement('ul');
            list.className = 'list';
            const addedItems = new Set();

            // Elabora ogni elemento della lista
            listElements.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-item';
                const components = [...item.children];
                let title = '';
                let description = '';
                let link = null;

                // Trova eventuali link
                const linkElement = item.querySelector('a');
                if (linkElement) {
                    link = linkElement.cloneNode(true);
                }

                // Estrai titolo e descrizione
                if (components.length >= 1) {
                    title = components[0].textContent.trim();
                }

                if (components.length >= 2) {
                    description = components[1].textContent.trim();
                }

                // Costruisci il contenuto dell'elemento
                let itemContent = '';

                if (title || description || (link && link.href)) {
                    itemContent += '<span class="list-item-content">';

                    if (title && description) {
                        if (link && link.href) {
                            itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                        } else {
                            itemContent += `<span class="list-item-title">${title}</span>`;
                        }
                        itemContent += `<span class="list-item-description">${description}</span>`;
                    } else if (title && !description) {
                        if (link && link.href) {
                            itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                        } else {
                            itemContent += `<span class="list-item-title">${title}</span>`;
                        }
                    } else if (!title && description) {
                        itemContent += `<span class="list-item-description">${description}</span>`;
                    }
                    itemContent += '</span>';
                }

                // Evita duplicati utilizzando una chiave unica
                const itemKey = title + description + (link && link.href ? link.href : '');
                if (itemContent && !addedItems.has(itemKey)) {
                    listItem.innerHTML = itemContent;
                    listItem.classList.add('list-item-row');
                    list.appendChild(listItem);
                    addedItems.add(itemKey);
                }
            });

            // Sostituisci il contenuto del blocco
            block.innerHTML = '';
            block.appendChild(list);
        }