export default function decorate(block) {
    // Detection più precisa dell'Universal Editor
    const isInEditor = window.location.hostname === 'localhost'
                     || window.location.href.includes('/editor.html')
                     || window.location.pathname.includes('/universal-editor/')
                     || window.location.search.includes('universal-editor')
                     || document.body.classList.contains('universal-editor-page')
                     || document.body.hasAttribute('data-universal-editor-active');

    // In modalità editor, non facciamo nessuna manipolazione
    if (isInEditor) {
        console.log('Editor mode detected: disabling lists.js functionality');
        return;
    }

    // Solo in modalità runtime (non editor) applichiamo le trasformazioni

    // Estrazione configurazioni
    const configRows = [...block.children].filter((row, index) => index >= 1 && index <= 3);
    let sortOrder = 'ascending';
    let id = '0';
    let linkItems = false;
    let showDescription = false;

    // Estrai ID
    if (configRows[0] && configRows[0].children[0]) {
        const idText = configRows[0].children[0].textContent.trim();
        if (!isNaN(idText)) id = idText;
    }

    // Estrai linkItems
    if (configRows[1] && configRows[1].children[0]) {
        linkItems = configRows[1].children[0].textContent.trim().toLowerCase() === 'true';
    }

    // Estrai showDescription
    if (configRows[2] && configRows[2].children[0]) {
        showDescription = configRows[2].children[0].textContent.trim().toLowerCase() === 'true';
    }

    // Identifica elementi lista (escludendo config rows)
    const itemRows = [...block.children].filter((row, index) =>
        !(index >= 1 && index <= 3) &&
        row.hasAttribute('data-block-name') &&
        row.getAttribute('data-block-name') === 'list-item'
    );

    // Nascondi righe di configurazione
    configRows.forEach(row => row.style.display = 'none');

    // Determina l'ordinamento
    const orderBy = block.classList.contains('description') ? 'description' : 'title';

    // Prepara dati per ordinamento
    const itemsData = itemRows.map(row => {
        const cols = [...row.children];
        const title = cols[0]?.textContent.trim() || '';
        const description = cols[1]?.textContent.trim() || '';
        const link = row.querySelector('a');

        // Salva riferimento all'elemento originale
        return { row, title, description, link };
    });

    // Ordina elementi
    itemsData.sort((a, b) => {
        const valueA = a[orderBy]?.toLowerCase() || '';
        const valueB = b[orderBy]?.toLowerCase() || '';
        return sortOrder === 'descending'
            ? valueB.localeCompare(valueA)
            : valueA.localeCompare(valueB);
    });

    // Crea lista formattata
    const list = document.createElement('ul');
    list.className = 'list';
    list.id = `list-${id}`;

    // Riordina elementi nel DOM
    itemsData.forEach(data => {
        // Nascondi elemento originale
        data.row.style.display = 'none';

        // Crea versione formattata
        const li = document.createElement('li');
        li.className = 'list-item list-item-row';

        const content = document.createElement('span');
        content.className = 'list-item-content';

        if (data.title) {
            const titleSpan = document.createElement('span');
            titleSpan.className = 'list-item-title';

            if (data.link && linkItems) {
                const a = data.link.cloneNode(true);
                a.textContent = data.title;
                titleSpan.appendChild(a);
            } else {
                titleSpan.textContent = data.title;
            }

            content.appendChild(titleSpan);

            if (showDescription && data.description) {
                const separator = document.createElement('span');
                separator.className = 'list-item-separator';
                content.appendChild(separator);

                const descSpan = document.createElement('span');
                descSpan.className = 'list-item-description';
                descSpan.textContent = data.description;
                content.appendChild(descSpan);
            }
        } else if (data.description && showDescription) {
            const descSpan = document.createElement('span');
            descSpan.className = 'list-item-description';
            descSpan.textContent = data.description;
            content.appendChild(descSpan);
        }

        li.appendChild(content);
        list.appendChild(li);
    });

    // Aggiungi lista al blocco
    block.appendChild(list);
}