export default function decorate(block) {
    block.replaceChildren();
    const separator = document.createElement('hr');
    block.appendChild(separator);
}