export default function decorate(block) {
    // Detection migliorata per l'editor
    const isInEditor = document.body.classList.contains('editor') ||
                      document.body.dataset.universaleditoractive === 'true' ||
                      document.body.classList.contains('universal-editor-page') ||
                      window.location.href.includes('/editor.html') ||
                      window.location.pathname.includes('/universal-editor/') ||
                      document.querySelector('[data-universal-editor]') !== null;

    // Se siamo nell'editor, nascondi solo i div di configurazione
    if (isInEditor) {
        // Nascondi i div di configurazione
        if (block.children.length >= 2) block.children[1].style.display = 'none';
        if (block.children.length >= 3) block.children[2].style.display = 'none';
        if (block.children.length >= 4) block.children[3].style.display = 'none';
        return;
    }

    // Estrai la configurazione e procedi con la decorazione
    let linkItems = false;
    let showDescription = false;
    let id = '0';
    let sortOrder = 'ascending';

    // Estrai ID e altre impostazioni...
    if (block.children.length >= 2 && block.children[1].children.length > 0) {
        const IDtext = block.children[1].children[0].textContent.trim();
        if (!isNaN(IDtext)) id = IDtext;
    }

    if (block.children.length >= 4 && block.children[2].children.length > 0) {
        linkItems = block.children[2].children[0].textContent.trim().toLowerCase() === 'true';
    }

    if (block.children.length >= 5 && block.children[3].children.length > 0) {
        showDescription = block.children[3].children[0].textContent.trim().toLowerCase() === 'true';
    }

    // Crea una copia di lavoro degli elementi originali, escludendo le configurazioni
    const listItems = [];
    const configIndices = [1, 2, 3]; // Indici dei div di configurazione

    [...block.children].forEach((child, index) => {
        if (!configIndices.includes(index) && child.dataset && child.dataset.blockName === 'list-item') {
            listItems.push(child);
        }
    });

    // Determina l'ordinamento
    const orderBy = block.classList.contains('description') ? 'description' : 'title';

    // Ottieni i dati degli elementi
    const listItemsData = listItems.map(item => {
        const components = [...item.children];
        let title = '';
        let description = '';
        let link = null;

        if (components.length >= 1) title = components[0].textContent.trim();
        if (components.length >= 2) description = components[1].textContent.trim();

        const linkElement = item.querySelector('a');
        if (linkElement) link = linkElement;

        return {
            originalItem: item,
            title,
            description,
            link
        };
    });

    // Crea un contenitore per gli elementi formattati
    const formattedList = document.createElement('ul');
    formattedList.className = 'list';
    formattedList.id = `list-${id}`;

    // Nascondi gli elementi originali ma mantienili nel DOM
    listItems.forEach(item => {
        item.style.display = 'none';
    });

    // Ordina e aggiungi elementi formattati
    [...listItemsData]
        .sort((a, b) => {
            const valueA = a[orderBy] ? a[orderBy].toLowerCase() : '';
            const valueB = b[orderBy] ? b[orderBy].toLowerCase() : '';
            return sortOrder === 'descending'
                ? valueB.localeCompare(valueA)
                : valueA.localeCompare(valueB);
        })
        .forEach(item => {
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
            formattedList.appendChild(listItem);
        });

    // Aggiungi la lista formattata al blocco
    block.appendChild(formattedList);

    // Nascondi i div di configurazione
    if (block.children.length >= 2) block.children[1].style.display = 'none';
    if (block.children.length >= 3) block.children[2].style.display = 'none';
    if (block.children.length >= 4) block.children[3].style.display = 'none';
}