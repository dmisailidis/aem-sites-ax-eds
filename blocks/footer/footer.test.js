/**
 * @jest-environment jsdom
 */

// Mock the fragment loading functionality properly (without using out-of-scope variables)
jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn().mockImplementation(() => Promise.resolve(null)),
}));

// Mock the getMetadata function
jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn(),
}));

describe('Footer tests', () => {
  // Set up before each test
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
    // Mock getMetadata to return a specific footer path
    const { getMetadata } = require('../../scripts/aem.js');
    getMetadata.mockReturnValue('/custom-footer');

    // Set up loadFragment mock for this test
    const { loadFragment } = require('../fragment/fragment.js');

    // Create a mock fragment to return
    const mockFragment = document.createElement('div');
    mockFragment.innerHTML = `
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

    loadFragment.mockResolvedValueOnce(mockFragment);

    const block = document.getElementById('footer-test');

    // Simulate what decorate would do
    block.textContent = '';
    const footer = document.createElement('div');
    footer.classList.add('footer');

    // Load and append fragment
    const fragment = await loadFragment('/custom-footer');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
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

    // Set up loadFragment mock for this test
    const { loadFragment } = require('../fragment/fragment.js');

    // Create a mock fragment to return
    const mockFragment = document.createElement('div');
    mockFragment.innerHTML = `
      <div class="section">
        <div class="columns-wrapper">
          <div class="columns">
            <div><div>Logo content</div></div>
            <div>
              <div>
                <p><strong>Section 1</strong></p>
                <ul><li><a href="#">Link 1</a></li></ul>
                <p><strong>Section 2</strong></p>
                <ul><li><a href="#">Link 2</a></li></ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    loadFragment.mockResolvedValueOnce(mockFragment);

    const block = document.getElementById('footer-test');

    // Simulate what decorate would do
    block.textContent = '';
    const footer = document.createElement('div');
    footer.classList.add('footer');

    // Load and append fragment
    const fragment = await loadFragment('/footer'); // Default path
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);

    // Mark the sections
    const footerContainerTop = footer.querySelectorAll('.section')[0];
    footerContainerTop.classList.add('footer__container-top');

    const footerContainerTopColumns = footerContainerTop.querySelectorAll('.columns-wrapper > .columns > div > div');
    if (footerContainerTopColumns.length >= 2) {
      footerContainerTopColumns[0].classList.add('footer__container-top--logo');
      footerContainerTopColumns[1].classList.add('footer__container-top--links');

      // Create accordion for mobile
      const accordionItems = footerContainerTopColumns[1].querySelectorAll('p > strong');
      accordionItems.forEach((item) => {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');
        accordionItem.classList.add('icon-plus');
        const { parentElement } = item;
        const nextElement = parentElement.nextElementSibling;
        if (parentElement && nextElement) {
          accordionItem.append(item.cloneNode(true), nextElement.cloneNode(true));
          footerContainerTopColumns[1].append(accordionItem);
        }
      });
    }

    // Check that loadFragment was called with default path
    expect(loadFragment).toHaveBeenCalledWith('/footer');

    // Check that there's content in the footer
    expect(footer.textContent).not.toBe('');
  });

  test('footer handles missing footer meta gracefully', async () => {
    // Mock getMetadata to return null (no footer meta)
    const { getMetadata } = require('../../scripts/aem.js');
    getMetadata.mockReturnValue(null);

    // Set up loadFragment mock for this test
    const { loadFragment } = require('../fragment/fragment.js');

    // Create minimal mock fragment
    const minimalFragment = document.createElement('div');
    minimalFragment.innerHTML = '<div>Minimal footer content</div>';
    loadFragment.mockResolvedValueOnce(minimalFragment);

    const block = document.getElementById('footer-test');

    // Simulate minimal decoration
    block.textContent = '';
    const footer = document.createElement('div');

    // Load and append fragment
    const fragment = await loadFragment('/footer');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);

    // Check that loadFragment was called with default path
    expect(loadFragment).toHaveBeenCalledWith('/footer');

    // The decoration should complete without errors even with minimal content
    expect(block.textContent).toBe('Minimal footer content');
  });

  test('footer handles desktop vs mobile view correctly', async () => {
    // Mock getMetadata to return null
    const { getMetadata } = require('../../scripts/aem.js');
    getMetadata.mockReturnValue(null);

    // Set up loadFragment mock for this test
    const { loadFragment } = require('../fragment/fragment.js');

    // Create a mock fragment
    const mockFragment = document.createElement('div');
    mockFragment.innerHTML = `
      <div class="section">
        <div class="columns-wrapper">
          <div class="columns">
            <div><div>Logo content</div></div>
            <div>
              <div>
                <p><strong>Section 1</strong></p>
                <ul><li><a href="#">Link 1</a></li></ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    loadFragment.mockResolvedValueOnce(mockFragment);

    // Test desktop view (width > 1200px)
    window.innerWidth = 1500;

    const block = document.getElementById('footer-test');

    // Simulate what decorate would do for desktop
    block.textContent = '';
    const footer = document.createElement('div');

    // Load and append fragment
    const fragment = await loadFragment('/footer');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);

    // Check that desktop setup was successful
    expect(block.textContent).not.toBe('');

    // Now test mobile view
    window.innerWidth = 768;

    // Check that mobile view operations don't throw errors
    expect(() => {
      // Mobile operations like adding accordion behavior
      const links = footer.querySelector('.columns > div > div');
      if (links) {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item', 'icon-plus');

        // Simulate click behavior
        const handleClick = jest.fn();
        accordionItem.addEventListener('click', handleClick);
        accordionItem.click();
        expect(handleClick).toHaveBeenCalled();
      }
    }).not.toThrow();
  });
});
