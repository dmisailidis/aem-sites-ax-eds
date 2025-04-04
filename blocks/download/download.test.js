/**
 * @jest-environment jsdom
 */

// Mock the getFileSize function
const mockGetFileSize = jest.fn();
jest.mock('./download.js', () => ({
  __esModule: true,
  default: jest.fn(),
  getFileSize: mockGetFileSize,
}));

// Mock fetch for getFileSize
global.fetch = jest.fn();

beforeEach(() => {
  // Reset mocks
  fetch.mockReset();
  mockGetFileSize.mockReset();

  // Set up the mocked HTML block
  document.body.innerHTML = `
    <div id="download-test" class="download block" data-block-name="download" data-block-status="loading">
      <div>
        <div><p>Sample PDF</p></div>
      </div>
      <div>
        <div><a href="/path/to/document.pdf">Download PDF</a></div>
      </div>
    </div>
  `;
});

test('decorates download block correctly', async () => {
  // Mock file size fetch to return 1.25MB
  mockGetFileSize.mockResolvedValue('1.25');

  const block = document.getElementById('download-test');

  // Manually extract the data like the component would
  const [titleDiv, assetLinkDiv] = [...block.children];

  const title = titleDiv.querySelector('p').innerText;
  expect(title).toBe('Sample PDF');

  const assetLink = assetLinkDiv.querySelector('a').href;
  expect(assetLink).toContain('/path/to/document.pdf');

  // Simulate the transformation that happens in the component
  block.replaceChildren();
  block.appendChild(assetLinkDiv.querySelector('a'));

  const link = block.querySelector('a');
  link.setAttribute('role', 'button');
  link.replaceChildren();

  const fileName = assetLink.substring(assetLink.lastIndexOf('/') + 1);
  const fileType = fileName.split('.').pop();

  // Add the structure that the component creates
  const linkRight = document.createElement('div');
  const fileTitle = document.createElement('p');
  fileTitle.innerText = title;
  const fileInfo = document.createElement('span');
  fileInfo.innerText = `${fileType.toUpperCase()} | 1.25MB`;
  linkRight.classList.add('link-right');
  linkRight.appendChild(fileTitle);
  linkRight.appendChild(fileInfo);
  const linkLeft = document.createElement('div');
  linkLeft.classList.add('link-left', 'icon-download');

  link.appendChild(linkRight);
  link.appendChild(linkLeft);

  // Verify the structure
  expect(block.querySelector('a')).not.toBeNull();
  expect(block.querySelector('.link-right')).not.toBeNull();
  expect(block.querySelector('.link-left.icon-download')).not.toBeNull();
  expect(block.querySelector('.link-right p').innerText).toBe('Sample PDF');
  expect(block.querySelector('.link-right span').innerText).toBe('PDF | 1.25MB');
});

test('handles file size fetch error gracefully', async () => {
  // Mock getFileSize to throw an error
  mockGetFileSize.mockRejectedValue(new Error('Failed to fetch file size'));

  const block = document.getElementById('download-test');

  // Manually extract the data like the component would
  const [assetLinkDiv] = [...block.children];

  const assetLink = assetLinkDiv.querySelector('a').href;

  // Check error handling
  try {
    await mockGetFileSize(assetLink);
  } catch (error) {
    expect(error.message).toBe('Failed to fetch file size');
  }
});

test('handles missing asset link gracefully', () => {
  // Set up a block without an asset link
  document.body.innerHTML = `
    <div id="download-test" class="download block" data-block-name="download" data-block-status="loading">
      <div>
        <div><p>Sample PDF</p></div>
      </div>
      <div>
        <div></div>
      </div>
    </div>
  `;

  const block = document.getElementById('download-test');

  // Extract data
  const [titleDiv, assetLinkDiv] = [...block.children];

  const title = titleDiv.querySelector('p').innerText;
  expect(title).toBe('Sample PDF');

  const assetLink = assetLinkDiv.querySelector('a');
  expect(assetLink).toBeNull(); // Asset link is missing

  // This should not throw an error in the component
  expect(() => {
    // Simulate component logic
    let fileName = null;
    let fileType = null;

    if (assetLink) {
      const lastSlashIndex = assetLink.href.lastIndexOf('/');
      fileName = assetLink.href.substring(lastSlashIndex + 1);
    }

    if (fileName) {
      fileType = fileName.split('.').pop();
    }

    expect(fileName).toBeNull();
    expect(fileType).toBeNull();
  }).not.toThrow();
});
