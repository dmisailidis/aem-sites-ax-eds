/*function orderBy(condition, items) {
  if (condition === "title") {
    items.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
  } else if (condition === "description") {
    items.sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''));
  }
  return items;
}

export default function decorate(block) {
   const items = [...block.children];
    const listBlock = document.querySelector('.lists-block');
    console.log("listBlock")
    if (!listBlock) return;

    let ul = listBlock.querySelector('ul');
    console.log("ul")
    if (!ul) {
        ul = document.createElement('ul');
        ul.classList.add('list-container');
        listBlock.appendChild(ul);
    }

    const orderSelect = document.querySelector('select[name="orderBy"]');
    console.log("orderSelect")
    const orderedItems = orderBy(orderSelect.value, items);

    ul.innerHTML = '';
    orderedItems.forEach((el) => {
        const li = document.createElement('li');
        li.textContent = el.title;
        ul.appendChild(li);
    });
}*/



export default function decorate(block) {

  const orderBySelect = document.querySelector('select[name="orderBy"]');
  const sortOrderSelect = document.querySelector('select[name="sortOrder"]');
  const maxItemsInput = document.querySelector('input[name="maxItems"]');


  const orderBy = orderBySelect ? orderBySelect.value : "title"; // "title" o "description"
  const sortOrder = sortOrderSelect ? sortOrderSelect.value : "ascending"; // "ascending" o "descending"
  const maxItems = maxItemsInput ? parseInt(maxItemsInput.value, 10) : Infinity; // Numero massimo di elementi


  const itemsArray = Array.from(block.children);
  block.querySelectorAll('div').forEach(div => div.remove());



  itemsArray.sort((a, b) => {
    const aKey = a.getAttribute('data-' + orderBy) || "";
    const bKey = b.getAttribute('data-' + orderBy) || "";
    let cmp = aKey.localeCompare(bKey);

    if (sortOrder.toLowerCase() === 'descending') {
      cmp = -cmp;
    }
    return cmp;
  });


  const limitedItems = itemsArray.slice(0, maxItems);


  block.innerHTML = "";


  limitedItems.forEach(item => block.appendChild(item));
}
