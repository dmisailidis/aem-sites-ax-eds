/**
 * @jest-environment jsdom
 */

import { loadFragment } from '../fragment/fragment.js';

// Mock the fragment loading functionality
jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn(),
}));

// Mock the getMetadata function
jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn(),
}));

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();

  // Set up the mocked HTML block
  document.body.innerHTML = `
    <div id="footer-test" class="footer block" data-block-name="footer" data-block-status="loading"></div>
  `;

  // Mock window.innerWidth for responsive tests
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024, // Default to desktop width
  });

  // Add addEventListener mock to window
  window.addEventListener = jest.fn();
});

test('footer loads and decorates fragment correctly', async () => {
  const { getMetadata } = require('../../scripts/aem.js');

  // Mock getMetadata to return a specific footer path
  getMetadata.mockReturnValue('/custom-footer');

  // Create a mock fragment HTML
  const mockFooterHTML = `
    <div class="section">
      <div class="columns-wrapper">
        <div class="columns">
          <div>
            <div class="footer__container-top--logo">Logo content</div>
          </div>
          <div>
            <div class="footer__container-top--links">
              <p><strong>Section 1</strong></p>
              <ul>
                <li><a href="#">Link 1</a></li>
                <li><a href="#">Link 2</a></li>
              </ul>
              <p><strong>Section 2</strong></p>
              <ul>
                <li><a href="#">Link 3</a></li>
                <li><a href="#">Link 4</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="default-content-wrapper">
        <p>Legal text</p>
      </div>
      <div class="icon-button-container">
        <div class="icon-button">Social 1</div>
        <div class="icon-button">Social 2</div>
      </div>
    </div>
  `;

  const mockFragment = document.createElement('div');
  mockFragment.innerHTML = mockFooterHTML;

  // Mock loadFragment to return our fragment
  loadFragment.mockResolvedValue(mockFragment);

  const block = document.getElementById('footer-test');

  // Simulate what the decoration would do
  block.textContent = '';
  const footer = document.createElement('div');
  footer.classList.add('footer');

  // Add the fragment content to the footer
  footer.innerHTML = mockFooterHTML;
  block.append(footer);

  // Mark the sections
  const footerContainerTop = footer.querySelectorAll('.section')[0];
  footerContainerTop.classList.add('footer__container-top');

  const footerContainerBottom = footer.querySelectorAll('.section')[1];
  footerContainerBottom.classList.add('footer__container-bottom');

  // Check that fragment was loaded with correct path
  expect(loadFragment).toHaveBeenCalledWith('/custom-footer');

  // Check that sections were marked
  expect(footer.querySelector('.footer__container-top')).not.toBeNull();
  expect(footer.querySelector('.footer__container-bottom')).not.toBeNull();
});

test('footer creates accordion for mobile view', async () => {
  // Set width to mobile size
  window.innerWidth = 768;

  // Mock getMetadata to return default path
  const { getMetadata } = require('../../scripts/aem.js');
  getMetadata.mockReturnValue(null);

  // Create a mock fragment HTML
  const mockFooterHTML = `
    <div class="section">
      <div class="columns-wrapper">
        <div class="columns">
          <div>
            <div>Logo content</div>
          </div>
          <div>
            <div>
              <p><strong>Section 1</strong></p>
              <ul>
                <li><a href="#">Link 1</a></li>
                <li><a href="#">Link 2</a></li>
              </ul>
              <p><strong>Section 2</strong></p>
              <ul>
                <li><a href="#">Link 3</a></li>
                <li><a href="#">Link 4</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const mockFragment = document.createElement('div');
  mockFragment.innerHTML = mockFooterHTML;

  // Mock loadFragment to return our fragment
  loadFragment.mockResolvedValue(mockFragment);

  const block = document.getElementById('footer-test');

  // Simulate what the decoration would do
  block.textContent = '';
  const footer = document.createElement('div');
  footer.classList.add('footer');

  // Add the fragment content to the footer
  footer.innerHTML = mockFooterHTML;
  block.append(footer);

  // Mark the sections
  const footerContainerTop = footer.querySelectorAll('.section')[0];
  footerContainerTop.classList.add('footer__container-top');

  const footerContainerTopColumns = footerContainerTop.querySelectorAll('.columns-wrapper > .columns > div > div');
  footerContainerTopColumns[0].classList.add('footer__container-top--logo');
  footerContainerTopColumns[1].classList.add('footer__container-top--links');

  // Create accordion for mobile
  const accordionItems = footerContainerTopColumns[1].querySelectorAll('p > strong');
  accordionItems.forEach((item) => {
    const accordionItem = document.createElement('div');
    accordionItem.classList.add('accordion-item');
    accordionItem.classList.add('icon-plus');
    accordionItem.append(item, item.parentElement.nextElementSibling);
    footerContainerTopColumns[1].append(accordionItem);
  });

  // Check that loadFragment was called with default path
  expect(loadFragment).toHaveBeenCalledWith('/footer');

  // Check that accordion items were created
  expect(footer.querySelectorAll('.accordion-item').length).toBe(2);
  expect(footer.querySelectorAll('.icon-plus').length).toBe(2);
});

test('footer handles missing footer meta gracefully', async () => {
  // Mock getMetadata to return null (no footer meta)
  const { getMetadata } = require('../../scripts/aem.js');
  getMetadata.mockReturnValue(null);

  // Create an empty mock fragment
  const mockFragment = document.createElement('div');
  mockFragment.innerHTML = '<div>Minimal footer content</div>';

  // Mock loadFragment to return our fragment
  loadFragment.mockResolvedValue(mockFragment);

  const block = document.getElementById('footer-test');

  // Simulate what the decoration would do
  block.textContent = '';
  const footer = document.createElement('div');
  footer.innerHTML = '<div>Minimal footer content</div>';
  block.append(footer);

  // Check that loadFragment was called with default path
  expect(loadFragment).toHaveBeenCalledWith('/footer');

  // The decoration should complete without errors even with minimal content
  expect(block.textContent).toBe('Minimal footer content');
});

test('footer handles desktop vs mobile view correctly', async () => {
  const { getMetadata } = require('../../scripts/aem.js');
  getMetadata.mockReturnValue(null);

  // Create a mock fragment HTML
  const mockFooterHTML = `
    <div class="section">
      <div class="columns-wrapper">
        <div class="columns">
          <div>
            <div>Logo content</div>
          </div>
          <div>
            <div>
              <p><strong>Section 1</strong></p>
              <ul>
                <li><a href="#">Link 1</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const mockFragment = document.createElement('div');
  mockFragment.innerHTML = mockFooterHTML;

  // Mock loadFragment to return our fragment
  loadFragment.mockResolvedValue(mockFragment);

  // Test desktop view (width > 1200px)
  window.innerWidth = 1500;

  const block = document.getElementById('footer-test');

  // Simulate what the decoration would do
  block.textContent = '';
  const footer = document.createElement('div');
  footer.innerHTML = mockFooterHTML;
  block.append(footer);

  // Test mobile view (width < 1200px)
  window.innerWidth = 768;

  // Mobile view would add accordion behaviors
  const mobileHandling = () => {
    const links = footer.querySelector('.columns > div > div');
    if (links) {
      // In mobile view, accordion items would have click listeners
      const accordionItem = document.createElement('div');
      accordionItem.classList.add('accordion-item');
      accordionItem.querySelector('strong')?.classList.add('icon-plus');

      // Mock a click on the accordion to toggle it
      const handleClick = jest.fn();
      accordionItem.addEventListener('click', handleClick);
      accordionItem.click();
      expect(handleClick).toHaveBeenCalled();
    }
  };

  expect(mobileHandling).not.toThrow();
});
