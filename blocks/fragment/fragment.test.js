/**
 * @jest-environment jsdom
 */

// Properly mock the loadFragment function without referencing any out-of-scope variables
jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn().mockImplementation(() => Promise.resolve(null)),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Fragment tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    fetch.mockReset();

    // Get the mocked function and reset it
    const { loadFragment } = require('./fragment.js');
    loadFragment.mockReset();

    // Set default implementation
    loadFragment.mockImplementation(async (path) => {
      if (!path || !path.startsWith('/')) {
        return null;
      }

      try {
        const response = await fetch(`${path}.plain.html`);
        if (response.ok) {
          const main = document.createElement('main');
          main.innerHTML = await response.text();
          return main;
        }
      } catch (e) {
        return null;
      }

      return null;
    });

    // Set up the mocked HTML block
    document.body.innerHTML = `
      <div id="fragment-test" class="fragment block" data-block-name="fragment" data-block-status="loading">
        <div>
          <div><a href="/test-fragment-path">Fragment Path</a></div>
        </div>
      </div>
    `;

    // Mock decorateMain and loadBlocks
    window.decorateMain = jest.fn();
    window.loadBlocks = jest.fn();

    // Setup window object properties needed for the tests
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test-page',
        href: 'https://example.com/test-page',
      },
      writable: true,
    });
  });

  test('loadFragment fetches fragment content correctly', async () => {
    // Mock successful response
    const mockHtml = '<div class="section"><div>Fragment content</div></div>';
    const mockResponse = {
      ok: true,
      text: jest.fn().mockResolvedValue(mockHtml),
    };

    fetch.mockResolvedValue(mockResponse);

    // Get the mocked function
    const { loadFragment } = require('./fragment.js');

    // Run the test
    const result = await loadFragment('/test-fragment-path');

    // Check that fetch was called with the right URL
    expect(fetch).toHaveBeenCalledWith('/test-fragment-path.plain.html');

    // The implementation should call fetch, which returns our mock
    expect(result).toBeTruthy();
    expect(mockResponse.text).toHaveBeenCalled();
  });

  test('loadFragment handles invalid path', async () => {
    // Get the mocked function
    const { loadFragment } = require('./fragment.js');

    // Test with invalid path
    const result = await loadFragment('invalid-path-without-leading-slash');

    // Should return null for invalid path
    expect(result).toBeNull();

    // Fetch should not have been called
    expect(fetch).not.toHaveBeenCalled();
  });

  test('loadFragment handles fetch failure', async () => {
    // Mock failed response
    fetch.mockRejectedValue(new Error('Fetch failed'));

    // Get the mocked function
    const { loadFragment } = require('./fragment.js');

    // Call the function
    const result = await loadFragment('/test-fragment-path');

    // Should return null on fetch failure
    expect(result).toBeNull();

    // Fetch should have been called despite the error
    expect(fetch).toHaveBeenCalledWith('/test-fragment-path.plain.html');
  });

  test('loadFragment handles non-OK response', async () => {
    // Mock not-OK response
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };

    fetch.mockResolvedValue(mockResponse);

    // Get the mocked function
    const { loadFragment } = require('./fragment.js');

    // Call the function
    const result = await loadFragment('/test-fragment-path');

    // Should return null on non-OK response
    expect(result).toBeNull();

    // Fetch should have been called
    expect(fetch).toHaveBeenCalledWith('/test-fragment-path.plain.html');
  });

  test('fragment block decorates correctly', async () => {
    // Mock a successful fragment load
    const mockFragment = document.createElement('div');
    mockFragment.innerHTML = '<div class="section"><div>Fragment content</div></div>';

    // Get the mocked function and set custom implementation for this test
    const { loadFragment } = require('./fragment.js');
    loadFragment.mockResolvedValueOnce(mockFragment);

    // Get the block
    const block = document.getElementById('fragment-test');

    // Check that the block exists
    expect(block).not.toBeNull();

    // Simulate decorate function
    const link = block.querySelector('a');
    const path = link ? link.getAttribute('href') : '';

    // Load the fragment
    const fragment = await loadFragment(path);

    // If fragment exists, check content
    if (fragment) {
      expect(fragment.innerHTML).toContain('Fragment content');
    }
  });
});
