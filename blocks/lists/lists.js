export default function decorate(block){
    const items = [...block.children];
    const ul = document.getElementByClassName('list-item')
    if(!ul){
        const ul = document.createElement('ul');
    }
    block.appendChild(ul);
    items.forEach((item) => {
        const li = document.createElement('li');
        const text = item.querySelector('p');
        const icon = item.querySelector('span');
        const iconClass = icon.className;
        li.classList.add(iconClass);
        if (text) {
            li.innerText = text.innerText;
        }
        ul.appendChild(li);
    });

}