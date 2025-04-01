/*
function orderBy(condition, items) {
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
}
*/
