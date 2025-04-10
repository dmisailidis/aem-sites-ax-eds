/* eslint-disable no-use-before-define */
/* global google */
export default async function decorate(block) {
  // First, hide any content fragment path links to prevent them from showing
  block.querySelectorAll('a[href^="/content/dam/"]').forEach((link) => {
    link.style.display = 'none';
  });

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
    // Check content fragment path right away
    if (!blockConfig.contentFragmentPath) {
      // Try to find it another way - direct DOM inspection
      const links = block.querySelectorAll('a[href^="/content/dam/"]');
      if (links.length > 0) {
        blockConfig.contentFragmentPath = links[0].getAttribute('href');
        console.log('Found content fragment path from link:', blockConfig.contentFragmentPath);
      } else {
        throw new Error('Content Fragment Path is not specified and could not be found');
      }
    }

    const response = await fetch('http://localhost:3001/maps-key');

    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status}`);
    }

    const data = await response.json();
    if (!data.key) {
      throw new Error('API key not found in response');
    }

    // Use the API key
    blockConfig.googleMapApiKey = data.key;

    // Load Google Maps API
    await loadGoogleMapsApi(blockConfig.googleMapApiKey);

    // Add a small delay to ensure API is fully initialized
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Only proceed if Google Maps API loaded successfully
    if (window.google && window.google.maps) {
      // Initialize map
      const map = initMap(
        mapContainer,
        blockConfig.defaultLatitude,
        blockConfig.defaultLongitude,
        blockConfig.defaultZoomLevel,
      );

      if (!map) {
        throw new Error('Failed to initialize Google Map');
      }

      console.log('Using Content Fragment Path:', blockConfig.contentFragmentPath);

      // Load location data from Content Fragments
      const locations = await fetchLocationData(blockConfig.contentFragmentPath);

      // Create markers for locations
      if (locations && locations.length > 0) {
        createMarkers(
          map,
          locations,
          blockConfig.markerType,
          blockConfig.customTooltip,
          blockConfig.svgUpload,
        );

        console.log(`Added ${locations.length} markers to map`);
      }

      // Initialize filters
      if (blockConfig.showFilters) {
        initFilters(
          block,
          map,
          locations,
          blockConfig.filterCategories,
          blockConfig.enableSearchFilter,
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
    mapContainer.innerHTML = `<div class="cmp-map-locator__error">Map could not be loaded: ${error.message}</div>`;
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
    defaultLatitude: 40.7128,
    defaultLongitude: -74.0060,
    markerType: 'googleMapsCustomizable',
    customTooltip: false,
    showFilters: false,
    enableSearchFilter: false,
    searchFilterTitle: 'Search',
    searchFilterInitText: 'Search locations...',
    clearFilters: 'Clear Filters',
    showResults: 'Show Results',
    svgUpload: '',
    contentFragmentPath: '',
    filterCategories: [],
  };

  try {
    // First, look for the contentFragmentPath specifically
    // This is the most critical field
    const contentFragmentPathRow = [...block.children].find((row) => {
      if (row.children.length < 2) return false;
      const label = row.children[0].textContent.trim();
      return label === 'Location Content Fragments Root Path'
             || label === 'Content Fragment Path'
             || label === 'contentFragmentPath';
    });

    if (contentFragmentPathRow) {
      // For aem-content fields, the value could be in a link or just text
      const valueCell = contentFragmentPathRow.children[1];
      const link = valueCell.querySelector('a');

      if (link) {
        config.contentFragmentPath = link.getAttribute('href') || link.textContent.trim();
        // Hide the link to prevent it from showing on the page
        link.style.display = 'none';
      } else {
        config.contentFragmentPath = valueCell.textContent.trim();
      }

      console.log('Found Content Fragment Path:', config.contentFragmentPath);
    } else {
      console.warn('Content Fragment Path row not found in component properties');
    }

    // Now process all other properties
    [...block.children].forEach((row) => {
      if (row.children.length < 2) return;

      const label = row.children[0].textContent.trim();
      const valueCell = row.children[1];
      const value = valueCell.textContent.trim();

      // Skip the content fragment path as we've already processed it
      if (label === 'Location Content Fragments Root Path'
          || label === 'Content Fragment Path'
          || label === 'contentFragmentPath') {
        return;
      }

      // Process other properties
      switch (label) {
        case 'Default Zoom Level':
        case 'defaultZoomLevel':
          config.defaultZoomLevel = parseInt(value, 10) || 7;
          break;
        case 'Default Latitude':
        case 'defaultLatitude':
          config.defaultLatitude = parseFloat(value) || 40.7128;
          break;
        case 'Default Longitude':
        case 'defaultLongitude':
          config.defaultLongitude = parseFloat(value) || -74.0060;
          break;
        case 'Marker Type':
        case 'markerType':
          config.markerType = value || 'googleMapsCustomizable';
          break;
        case 'Custom Tooltip':
        case 'customTooltip':
          config.customTooltip = value === 'true';
          break;
        case 'Show Filters':
        case 'showFilters':
          config.showFilters = value === 'true';
          break;
        case 'Enable Search Filter':
        case 'enableSearchFilter':
          config.enableSearchFilter = value === 'true';
          break;
        case 'Search Filter Title':
        case 'searchFilterTitle':
          config.searchFilterTitle = value || 'Search';
          break;
        case 'Search Filter Initial Text':
        case 'searchFilterInitText':
          config.searchFilterInitText = value || 'Search locations...';
          break;
        case 'Proximity Radius (meters)':
        case 'proximityRadius':
          config.proximityRadius = value || '1000';
          break;
        case 'Country Code':
        case 'countryCode':
          config.countryCode = value || 'US';
          break;
        case 'Show Results Label':
        case 'showResults':
          config.showResults = value || 'Show Results';
          break;
        case 'Clear Filters Label':
        case 'clearFilters':
          config.clearFilters = value || 'Clear Filters';
          break;
        case 'Custom SVG Marker Upload':
        case 'svgUpload':
          config.svgUpload = value || '';
          break;
        default:
          console.warn(`Unknown configuration label: ${label}`);
          break;
      }
    });
  } catch (error) {
    console.error('Error extracting configuration from block:', error);
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

    console.log(`Fetching location data from: ${contentFragmentPath}`);

    // Determine if we need to add .json extension
    let endpoint = contentFragmentPath;
    if (!endpoint.endsWith('.json')) {
      endpoint = `${endpoint}.json`;
    }

    console.log(`Using endpoint: ${endpoint}`);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      'Content fragments response structure:',
      Object.keys(data),
      data.items ? `Found ${data.items.length} items` : 'No items property',
    );

    // Transform the content fragment data to location objects
    const locations = [];

    // Try different possible structures for AEM Content Fragments JSON

    // Structure 1: Items array with elements property containing fields
    if (data && data.items && Array.isArray(data.items)) {
      console.log('Processing structure with items array');
      data.items.forEach((item) => {
        if (item.elements) {
          const location = {
            name: item.elements.name?.value || '',
            address: item.elements.address?.value || '',
            latitude: parseFloat(item.elements.latitude?.value) || 0,
            longitude: parseFloat(item.elements.longitude?.value) || 0,
            phone: item.elements.phone?.value || '',
            website: item.elements.website?.value || '',
            categories: Array.isArray(item.elements.categories?.value)
              ? item.elements.categories.value
              : [],
          };

          // Only add valid locations with coordinates
          if (location.latitude && location.longitude) {
            locations.push(location);
            console.log('Added location:', location.name);
          }
        }
      });
    }
    // Structure 2: Direct array of content fragments
    else if (data && Array.isArray(data)) {
      console.log('Processing direct array structure');
      data.forEach((item) => {
        const location = {
          name: item.name || '',
          address: item.address || '',
          latitude: parseFloat(item.latitude) || 0,
          longitude: parseFloat(item.longitude) || 0,
          phone: item.phone || '',
          website: item.website || '',
          categories: Array.isArray(item.categories) ? item.categories : [],
        };

        if (location.latitude && location.longitude) {
          locations.push(location);
          console.log('Added location:', location.name);
        }
      });
    }
    // Structure 3: Children property containing content fragments
    else if (data && data.children && Array.isArray(data.children)) {
      console.log('Processing structure with children property');
      data.children.forEach((child) => {
        if (child.elements) {
          const location = {
            name: child.elements.name?.value || '',
            address: child.elements.address?.value || '',
            latitude: parseFloat(child.elements.latitude?.value) || 0,
            longitude: parseFloat(child.elements.longitude?.value) || 0,
            phone: child.elements.phone?.value || '',
            website: child.elements.website?.value || '',
            categories: Array.isArray(child.elements.categories?.value)
              ? child.elements.categories.value
              : [],
          };

          if (location.latitude && location.longitude) {
            locations.push(location);
            console.log('Added location from children:', location.name);
          }
        }
      });
    }
    // Structure 4: Directly examining the data object for properties
    else {
      console.log('Examining raw data for location properties');
      // Attempt to extract a single content fragment directly
      const location = {
        name: data.name || data.elements?.name?.value || '',
        address: data.address || data.elements?.address?.value || '',
        latitude: parseFloat(data.latitude || data.elements?.latitude?.value || 0),
        longitude: parseFloat(data.longitude || data.elements?.longitude?.value || 0),
        phone: data.phone || data.elements?.phone?.value || '',
        website: data.website || data.elements?.website?.value || '',
        categories: Array.isArray(data.categories || data.elements?.categories?.value)
          ? (data.categories || data.elements?.categories?.value)
          : [],
      };

      if (location.latitude && location.longitude) {
        locations.push(location);
        console.log('Added single location from data:', location.name);
      }
    }

    if (locations.length === 0) {
      console.warn('No valid locations found in content fragments - using fallback data');
      return getFallbackLocations();
    }

    console.log(`Found ${locations.length} valid locations`);
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
    },
    {
      name: 'Los Angeles Office (Fallback)',
      address: '456 Wilshire Blvd, Los Angeles, CA 90036',
      latitude: 34.0522,
      longitude: -118.2437,
      phone: '+1 (310) 555-5678',
      website: 'https://example.com/la',
      categories: ['branch', 'customer-service'],
    },
  ];
}

/**
 * Create map markers for locations
 * @param {Object} map - Google Maps instance
 * @param {Array} locations - Array of location objects
 * @param {string} markerType - Type of marker to use
 * @param {boolean} customTooltip - Whether to use custom tooltips
 * @param {string} svgPath - Path to custom marker SVG
 */
function createMarkers(map, locations, markerType, customTooltip, svgPath) {
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
      if (customTooltip) {
        addCustomTooltip(map, marker, location);
      } else {
        addInfoWindow(map, marker, location);
      }
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
 * Add custom tooltip to marker
 * @param {Object} map - Google Maps instance
 * @param {Object} marker - Marker instance
 * @param {Object} location - Location data
 */
function addCustomTooltip(map, marker, location) {
  // Make sure Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Map Locator: Google Maps API not loaded');
    return;
  }

  try {
    const tooltip = document.createElement('div');
    tooltip.className = 'map-marker-tooltip';
    tooltip.innerHTML = `
      <div class="map-marker-tooltip__title">${location.name || ''}</div>
      <div class="map-marker-tooltip__address">${location.address || ''}</div>
      ${
  location.phone
    ? `<div class="map-marker-tooltip__phone">${location.phone}</div>`
    : ''
}
      ${
  location.website
    ? `<a href="${location.website}" class="map-marker-tooltip__link" target="_blank">Visit website</a>`
    : ''
}
    `;

    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    marker.addListener('click', () => {
      // Hide all other tooltips
      document.querySelectorAll('.map-marker-tooltip').forEach((el) => {
        el.style.display = 'none';
      });

      // Position and show this tooltip
      // Safe access to projection
      if (map.getProjection) {
        const markerPosition = marker.getPosition();
        const point = map.getProjection().fromLatLngToPoint(markerPosition);

        if (point) {
          const tooltipLeft = `${point.x + 10}px`;
          const tooltipTop = `${point.y - 30}px`;

          tooltip.style.position = 'absolute';
          tooltip.style.left = tooltipLeft;
          tooltip.style.top = tooltipTop;
          tooltip.style.display = 'block';
        }
      } else {
        // Fallback positioning if projection isn't available
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.display = 'block';
      }
    });

    // Close tooltip when clicking elsewhere on the map
    map.addListener('click', () => {
      tooltip.style.display = 'none';
    });
  } catch (error) {
    console.error('Error creating custom tooltip:', error);
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
function initFilters(block, map, locations, filterCategories) {
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
