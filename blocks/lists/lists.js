export default function decorate(block) {

   /* const items = [...block.children]; //get all children of the block

    const tagOrder = document.createElement('div'); //create a div to hold the tag order
    tagOrder.classList.add('orderBy'); //add class to the div

    const container = document.createElement('div');
    container.classList.add('lists-container');

    const select = document.createElement('select');

    //order by title or description
    function sortItems(sortKey) {
        items.sort((a, b) => {
             const keyA = a.querySelector(`[data-sort-key="${sortKey}"]`)?.textContent.trim().toLowerCase() || '';
             const keyB = b.querySelector(`[data-sort-key="${sortKey}"]`)?.textContent.trim().toLowerCase() || '';
             return keyA.localeCompare(keyB);
        });


        block.innerHTML = ''; //clear the block
        items.forEach(item => block.appendChild(item)); //append sorted items to the block
    }

    block.innerHTML = '';
    block.appendChild(select);

    const ul = document.createElement('ul');
    ul.classList.add('lists-items');
    container.appendChild(ul);

    select.addEventListener('change', (e) => {
        sortItems(e.target.value.toLowerCase());
    });

    sortItems(select.value.toLowerCase());

    items.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('list-item');
        li.appendChild(item);
        ul.appendChild(li);
    });

    block.appendChild(container);*/

}

