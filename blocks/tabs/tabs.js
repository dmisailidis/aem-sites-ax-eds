import { toClassName } from '../../scripts/aem.js';

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default async function decorate(block) {
  const tabList = document.createElement('div');
  tabList.className = 'tabs-list';
  tabList.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabPanel = block.children[i];
    tabPanel.className = 'tabs-panel';
    tabPanel.id = `tabpanel-${id}`;
    tabPanel.setAttribute('aria-hidden', !!i);
    tabPanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabPanel.setAttribute('role', 'tabpanel');
    if (!hasWrapper(tabPanel.lastElementChild)) {
      tabPanel.lastElementChild.innerHTML = `<p>${tabPanel.lastElementChild.innerHTML}</p>`;
    }
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', 'true');
      });
      tabList.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', 'false');
      });
      tabPanel.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-selected', 'true');
    });
    tabList.append(button);
    tab.remove();
  });

  block.prepend(tabList);
}
