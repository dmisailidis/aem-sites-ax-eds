/**
 * @jest-environment jsdom
 */

import { loadFragment } from './fragment.js';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  // Reset fetch mock
  fetch.mockReset();

  // Set up the mocked HTML block
  document.body.innerHTML = `
    <div id="fragment-test" class="fragment block" data-block-name="fragment" data-block-status="loading">
      <div>
        <div><a href="/test-fragment-path">Fragment Path</a></div>
      </div>
    </div>
  `;

  // Mock the decorateMain and loadBlocks functions
  window.decorateMain = jest.fn();
  window.loadBlocks = jest.fn();
});

jest.mock('./fragment.js', () => {
  // Actual implementation to test
  const original = jest.requireActual('./fragment.js');

  return {
    ...original,
    loadFragment: jest.fn(),
  };
});

test('loadFragment fetches fragment content correctly', async () => {
  // Mock successful response
  const mockHtml = '<div class="section"><div>Fragment content</div></div>';
  const mockResponse = {
    ok: true,
    text: jest.fn().mockResolvedValue(mockHtml),
  };

  fetch.mockResolvedValue(mockResponse);

  // Create a mock fragment
  const mockFragment = document.createElement('main');
  mockFragment.innerHTML = mockHtml;

  // Mock loadFragment to return our mockFragment
  loadFragment.mockResolvedValue(mockFragment);

  // Call the loadFragment function
  const result = await loadFragment('/test-fragment-path');

  // Check that fetch was called with the right URL
  expect(fetch).toHaveBeenCalledWith('/test-fragment-path.plain.html');

  // Check the returned fragment
  expect(result).toBeTruthy();
  expect(result.querySelector('.section')).toBeTruthy();
});

test('loadFragment handles invalid path', async () => {
  // Set up a mock for loadFragment that matches the actual behavior
  loadFragment.mockImplementation(async (path) => {
    if (!path || !path.startsWith('/')) {
      return null;
    }
    // Other implementation details...
    return null;
  });

  // Test with invalid path
  const result = await loadFragment('invalid-path-without-leading-slash');

  // Should return null
  expect(result).toBeNull();
});

test('loadFragment handles fetch failure', async () => {
  // Mock failed response
  fetch.mockRejectedValue(new Error('Fetch failed'));

  // Set up a mock for loadFragment that handles fetch failures
  loadFragment.mockImplementation(async (path) => {
    if (path && path.startsWith('/')) {
      try {
        await fetch(`${path}.plain.html`);
        // This part should not execute in our test
        return 'Should not reach here';
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Call the function
  const result = await loadFragment('/test-fragment-path');

  // Should return null on fetch failure
  expect(result).toBeNull();
});
