
export default function decorate(block) {
// detection of the universal editor
    const isInEditor = window.location.hostname.includes('adobeaemcloud.com') &&
                       (window.location.href.includes('/universal-editor/') ||
                        window.location.search.includes('universal-editor') ||
                        document.body.classList.contains('universal-editor-page'));

    // in editor mode, hide the configuration divs
    if (isInEditor) {
        console.log("Universal Editor rilevato - limitazione decorazione");
        // Nascondi solo le righe di configurazione
        if (block.children.length >= 2) block.children[1].style.display = 'none';
        if (block.children.length >= 3) block.children[2].style.display = 'none';
        if (block.children.length >= 4) block.children[3].style.display = 'none';
        return;
    }
    // set the value of the checkbox to false as default
    let linkItems = false;
    let showDescription = false;
    let id = '0';
    if(block.children.length >= 2){
        if(block.children[1].children.length > 0){
            const IDtext = block.children[1].children[0].textContent.trim().toLowerCase();
            //check if IDtext is a number
            if(!isNaN(IDtext)){
                id = IDtext;
                console.log("ID", id);
            }
        }
   }

   if (block.children.length >= 4) {
       //access to the intern div which contains "true" or "false"
       if (block.children[2].children.length > 0) {
           const linkItemsText = block.children[2].children[0].textContent.trim().toLowerCase();
           console.log("linkItemsText value:", linkItemsText);
           linkItems = linkItemsText === 'true';
           console.log("linkItems value:", linkItems);
       }
   }

   if (block.children.length >= 5) {
       //access to the intern div which contains "true" or "false"
       if (block.children[3].children.length > 0) {
           const showDescriptionText = block.children[3].children[0].textContent.trim().toLowerCase();
           showDescription = showDescriptionText === 'true';
           console.log("showDescription value:", showDescription);
       }
   }
    // remove the empty divs and the configuration divs
    const items = [...block.children].filter((item, index) => {
        // Escludi i div di configurazione (linkItems e showDescription)
        if (index === 1 || index === 2 || index === 3) {
            return false;
        }

        if (item.children.length === 1 &&
            item.children[0].tagName === 'DIV' &&
            !item.children[0].textContent.trim()) {
            return false;
        }

        return true;
    });

    // get the value of orderBy from the block's data attribute
    const orderBy = block.classList.contains('description') ? 'description' : 'title';

    let sortOrder;

    // crate the list tag
    const list = document.createElement('ul');
    list.className = 'list';
    list.id = `list-${id}`;

    // Create an array to store list items and their data for sorting
    const listItemsData = [];

    items.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        const components = [...item.children];
        let title = '';
        let description = '';
        let link = null;

        const linkElement = item.querySelector('a');
        if (linkElement) {
            link = linkElement.cloneNode(true);
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

        if (title || description) {
            itemContent += '<span class="list-item-content">';

            // add title and description on the same row else print only description
            if(title) {
                if(link && linkItems){
                    itemContent += `<span class="list-item-title"><a href="${link.href}" ${link.target ? `target="${link.target}"` : ''}>${title}</a></span>`;
                } else {
                    itemContent += `<span class="list-item-title">${title}</span>`;
                }

                // show description only if showDescription is true
                if(showDescription && description) {
                    // add a separator between title and description
                    itemContent += `<span class="list-item-separator"></span><span class="list-item-description">${description}</span>`;
                }
            } else if(description && showDescription) {
                // show description only if showDescription is true, not the title
                itemContent += `<span class="list-item-description">${description}</span>`;
            }
            itemContent += '</span>';
        }

        // check if the item content is not empty
        if (itemContent) {
            listItem.innerHTML = itemContent;
            listItem.classList.add('list-item-row');

            // Store the item and its data for sorting
            listItemsData.push({
                element: listItem,
                title,
                description
            });
        }
    });


    const uniqueItems = [...listItemsData];
    // if there is almost one element, get the value of sortOrder
    if (uniqueItems.length > 0) {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = uniqueItems[0].element.innerHTML;
        const titleElement = tempElement.querySelector('.list-item-title');
        if (titleElement) {
            sortOrder = titleElement.textContent.trim();
            // remove the entire element if the value is "ascending" or "descending"
            if(sortOrder === 'ascending' || sortOrder === 'descending'){
                uniqueItems.splice(0, 1);
            }
        }
    }
    // set default value for sortOrder
    if(sortOrder !== 'ascending' && sortOrder !== 'descending'){
        sortOrder = 'ascending';
    }
    console.log("OrderBy value:", orderBy, "Sort order:", sortOrder);

    // order second the value of orderBy
    uniqueItems.sort((a, b) => {
        const valueA = a[orderBy] ? a[orderBy].toLowerCase() : '';
        const valueB = b[orderBy] ? b[orderBy].toLowerCase() : '';

        // apply the sorting order
        return sortOrder === 'descending'
            ? valueB.localeCompare(valueA)
            : valueA.localeCompare(valueB);
    });

    // add the items to the list
    uniqueItems.forEach(item => {
        list.appendChild(item.element);
    });

    // hide the original elements
        [...block.children].forEach(child => {
            child.style.display = 'none';
        });

    block.appendChild(list);

}
