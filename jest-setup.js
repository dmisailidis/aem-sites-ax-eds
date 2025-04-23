/* eslint-disable max-classes-per-file */
// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.mockEntries = [];
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Utility to trigger a mock intersection
  triggerIntersection(entries) {
    this.callback(entries, this);
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
}

window.ResizeObserver = MockResizeObserver;

// Handle timers cleanup to prevent open handle issues
afterEach(() => {
  // Clear any timers that might be active
  jest.clearAllTimers();
});

// Mock console error/warn to keep test output clean, but allow
// checking if errors/warnings were logged
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Create a Mock for window.hlx environment
window.hlx = {
  codeBasePath: '',
  RUM_MASK_URL: 'full',
  lighthouse: false,
  rum: { sampleRUM: jest.fn() },
};
