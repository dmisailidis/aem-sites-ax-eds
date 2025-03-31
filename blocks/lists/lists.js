export default function decorate(block) {

    const items = [...block.children]; //get all children of the block

    const select = document.querySelector('[name = "orderBy"]'); //get the select element
    if(!select) return; //if select element is not found, exit

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

    select.addEventListener('change', (e) => {
        sortItems(e.target.value.toLowerCase());
    });

    sortItems(select.value.toLowerCase());

}
