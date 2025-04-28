/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* global google */
export default async function decorate(block) {
  // Extract configuration from block properties
  const blockConfig = getBlockConfig(block);

  // Set up the component structure
  setupComponentStructure(block, blockConfig);

  // Create map container if it doesn't exist
  let mapContainer = block.querySelector('.cmp-map-locator__map');
  if (!mapContainer) {
    mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.className = 'cmp-map-locator__map';
    block.appendChild(mapContainer);
  }

  try {
    // Fetch the API key from our endpoint
    const response = await fetch('http://localhost:3001/maps-key');

    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status}`);
    }

    const data = await response.json();
    if (!data.key) {
      throw new Error('API key not found in response');
    }

    // Use the fetched API key
    blockConfig.googleMapApiKey = data.key;

    console.log('BLOCK CONFIG:', blockConfig);

    // Load Google Maps API (using API key from CA Config)
    await loadGoogleMapsApi(blockConfig.googleMapApiKey);

    // Add a small delay to ensure API is fully initialized
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Only proceed if Google Maps API loaded successfully
    if (window.google && window.google.maps) {
      // Parse the latitude, longitude, and zoom from the config
      const defaultLatitude = parseFloat(blockConfig.defaultLatitude);
      const defaultLongitude = parseFloat(blockConfig.defaultLongitude);
      const defaultZoomLevel = parseInt(blockConfig.defaultZoomLevel, 10);

      // Initialize map with the parsed values
      const map = initMap(
        mapContainer,
        defaultLatitude,
        defaultLongitude,
        defaultZoomLevel,
      );

      if (!map) {
        throw new Error('Failed to initialize Google Map');
      }

      // Load location data from Content Fragments
      if (!blockConfig.contentFragmentPath) {
        console.error('Content Fragment Path is not specified in component properties');
      }
      const locations = await fetchLocationData(blockConfig.contentFragmentPath);

      console.log('LOCATIONS:', locations);

      // Create markers for locations
      if (locations && locations.length > 0) {
        createMarkers(
          map,
          locations,
          blockConfig.markerType,
          blockConfig.svgUpload,
        );
      }

      const checkName = !!blockConfig.filterName.trim();
      const checkCategories = blockConfig.filterCategories && blockConfig.filterCategories !== 'all';
      const checkCountry = blockConfig.filterCountry && blockConfig.filterCountry !== 'all';
      console.log('Check name', checkName);
      console.log('Check categories', checkCategories);
      console.log('Check country', checkCountry);

      // Initialize filters
      if (checkName || checkCategories || checkCountry) {
        initFilters(
          block,
          map,
          locations,
          blockConfig.filterName.trim(),
          blockConfig.filterCategories,
          blockConfig.filterCountry,
        );
      }
    } else {
      console.error('Map Locator: Google Maps API failed to load');
      // Add a fallback message to the container
      mapContainer.innerHTML = '<div class="cmp-map-locator__error">Map could not be loaded. Please try again later.</div>';
    }
  } catch (error) {
    console.error('Map Locator: Error initializing map', error);
    // Add an error message to the container
    mapContainer.innerHTML = '<div class="cmp-map-locator__error">Map could not be loaded. Please try again later.</div>';
  }
}

/**
 * Extract configuration from block
 * @param {HTMLElement} block - Component block element
 * @returns {Object} - Configuration object
 */
function getBlockConfig(block) {
  // Create a default config object
  const config = {
    googleMapApiKey: '', // Will be fetched from API
    proximityRadius: '1000',
    countryCode: 'US',
    defaultZoomLevel: 7,
    defaultLatitude: 50.7128,
    defaultLongitude: -94.0060,
    markerType: 'googleMapsCustomizable',
    svgUpload: '',
    contentFragmentPath: '',
    filterName: '',
    filterCategories: '',
    filterCountry: '',
  };

  try {
    // Look for paragraphs with data-aue attributes
    const propElements = block.querySelectorAll('[data-aue-prop]');

    propElements.forEach((propElement) => {
      propElement.style.display = 'none'; // Hide the element
      const propName = propElement.dataset.aueProp;
      const propValue = propElement.textContent.trim();

      // Handle specific properties
      if (propName === 'contentFragmentPath') {
        config.contentFragmentPath = propValue;
      } else if (propName === 'defaultZoomLevel') {
        config.defaultZoomLevel = parseInt(propValue, 10);
      } else if (propName === 'defaultLatitude') {
        config.defaultLatitude = parseFloat(propValue);
      } else if (propName === 'defaultLongitude') {
        config.defaultLongitude = parseFloat(propValue);
      } else if (propName === 'markerType') {
        config.markerType = propValue || 'googleMapsCustomizable';
      } else if (propName === 'filterName') {
        config.filterName = propValue;
      } else if (propName === 'filterCategories') {
        config.filterCategories = propValue;
      } else if (propName === 'filterCountry') {
        config.filterCountry = propValue;
      } else if (propName === 'svgUpload') {
        config.svgUpload = propValue;
      }
    });

    // Specifically look for content fragment path
    const contentFragmentInput = block.querySelector('[data-aue-prop="contentFragmentPath"]');
    if (contentFragmentInput) {
      config.contentFragmentPath = contentFragmentInput.textContent.trim();
    }

    // Also look for direct links to content fragments
    const contentFragmentLinks = block.querySelectorAll('a[href^="/content/dam/"]');
    if (contentFragmentLinks.length > 0) {
      config.contentFragmentPath = contentFragmentLinks[0].getAttribute('href');

      // Hide these links in the UI
      contentFragmentLinks.forEach((link) => {
        link.style.display = 'none';
      });
    }
  } catch (error) {
    console.error('Error extracting configuration:', error);
  }

  return config;
}

/**
 * Setup component structure based on configuration
 * @param {HTMLElement} block - Component block element
 * @param {Object} config - Component configuration
 */
function setupComponentStructure(block, config) {
  // Add component class if not already present
  block.classList.add('cmp-map-locator');
  block.setAttribute('data-js', 'cmp-map-locator');

  if (config.id) {
    block.id = config.id;
  }

  // Create filters container if filters are enabled
  if (config.showFilters) {
    let filtersContainer = block.querySelector('.cmp-map-locator__filters');
    if (!filtersContainer) {
      filtersContainer = document.createElement('div');
      filtersContainer.className = 'cmp-map-locator__filters';
      filtersContainer.setAttribute('data-js', 'filter__selection');
      block.appendChild(filtersContainer);

      // Setup search filter if enabled
      if (config.enableSearchFilter) {
        const searchFilterContainer = document.createElement('div');
        searchFilterContainer.className = 'cmp-map-locator__filters-searchfilter';

        const searchLabel = document.createElement('span');
        searchLabel.className = 'cmp-map-locator__filters-searchfilter--label';
        searchLabel.textContent = config.searchFilterTitle;

        const searchInput = document.createElement('input');
        searchInput.id = 'cmp-map-locator__filters-searchfilter--input';
        searchInput.className = 'cmp-map-locator__filters-searchfilter--input';
        searchInput.placeholder = config.searchFilterInitText;

        searchFilterContainer.appendChild(searchLabel);
        searchFilterContainer.appendChild(searchInput);
        filtersContainer.appendChild(searchFilterContainer);
      }

      // Setup tag filters container
      const tagFiltersContainer = document.createElement('div');
      tagFiltersContainer.className = 'cmp-map-locator__filters-tagfiters';

      // Add filter categories (will be populated with data later)
      config.filterCategories.forEach((category) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = `cmp-map-locator__filters-tagfiters--${category.title}`;

        const categoryTitle = document.createElement('h5');
        categoryTitle.className = `cmp-map-locator__filters-tagfiters--${category.title}-title`;
        categoryTitle.textContent = category.title;

        const categoryInputs = document.createElement('div');
        categoryInputs.className = `cmp-map-locator__filters-tagfiters--${category.title}-input`;
        categoryInputs.setAttribute('data-js', 'filter-category-inputs');

        categoryContainer.appendChild(categoryTitle);
        categoryContainer.appendChild(categoryInputs);
        tagFiltersContainer.appendChild(categoryContainer);
      });

      // Add filter buttons
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'cmp-map-locator__filters-buttons';

      const clearButton = document.createElement('button');
      clearButton.setAttribute('data-js', 'filter__cancel-btn-toggle');
      clearButton.className = 'filter__cancel-btn';
      clearButton.textContent = config.clearFilters;

      const showResultsButton = document.createElement('button');
      showResultsButton.setAttribute('data-js', 'filter__show-results-link');
      showResultsButton.className = 'filter__show-results';
      showResultsButton.textContent = config.showResults;

      buttonsContainer.appendChild(clearButton);
      buttonsContainer.appendChild(showResultsButton);
      tagFiltersContainer.appendChild(buttonsContainer);

      filtersContainer.appendChild(tagFiltersContainer);
    }
  }
}

/**
 * Load Google Maps API
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise} - Resolves when API is loaded
 */
function loadGoogleMapsApi(apiKey) {
  return new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Map
 * @param {HTMLElement} container - Map container element
 * @param {number} lat - Default latitude
 * @param {number} lng - Default longitude
 * @param {number} zoom - Default zoom level
 * @returns {Object} - Google Maps instance
 */
function initMap(container, lat, lng, zoom) {
  // Make sure Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Map Locator: Google Maps API not loaded');
    return null;
  }

  const mapOptions = {
    center: { lat, lng },
    zoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  };

  try {
    // Create the map instance
    return new google.maps.Map(container, mapOptions);
  } catch (error) {
    console.error('Error creating Google Map:', error);
    return null;
  }
}

/**
 * Fetch location data from Content Fragments
 * @param {string} contentFragmentPath - Path to the content fragments
 * @returns {Promise<Array>} - Array of location objects
 */
async function fetchLocationData(contentFragmentPath) {
  try {
    // Check if path exists
    if (!contentFragmentPath) {
      throw new Error('Content Fragment Path is not specified');
    }

    // Clean up the path
    let cleanPath = contentFragmentPath;
    cleanPath = cleanPath.replace(/\.(html|json)$/g, '');

    // First, get the folder structure
    const folderEndpoint = `${cleanPath}.1.json`;

    const folderResponse = await fetch(folderEndpoint);
    if (!folderResponse.ok) {
      throw new Error(`Failed to fetch folder structure: ${folderResponse.status} ${folderResponse.statusText}`);
    }

    const folderData = await folderResponse.json();

    // Extract content fragment paths
    const fragmentPaths = [];

    Object.keys(folderData).forEach((key) => {
      // Skip metadata properties and jcr:content
      if (key.startsWith('jcr:') || key === 'jcr:content') {
        return;
      }

      // Check if it's a content fragment (dam:Asset)
      const item = folderData[key];
      if (item && item['jcr:primaryType'] === 'dam:Asset') {
        fragmentPaths.push(key);
      }
    });

    // Now fetch each content fragment's data
    const locations = [];

    // Use Promise.all to fetch all fragments in parallel
    await Promise.all(fragmentPaths.map(async (fragmentPath) => {
      try {
        // Construct the path to the master data
        const fragmentEndpoint = `${cleanPath}/${fragmentPath}/jcr:content/data/master.json`;

        const fragmentResponse = await fetch(fragmentEndpoint);
        if (!fragmentResponse.ok) {
          console.warn(`Failed to fetch fragment ${fragmentPath}: ${fragmentResponse.status}`);
          return;
        }

        const fragmentData = await fragmentResponse.json();

        // Extract location data
        const location = {
          name: fragmentData.name || fragmentData.title || fragmentPath,
          address: fragmentData.address || '',
          latitude: parseFloat(fragmentData.latitude || 0),
          longitude: parseFloat(fragmentData.longitude || 0),
          phone: fragmentData.phone || '',
          website: fragmentData.website || '',
          categories: Array.isArray(fragmentData.categories) ? fragmentData.categories : [],
        };

        if (location.latitude && location.longitude) {
          locations.push(location);
        }
      } catch (err) {
        console.warn(`Error processing fragment ${fragmentPath}:`, err.message);
      }
    }));

    if (locations.length === 0) {
      console.warn('No valid locations found - using fallback data');
      return getFallbackLocations();
    }

    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return getFallbackLocations();
  }
}

/**
 * Get fallback location data
 * @returns {Array} - Array of fallback location objects
 */
function getFallbackLocations() {
  return [
    {
      name: 'New York Office (Fallback)',
      address: '123 Broadway, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '+1 (212) 555-1234',
      website: 'https://example.com/ny',
      categories: ['headquarters', 'sales'],
      countryCode: 'US',
    },
    {
      name: 'Los Angeles Office (Fallback)',
      address: '456 Wilshire Blvd, Los Angeles, CA 90036',
      latitude: 34.0522,
      longitude: -118.2437,
      phone: '+1 (310) 555-5678',
      website: 'https://example.com/la',
      categories: ['branch', 'customer-service'],
      countryCode: 'IT',
    },
  ];
}

/**
 * Create map markers for locations
 * @param {Object} map - Google Maps instance
 * @param {Array} locations - Array of location objects
 * @param {string} markerType - Type of marker to use
 * @param {string} svgPath - Path to custom marker SVG
 */
function createMarkers(map, locations, markerType, svgPath) {
  // Make sure Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Map Locator: Google Maps API not loaded');
    return;
  }

  // Make sure map is valid
  if (!map) {
    console.error('Map Locator: Invalid map instance');
    return;
  }

  try {
    const bounds = new google.maps.LatLngBounds();
    const markers = [];

    locations.forEach((location) => {
      const position = {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      };

      // Skip invalid coordinates
      if (Number.isNaN(position.lat) || Number.isNaN(position.lng)) {
        return;
      }

      let marker;

      if (markerType === 'customSVG' && svgPath) {
        // Custom SVG marker
        marker = new google.maps.Marker({
          position,
          map,
          icon: {
            url: svgPath,
            scaledSize: new google.maps.Size(32, 32),
          },
        });
      } else {
        // Default marker
        marker = new google.maps.Marker({
          position,
          map,
        });
      }

      // Store location data with marker
      marker.locationData = location;
      markers.push(marker);

      // Add to bounds for auto-centering
      bounds.extend(position);

      // Add info window or custom tooltip
      addInfoWindow(map, marker, location);
    });

    // Auto-center map to show all markers
    if (markers.length > 0) {
      map.fitBounds(bounds);
    }

    // Store markers in the map object for later use
    map.markers = markers;
  } catch (error) {
    console.error('Error creating markers:', error);
  }
}

/**
 * Add standard info window to marker
 * @param {Object} map - Google Maps instance
 * @param {Object} marker - Marker instance
 * @param {Object} location - Location data
 */
function addInfoWindow(map, marker, location) {
  // Make sure Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Map Locator: Google Maps API not loaded');
    return;
  }

  try {
    const infoContent = `
      <div>
        <h3>${location.name || ''}</h3>
        <p>${location.address || ''}</p>
        ${location.phone ? `<p>Phone: ${location.phone}</p>` : ''}
        ${
  location.website
    ? `<p><a href="${location.website}" target="_blank">Website</a></p>`
    : ''
}
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  } catch (error) {
    console.error('Error creating info window:', error);
  }
}

/**
 * Initialize filter functionality
 * @param {HTMLElement} block - Component block element
 * @param {Object} map - Google Maps instance
 * @param {Array} locations - Array of location objects
 * @param {Array} filterCategories - Array of filter category objects
 * @param {boolean} enableSearchFilter - Whether search filter is enabled
 */
function initFilters(block, map, locations, filterName, filterCategories, filterCountry) {
  // Make sure Google Maps API is loaded
  console.log('--------Filter functionality--------');
  console.log('Map:', map);
  console.log('Locations:', locations);
  console.log('Filter name:', filterName);
  console.log('Filter categories:', filterCategories);
  console.log('Filter country:', filterCountry);

  const filtersContainer = block.querySelector('.cmp-map-locator__filters');
  if (!filtersContainer) return;

  const searchInput = filtersContainer.querySelector(
    '.cmp-map-locator__filters-searchfilter--input',
  );

  // Create filter tag elements if needed
  filterCategories.forEach((category) => {
    const categoryInputsContainer = filtersContainer.querySelector(
      `.cmp-map-locator__filters-tagfiters--${category.title}-input`,
    );
    if (!categoryInputsContainer) return;

    // Clear existing filter elements
    categoryInputsContainer.innerHTML = '';

    // Add filter elements
    Object.entries(category.filterTags).forEach(([tagName, tagId]) => {
      const filterElement = document.createElement('div');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = tagId;
      checkbox.dataset.categoryId = tagId;
      checkbox.value = tagId;

      const label = document.createElement('label');
      label.htmlFor = tagId;
      label.textContent = tagName;

      filterElement.appendChild(checkbox);
      filterElement.appendChild(label);
      categoryInputsContainer.appendChild(filterElement);
    });
  });

  // Get all category inputs after they've been created
  const categoryInputs = filtersContainer.querySelectorAll('[data-category-id]');

  // Set up event listeners

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters(map, locations, searchInput, categoryInputs);
    });
  }

  // Category filters
  categoryInputs.forEach((input) => {
    input.addEventListener('change', () => {
      applyFilters(map, locations, searchInput, categoryInputs);
    });
  });

  // Clear filters button
  const clearButton = filtersContainer.querySelector(
    '[data-js="filter__cancel-btn-toggle"]',
  );
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      categoryInputs.forEach((input) => {
        input.checked = false;
      });
      applyFilters(map, locations, searchInput, categoryInputs);
    });
  }

  // Show results button
  const showResultsButton = filtersContainer.querySelector(
    '[data-js="filter__show-results-link"]',
  );
  if (showResultsButton) {
    showResultsButton.addEventListener('click', () => {
      applyFilters(map, locations, searchInput, categoryInputs);
    });
  }
}

/**
 * Apply filters to map markers
 * @param {Object} map - Google Maps instance
 * @param {Array} locations - Array of location objects
 * @param {HTMLInputElement} searchInput - Search input element
 * @param {NodeList} categoryInputs - Category filter input elements
 */
function applyFilters(map, locations, searchInput, categoryInputs) {
  // Make sure Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Map Locator: Google Maps API not loaded');
    return;
  }

  // Make sure the map and markers exist
  if (!map || !map.markers) {
    console.error('Map Locator: Invalid map or markers');
    return;
  }

  try {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    // Get selected category filters
    const selectedCategories = {};
    categoryInputs.forEach((input) => {
      if (input.checked) {
        const category = input.dataset.categoryId;
        selectedCategories[category] = true;
      }
    });

    const hasSelectedCategories = Object.keys(selectedCategories).length > 0;

    // Filter and update markers
    const bounds = new google.maps.LatLngBounds();
    let visibleMarkers = 0;

    map.markers.forEach((marker) => {
      const location = marker.locationData;
      let visible = true;

      // Apply search filter
      if (searchTerm) {
        const matchesSearch = (location.name && location.name.toLowerCase().includes(searchTerm))
          || (location.address
            && location.address.toLowerCase().includes(searchTerm))
          || (location.city && location.city.toLowerCase().includes(searchTerm))
          || (location.state
            && location.state.toLowerCase().includes(searchTerm))
          || (location.zip && location.zip.toLowerCase().includes(searchTerm));

        if (!matchesSearch) {
          visible = false;
        }
      }

      // Apply category filters
      if (visible && hasSelectedCategories) {
        const matchesCategory = location.categories
          && location.categories.some((cat) => selectedCategories[cat]);

        if (!matchesCategory) {
          visible = false;
        }
      }

      // Update marker visibility
      marker.setVisible(visible);

      // Add to bounds if visible
      if (visible) {
        bounds.extend(marker.getPosition());
        visibleMarkers += 1;
      }
    });

    // Update map bounds to show all visible markers
    if (visibleMarkers > 1) {
      map.fitBounds(bounds);
    } else if (visibleMarkers === 1) {
      // If only one marker is visible, zoom in more
      map.setZoom(14);
    }
  } catch (error) {
    console.error('Error applying filters:', error);
  }
}
