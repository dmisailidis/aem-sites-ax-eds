import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.append(footer);

  /* -------------------------------------------------------------------------- */
  /*                            FOOTER TOP CONTAINER                            */
  /* -------------------------------------------------------------------------- */
  const footerContainerTop = document.querySelectorAll('.footer > div > .section')[0];
  footerContainerTop.classList.add('footer__container-top');
  const footerContainerTopColumns = footerContainerTop.querySelectorAll('.columns-wrapper > .columns > div > div');
  footerContainerTopColumns[0].classList.add('footer__container-top--logo');
  footerContainerTopColumns[1].classList.add('footer__container-top--links');

  // Create accordion item for use on mobile viewports
  const accordionItems = footerContainerTopColumns[1].querySelectorAll('p > strong');
  accordionItems.forEach((item) => {
    const accordionItem = document.createElement('div');
    accordionItem.classList.add('accordion-item');
    accordionItem.append(item, item.parentElement.nextElementSibling);
    footerContainerTopColumns[1].append(accordionItem);
  });
  // Remove leftover empty <p> elements
  footerContainerTopColumns[1].querySelectorAll('p').forEach((p) => {
    p.remove();
  });

  if (window.innerWidth < 1200) {
    const accordionTriggers = document.querySelectorAll('.accordion-item');

    accordionTriggers.forEach((trigger) => {
      trigger.querySelector('strong').classList.add('icon-plus');
      trigger.addEventListener('click', () => {
        // Toggle the 'active' class on the clicked item
        trigger.classList.toggle('active');

        trigger.querySelector('strong').classList.toggle('icon-plus');
        trigger.querySelector('strong').classList.toggle('icon-minus');

        // Get the <ul> element within this item
        const content = trigger.querySelector('ul');

        // Toggle the 'show' class on the content to show/hide it
        content.classList.toggle('show');
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                           FOOTER BOTTOM CONTAINER                          */
  /* -------------------------------------------------------------------------- */
  const footerContainerBottom = document.querySelectorAll('.footer > div > .section')[1];
  footerContainerBottom.classList.add('footer__container-bottom');

  const iconButtons = footerContainerBottom.querySelectorAll('.icon-button');
  const newWrapper = document.createElement('div');
  newWrapper.classList.add('icon-button-wrapper');
  iconButtons.forEach((button) => {
    newWrapper.appendChild(button);
  });

  const iconButtonContainer = document.querySelector('footer').querySelector('.icon-button-container');
  const existingWrappers = iconButtonContainer.querySelectorAll('.icon-button-wrapper');
  existingWrappers.forEach((wrapper) => wrapper.remove());
  iconButtonContainer.appendChild(newWrapper);
}
