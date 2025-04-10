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
    // Load Google Maps API (using API key from CA Config)
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

      // Load location data from Content Fragments
      if (!blockConfig.contentFragmentPath) {
        console.error('Content Fragment Path is not specified in component properties');
      } else {
        console.log('Using Content Fragment Path:', blockConfig.contentFragmentPath);
      }
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
    mapContainer.innerHTML = '<div class="cmp-map-locator__error">Map could not be loaded. Please try again later.</div>';
  }
}

/**
 * Extract configuration from block
 * @param {HTMLElement} block - Component block element
 * @returns {Object} - Configuration object
 */
function getBlockConfig(block) {
  // Get all content from the block
  const blockRows = [...block.children];
  const config = {};

  // Parse the block rows to extract configuration
  blockRows.forEach((row) => {
    if (row.children.length >= 2) {
      const propertyName = row.children[0].textContent.trim();
      const propertyValue = row.children[1].textContent.trim();

      console.log('Property name', propertyName);
      console.log('Property value', propertyValue);

      if (propertyName === 'Content Fragment Path' || propertyName === 'Location Content Fragments Root Path') {
        config.contentFragmentPath = propertyValue;
      } else if (propertyName === 'Default Zoom Level') {
        config.defaultZoomLevel = parseInt(propertyValue, 10) || 7;
      } else if (propertyName === 'Default Latitude') {
        config.defaultLatitude = parseFloat(propertyValue) || 40.7128;
      } else if (propertyName === 'Default Longitude') {
        config.defaultLongitude = parseFloat(propertyValue) || -74.0060;
      } else if (propertyName === 'Marker Type') {
        config.markerType = propertyValue || 'googleMapsCustomizable';
      } else if (propertyName === 'Custom Tooltip') {
        config.customTooltip = propertyValue === 'true';
      } else if (propertyName === 'Show Filters') {
        config.showFilters = propertyValue === 'true';
      } else if (propertyName === 'Enable Search Filter') {
        config.enableSearchFilter = propertyValue === 'true';
      } else if (propertyName === 'Search Filter Title') {
        config.searchFilterTitle = propertyValue || 'Search';
      } else if (propertyName === 'Search Filter Initial Text') {
        config.searchFilterInitText = propertyValue || 'Search locations...';
      } else if (propertyName === 'Proximity Radius (meters)') {
        config.proximityRadius = propertyValue || '1000';
      } else if (propertyName === 'Country Code') {
        config.countryCode = propertyValue || 'US';
      } else if (propertyName === 'Show Results Label') {
        config.showResults = propertyValue || 'Show Results';
      } else if (propertyName === 'Clear Filters Label') {
        config.clearFilters = propertyValue || 'Clear Filters';
      } else if (propertyName === 'Custom SVG Marker Upload') {
        config.svgUpload = propertyValue || '';
      }
    }
  });

  // Set default values for any missing properties
  return {
    googleMapApiKey: '', // Will be fetched from API
    proximityRadius: config.proximityRadius || '1000',
    countryCode: config.countryCode || 'US',
    defaultZoomLevel: config.defaultZoomLevel || 7,
    defaultLatitude: config.defaultLatitude || 40.7128,
    defaultLongitude: config.defaultLongitude || -74.0060,
    markerType: config.markerType || 'googleMapsCustomizable',
    customTooltip: config.customTooltip || false,
    showFilters: config.showFilters || false,
    enableSearchFilter: config.enableSearchFilter || false,
    searchFilterTitle: config.searchFilterTitle || 'Search',
    searchFilterInitText: config.searchFilterInitText || 'Search locations...',
    clearFilters: config.clearFilters || 'Clear Filters',
    showResults: config.showResults || 'Show Results',
    svgUpload: config.svgUpload || '',
    contentFragmentPath: config.contentFragmentPath || '',
    filterCategories: [],
  };
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

    // Format for AEM Content Fragment JSON API
    const endpoint = `${contentFragmentPath}.json`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Content fragments response:', data);

    // Transform the content fragment data to location objects
    const locations = [];

    // Process the data based on the structure returned by AEM
    // This may need adjustment based on the actual structure of your content fragments
    if (data && data.items) {
      data.items.forEach((item) => {
        const location = {
          name: item.elements?.name?.value || '',
          address: item.elements?.address?.value || '',
          latitude: parseFloat(item.elements?.latitude?.value) || 0,
          longitude: parseFloat(item.elements?.longitude?.value) || 0,
          phone: item.elements?.phone?.value || '',
          website: item.elements?.website?.value || '',
          categories: item.elements?.categories?.value || [],
        };

        // Only add valid locations with coordinates
        if (location.latitude && location.longitude) {
          locations.push(location);
        }
      });
    } else if (data && Array.isArray(data)) {
      // Alternative structure - direct array of content fragments
      data.forEach((item) => {
        const location = {
          name: item.name || '',
          address: item.address || '',
          latitude: parseFloat(item.latitude) || 0,
          longitude: parseFloat(item.longitude) || 0,
          phone: item.phone || '',
          website: item.website || '',
          categories: item.categories || [],
        };

        if (location.latitude && location.longitude) {
          locations.push(location);
        }
      });
    }

    if (locations.length === 0) {
      console.warn('No valid locations found in content fragments - using fallback data');
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
