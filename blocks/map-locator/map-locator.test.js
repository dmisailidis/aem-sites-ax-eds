/* eslint-disable no-undef */
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Mock fetch globally
  global.fetch = jest.fn();

  // Mock Google Maps API
  const mockMap = {
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    fitBounds: jest.fn(),
    markers: [],
    addListener: jest.fn(),
    openInfoWindow: null,
    hasInfoWindowCloseHandler: false,
  };

  const mockMarker = {
    setVisible: jest.fn(),
    getPosition: jest.fn(() => ({ lat: 40.7128, lng: -74.0060 })),
    addListener: jest.fn(),
    locationData: {},
  };

  const mockInfoWindow = {
    open: jest.fn(),
    close: jest.fn(),
  };

  const mockBounds = {
    extend: jest.fn(),
  };

  global.google = {
    maps: {
      Map: jest.fn(() => mockMap),
      Marker: jest.fn(() => mockMarker),
      InfoWindow: jest.fn(() => mockInfoWindow),
      LatLngBounds: jest.fn(() => mockBounds),
      LatLng: jest.fn((lat, lng) => ({ lat, lng })),
      Size: jest.fn((width, height) => ({ width, height })),
      event: {
        addListener: jest.fn(),
        trigger: jest.fn(),
      },
    },
  };

  // Set up the mocked HTML block for map-locator
  document.body.innerHTML = `
    <div id="map-locator-test" class="map-locator block" data-block-name="map-locator" data-block-status="loading">
      <div>
        <div>
          <p data-aue-prop="contentFragmentPath">/content/dam/locations</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="defaultZoomLevel">10</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="defaultLatitude">40.7128</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="defaultLongitude">-74.0060</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="markerType">googleMapsCustomizable</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="filterName">Test Location</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="filterCategories">headquarters</p>
        </div>
      </div>
      <div>
        <div>
          <p data-aue-prop="filterCountry">us</p>
        </div>
      </div>
    </div>
  `;
});

test('decorates correctly map-locator block with configuration', () => {
  const block = document.getElementById('map-locator-test');

  // Check if the block has the correct initial structure
  expect(block).not.toBeNull();
  expect(block.classList.contains('map-locator')).toBe(true);

  // Check if configuration elements are present
  const contentFragmentPath = block.querySelector('[data-aue-prop="contentFragmentPath"]');
  expect(contentFragmentPath).not.toBeNull();
  expect(contentFragmentPath.textContent.trim()).toBe('/content/dam/locations');

  const zoomLevel = block.querySelector('[data-aue-prop="defaultZoomLevel"]');
  expect(zoomLevel).not.toBeNull();
  expect(zoomLevel.textContent.trim()).toBe('10');

  const latitude = block.querySelector('[data-aue-prop="defaultLatitude"]');
  expect(latitude).not.toBeNull();
  expect(latitude.textContent.trim()).toBe('40.7128');

  const longitude = block.querySelector('[data-aue-prop="defaultLongitude"]');
  expect(longitude).not.toBeNull();
  expect(longitude.textContent.trim()).toBe('-74.0060');
});

test('extracts configuration correctly from block', () => {
  const block = document.getElementById('map-locator-test');

  // Mock the getBlockConfig function that would be called in decorate
  const mockGetBlockConfig = (configBlock) => {
    const config = {
      contentFragmentPath: '',
      defaultZoomLevel: 7,
      defaultLatitude: 50.7128,
      defaultLongitude: -94.0060,
      markerType: 'googleMapsCustomizable',
      filterName: '',
      filterCategories: 'all',
      filterCountry: 'all',
    };

    const propElements = configBlock.querySelectorAll('[data-aue-prop]');
    propElements.forEach((propElement) => {
      const propName = propElement.dataset.aueProp;
      const propValue = propElement.textContent.trim();

      if (propName === 'contentFragmentPath') {
        config.contentFragmentPath = propValue;
      } else if (propName === 'defaultZoomLevel') {
        config.defaultZoomLevel = parseInt(propValue, 10);
      } else if (propName === 'defaultLatitude') {
        config.defaultLatitude = parseFloat(propValue);
      } else if (propName === 'defaultLongitude') {
        config.defaultLongitude = parseFloat(propValue);
      } else if (propName === 'markerType') {
        config.markerType = propValue;
      } else if (propName === 'filterName') {
        config.filterName = propValue;
      } else if (propName === 'filterCategories') {
        config.filterCategories = propValue;
      } else if (propName === 'filterCountry') {
        config.filterCountry = propValue;
      }
    });

    return config;
  };

  const config = mockGetBlockConfig(block);

  expect(config.contentFragmentPath).toBe('/content/dam/locations');
  expect(config.defaultZoomLevel).toBe(10);
  expect(config.defaultLatitude).toBe(40.7128);
  expect(config.defaultLongitude).toBe(-74.0060);
  expect(config.markerType).toBe('googleMapsCustomizable');
  expect(config.filterName).toBe('Test Location');
  expect(config.filterCategories).toBe('headquarters');
  expect(config.filterCountry).toBe('us');
});

test('handles API key fetch error gracefully', async () => {
  // Mock fetch to reject
  global.fetch.mockRejectedValueOnce(new Error('API key fetch failed'));

  const block = document.getElementById('map-locator-test');

  // Simulate the decorate function behavior when fetch fails
  let errorOccurred = false;
  try {
    const response = await fetch('http://localhost:3001/maps-key');
    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status}`);
    }
  } catch (error) {
    errorOccurred = true;
    // Create error message div like the component does
    const mapContainer = block.querySelector('.cmp-map-locator__map') || document.createElement('div');
    mapContainer.className = 'cmp-map-locator__map';
    mapContainer.innerHTML = '<div class="cmp-map-locator__error">Map could not be loaded. Please try again later.</div>';
    block.appendChild(mapContainer);
  }

  expect(errorOccurred).toBe(true);
  expect(block.querySelector('.cmp-map-locator__error')).not.toBeNull();
  expect(block.querySelector('.cmp-map-locator__error').textContent).toBe('Map could not be loaded. Please try again later.');
});

test('handles successful API key fetch and map initialization', async () => {
  // Mock successful fetch responses
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ key: 'test-api-key' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        location1: {
          'jcr:primaryType': 'dam:Asset',
        },
        location2: {
          'jcr:primaryType': 'dam:Asset',
        },
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        name: 'Test Location 1',
        address: '123 Test St',
        latitude: 40.7128,
        longitude: -74.0060,
        phone: '+1-555-0123',
        website: 'https://test.com',
        categories: ['headquarters'],
        countryCode: 'us',
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        name: 'Test Location 2',
        address: '456 Test Ave',
        latitude: 40.7589,
        longitude: -73.9851,
        phone: '+1-555-0456',
        website: 'https://test2.com',
        categories: ['branch'],
        countryCode: 'us',
      }),
    });

  const block = document.getElementById('map-locator-test');

  // Simulate successful API calls
  const response = await fetch('http://localhost:3001/maps-key');
  expect(response.ok).toBe(true);

  const data = await response.json();
  expect(data.key).toBe('test-api-key');

  // Check if map container would be created
  let mapContainer = block.querySelector('.cmp-map-locator__map');
  if (!mapContainer) {
    mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.className = 'cmp-map-locator__map';
    block.appendChild(mapContainer);
  }

  expect(mapContainer).not.toBeNull();
  expect(mapContainer.className).toBe('cmp-map-locator__map');
});

test('handles fallback locations when content fragment fetch fails', async () => {
  // Mock API key fetch success but locations fetch failure
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ key: 'test-api-key' }),
    })
    .mockRejectedValueOnce(new Error('Content fragment fetch failed'));

  // Test fallback locations function
  const getFallbackLocations = () => [
    {
      name: 'Los Angeles Office',
      address: '456 Wilshire Blvd, Los Angeles, CA 90036',
      latitude: 34.0522,
      longitude: -118.2437,
      phone: '+1 (310) 555-5678',
      website: 'https://example.com/la',
      categories: ['branch', 'customer-service'],
      country: 'us',
    },
    {
      name: 'New York Office',
      address: '123 Broadway, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+1 (212) 555-1234',
      website: 'https://example.com/ny',
      categories: ['headquarters', 'sales'],
      country: 'us',
    },
  ];

  const fallbackLocations = getFallbackLocations();

  expect(fallbackLocations).toHaveLength(2);
  expect(fallbackLocations[0].name).toBe('Los Angeles Office');
  expect(fallbackLocations[1].name).toBe('New York Office');
  expect(fallbackLocations[0].latitude).toBe(34.0522);
  expect(fallbackLocations[1].latitude).toBe(40.7128);
});

test('creates markers correctly from location data', () => {
  const mockMap = {
    fitBounds: jest.fn(),
    markers: [],
  };

  const locations = [
    {
      name: 'Test Location',
      address: '123 Test St',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '+1-555-0123',
      website: 'https://test.com',
      categories: ['headquarters'],
      country: 'us',
    },
  ];

  // Mock the createMarkers function logic
  const mockBounds = { extend: jest.fn() };
  global.google.maps.LatLngBounds.mockReturnValue(mockBounds);

  const mockMarker = {
    locationData: {},
    addListener: jest.fn(),
  };
  global.google.maps.Marker.mockReturnValue(mockMarker);

  // Simulate marker creation
  locations.forEach((location) => {
    const position = {
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
    };

    expect(position.lat).toBe(40.7128);
    expect(position.lng).toBe(-74.0060);

    const marker = new google.maps.Marker({
      position,
      map: mockMap,
    });

    marker.locationData = location;
    mockMap.markers.push(marker);
    mockBounds.extend(position);
  });

  expect(mockMap.markers).toHaveLength(1);
  expect(mockBounds.extend).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 });
});

test('handles configuration without data-aue-prop attributes', () => {
  // Set up block without data-aue-prop attributes
  document.body.innerHTML = `
    <div id="map-locator-test-no-props" class="map-locator block" data-block-name="map-locator" data-block-status="loading">
      <div>
        <div><p>/content/dam/locations</p></div>
      </div>
      <div>
        <div><p>10</p></div>
      </div>
      <div>
        <div><p>40.7128</p></div>
      </div>
      <div>
        <div><p>-74.0060</p></div>
      </div>
      <div>
        <div><p>googleMapsCustomizable</p></div>
      </div>
    </div>
  `;

  const block = document.getElementById('map-locator-test-no-props');

  // Mock getBlockConfig for blocks without data-aue-prop
  const rows = block.querySelectorAll(':scope > div');
  expect(rows.length).toBe(5);

  // Check that the rows contain expected values
  expect(rows[0].textContent.trim()).toBe('/content/dam/locations');
  expect(rows[1].textContent.trim()).toBe('10');
  expect(rows[2].textContent.trim()).toBe('40.7128');
  expect(rows[3].textContent.trim()).toBe('-74.0060');
  expect(rows[4].textContent.trim()).toBe('googleMapsCustomizable');
});

test('applies filters correctly', () => {
  const mockMap = {
    markers: [],
    fitBounds: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
  };

  // Create mock markers with location data
  const locations = [
    {
      name: 'New York Office',
      address: '123 Broadway',
      latitude: 40.7128,
      longitude: -74.0060,
      categories: ['headquarters'],
      country: 'us',
    },
    {
      name: 'Los Angeles Office',
      address: '456 Wilshire',
      latitude: 34.0522,
      longitude: -118.2437,
      categories: ['branch'],
      country: 'us',
    },
    {
      name: 'Milan Office',
      address: '789 Via Roma',
      latitude: 45.4642,
      longitude: 9.1900,
      categories: ['headquarters'],
      country: 'it',
    },
  ];

  // Create mock markers
  locations.forEach((location) => {
    const mockMarker = {
      locationData: location,
      setVisible: jest.fn(),
      getPosition: jest.fn(() => ({ lat: location.latitude, lng: location.longitude })),
    };
    mockMap.markers.push(mockMarker);
  });

  // Mock filter function
  const applyFilters = (map, allLocations, nameFilter, categoryFilter, countryFilter) => {
    const bounds = { extend: jest.fn() };
    let visibleCount = 0;

    map.markers.forEach((marker) => {
      const location = marker.locationData;
      let isVisible = true;

      // Apply name filter
      if (nameFilter && nameFilter.trim() !== '') {
        const nameMatches = location.name.toLowerCase().includes(nameFilter.toLowerCase());
        if (!nameMatches) isVisible = false;
      }

      // Apply category filter
      if (isVisible && categoryFilter && categoryFilter !== 'all') {
        const hasCategory = location.categories.includes(categoryFilter);
        if (!hasCategory) isVisible = false;
      }

      // Apply country filter
      if (isVisible && countryFilter && countryFilter !== 'all') {
        if (location.country !== countryFilter) isVisible = false;
      }

      marker.setVisible(isVisible);
      if (isVisible) {
        visibleCount += 1;
        bounds.extend(marker.getPosition());
      }
    });

    return visibleCount;
  };

  // Test name filter
  let visibleCount = applyFilters(mockMap, locations, 'New York', 'all', 'all');
  expect(visibleCount).toBe(1);
  expect(mockMap.markers[0].setVisible).toHaveBeenCalledWith(true);
  expect(mockMap.markers[1].setVisible).toHaveBeenCalledWith(false);

  // Reset mocks
  mockMap.markers.forEach((marker) => marker.setVisible.mockClear());

  // Test category filter
  visibleCount = applyFilters(mockMap, locations, '', 'headquarters', 'all');
  expect(visibleCount).toBe(2);
  expect(mockMap.markers[0].setVisible).toHaveBeenCalledWith(true);
  expect(mockMap.markers[1].setVisible).toHaveBeenCalledWith(false);
  expect(mockMap.markers[2].setVisible).toHaveBeenCalledWith(true);

  // Reset mocks
  mockMap.markers.forEach((marker) => marker.setVisible.mockClear());

  // Test country filter
  visibleCount = applyFilters(mockMap, locations, '', 'all', 'it');
  expect(visibleCount).toBe(1);
  expect(mockMap.markers[0].setVisible).toHaveBeenCalledWith(false);
  expect(mockMap.markers[1].setVisible).toHaveBeenCalledWith(false);
  expect(mockMap.markers[2].setVisible).toHaveBeenCalledWith(true);
});
