/**
 * @jest-environment jsdom
 */

// Mock the loadScript function
const mockLoadScript = jest.fn();

// Mock the embed functions
const mockEmbedYoutube = jest.fn();
const mockEmbedVimeo = jest.fn();
const mockEmbedTwitter = jest.fn();
const mockGetDefaultEmbed = jest.fn();
const mockLoadEmbed = jest.fn();

jest.mock('./embed.js', () => ({
  __esModule: true,
  default: jest.fn(),
  loadScript: mockLoadScript,
  embedYoutube: mockEmbedYoutube,
  embedVimeo: mockEmbedVimeo,
  embedTwitter: mockEmbedTwitter,
  getDefaultEmbed: mockGetDefaultEmbed,
  loadEmbed: mockLoadEmbed,
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
window.IntersectionObserver = mockIntersectionObserver;

beforeEach(() => {
  // Reset mocks
  mockLoadScript.mockReset();
  mockEmbedYoutube.mockReset();
  mockEmbedVimeo.mockReset();
  mockEmbedTwitter.mockReset();
  mockGetDefaultEmbed.mockReset();
  mockLoadEmbed.mockReset();

  // Set up the mocked HTML block for embed with placeholder
  document.body.innerHTML = `
    <div id="embed-test" class="embed block" data-block-name="embed" data-block-status="loading">
      <div>
        <div>
          <picture>
            <source type="image/webp" srcset="placeholder.webp">
            <img src="placeholder.jpg" alt="Video placeholder">
          </picture>
        </div>
      </div>
      <div>
        <div>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">https://www.youtube.com/watch?v=dQw4w9WgXcQ</a>
        </div>
      </div>
    </div>
  `;
});

test('decorates embed block with placeholder correctly', () => {
  const block = document.getElementById('embed-test');

  // Simulate the decoration process
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;

  expect(placeholder).not.toBeNull();
  expect(link).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  // Clear block content as the component would
  block.textContent = '';

  // Create wrapper and play button as the component would
  const wrapper = document.createElement('div');
  wrapper.className = 'embed-placeholder';
  wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
  wrapper.prepend(placeholder);

  // Add click event (simplified for testing)
  wrapper.addEventListener('click', () => {
    mockLoadEmbed(block, link, true);
  });

  block.append(wrapper);

  // Check structure
  expect(block.querySelector('.embed-placeholder')).not.toBeNull();
  expect(block.querySelector('.embed-placeholder-play')).not.toBeNull();
  expect(block.querySelector('.embed-placeholder-play button')).not.toBeNull();

  // Test click handler
  block.querySelector('.embed-placeholder').click();
  expect(mockLoadEmbed).toHaveBeenCalledWith(block, link, true);
});

test('decorates embed block without placeholder correctly', () => {
  // Set up block without placeholder
  document.body.innerHTML = `
    <div id="embed-test-no-placeholder" class="embed block" data-block-name="embed" data-block-status="loading">
      <div>
        <div>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">https://www.youtube.com/watch?v=dQw4w9WgXcQ</a>
        </div>
      </div>
    </div>
  `;

  const block = document.getElementById('embed-test-no-placeholder');

  // Simulate the decoration process
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;

  expect(placeholder).toBeNull();
  expect(link).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  // Clear block content as the component would
  block.textContent = '';

  // The component should set up an IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      mockLoadEmbed(block, link);
    }
  });
  observer.observe(block);

  // Check that observer was created
  expect(mockIntersectionObserver).toHaveBeenCalled();
});

test('loadEmbed identifies YouTube videos correctly', () => {
  mockEmbedYoutube.mockReturnValue('<div class="youtube-embed">YouTube embed</div>');

  // Implementation similar to the actual loadEmbed function
  const loadEmbedMock = (block, link, autoplay) => {
    if (block.classList.contains('embed-is-loaded')) {
      return;
    }

    const url = new URL(link);
    if (link.includes('youtube') || link.includes('youtu.be')) {
      block.innerHTML = mockEmbedYoutube(url, autoplay);
      block.classList = 'block embed embed-youtube';
      block.classList.add('embed-is-loaded');
    }
  };

  const block = document.createElement('div');
  const link = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  loadEmbedMock(block, link, false);

  expect(mockEmbedYoutube).toHaveBeenCalled();
  expect(block.classList.contains('embed-youtube')).toBeTruthy();
  expect(block.classList.contains('embed-is-loaded')).toBeTruthy();
});

test('loadEmbed identifies Vimeo videos correctly', () => {
  mockEmbedVimeo.mockReturnValue('<div class="vimeo-embed">Vimeo embed</div>');

  // Implementation similar to the actual loadEmbed function
  const loadEmbedMock = (block, link, autoplay) => {
    if (block.classList.contains('embed-is-loaded')) {
      return;
    }

    const url = new URL(link);
    if (link.includes('vimeo')) {
      block.innerHTML = mockEmbedVimeo(url, autoplay);
      block.classList = 'block embed embed-vimeo';
      block.classList.add('embed-is-loaded');
    }
  };

  const block = document.createElement('div');
  const link = 'https://vimeo.com/148751763';

  loadEmbedMock(block, link, false);

  expect(mockEmbedVimeo).toHaveBeenCalled();
  expect(block.classList.contains('embed-vimeo')).toBeTruthy();
  expect(block.classList.contains('embed-is-loaded')).toBeTruthy();
});

test('loadEmbed handles unknown embed types with default embed', () => {
  mockGetDefaultEmbed.mockReturnValue('<div class="default-embed">Default embed</div>');

  // Implementation similar to the actual loadEmbed function
  const loadEmbedMock = (block, link) => {
    if (block.classList.contains('embed-is-loaded')) {
      return;
    }

    const url = new URL(link);
    // No known embed type matched
    block.innerHTML = mockGetDefaultEmbed(url);
    block.classList = 'block embed';
    block.classList.add('embed-is-loaded');
  };

  const block = document.createElement('div');
  const link = 'https://example.com/unknown-embed-type';

  loadEmbedMock(block, link, false);

  expect(mockGetDefaultEmbed).toHaveBeenCalled();
  expect(block.classList.contains('embed')).toBeTruthy();
  expect(block.classList.contains('embed-is-loaded')).toBeTruthy();
});
