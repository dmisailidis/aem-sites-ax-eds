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

    // const myHeaders = {};
    // myHeaders['Content-Type'] = 'application/json';
    // myHeaders.Accept = 'application/json';
    // eslint-disable-next-line max-len
    // myHeaders.Authorization = 'Bearer <enter-key>';
    // myHeaders['x-gw-ims-org-id'] = 'C0B99765576A7A987F000101@AdobeOrg';
    // myHeaders['access-control-allow-methods'] = 'GET, OPTIONS';
    // myHeaders['access-control-allow-origin'] = 'http://localhost:3000';
    // myHeaders['access-control-allow-headers'] = 'Content-Type, Authorization, x-gw-ims-org-id';
    // myHeaders['access-control-max-age'] = '3600';

    // const requestOptions = {
    //   method: 'GET',
    //   headers: myHeaders,
    // };

    // console.log('Request Options:', requestOptions);

    // const response = await fetch('https://localhost:53312/api/v1/web/ddax-adobe-io/maps-key', requestOptions)
    //   .then((res) => console.log('Response:', res))
    //   .catch((error) => console.log('Error:', error));

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

      console.log('Block config:', blockConfig);

      // Check if any of the filtering fields has been set
      const hasNameFilter = !!blockConfig.filterName.trim();
      const hasCategoryFilter = blockConfig.filterCategories && blockConfig.filterCategories !== 'all';
      const hasCountryFilter = blockConfig.filterCountry && blockConfig.filterCountry !== 'all';

      console.log('Check name', hasNameFilter);
      console.log('Check categories', hasCategoryFilter);
      console.log('Check country', hasCountryFilter);

      // Apply initial filtering if filters are set
      if (hasNameFilter || hasCategoryFilter || hasCountryFilter) {
        applyFilters(
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
    contentFragmentPath: '',
    defaultZoomLevel: 7,
    defaultLatitude: 50.7128,
    defaultLongitude: -94.0060,
    markerType: 'googleMapsCustomizable',
    svgUpload: '',
    filterName: '',
    filterCategories: 'all',
    filterCountry: 'all',
    proximityRadius: '1000',
    countryCode: 'US',
    googleMapApiKey: '',
  };

  try {
    // Look for paragraphs with data-aue attributes
    const propElements = block.querySelectorAll('[data-aue-prop]');

    console.log('PROP ELEMENTS:', propElements);

    if (propElements.length > 0) {
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
    } else {
      // APPROACH 2: Local development environment - parse block structure
      console.log('Using local development configuration mode');
      // Find all divs with two child divs (label + value pattern)
      const rows = block.querySelectorAll(':scope > div');

      console.log('Found rows:', rows);

      rows[0].style.display = 'none'; // Hide the first row

      // Skip the first row if it appears to be the component title
      let startIndex = 0;
      if (rows.length > 0 && rows[0].innerText.toLowerCase().includes('map-locator')) {
        startIndex = 1;
      }

      const keys = Object.keys(config);

      // Process each row and try to infer the property from its value
      rows.forEach((row, index) => {
        console.log('Index', index);

        if (index < startIndex) return; // Skip component title row

        const currentKey = keys[index - startIndex];

        const propValue = row.innerText.trim();

        config[currentKey] = propValue;

        console.log(`Row ${index} value:`, propValue);

        row.style.display = 'none';
      });

      console.log('Final configuration:', config);

      // Hide any P tags that contain configuration data
      const allParagraphs = block.querySelectorAll('p');
      allParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text.match(/^\/content\/dam/i)
            || text.match(/^\d+$/)
            || text.match(/^-?\d+\.\d+$/)
            || ['customSVG', 'googleMapsCustomizable', 'all', 'headquarters', 'branch',
              'customer-service', 'sales', 'support', 'us', 'it', 'gr'].includes(text.toLowerCase())) {
          if (p.closest('div') && p.closest('div') !== block) {
            p.closest('div').style.display = 'none';
          } else {
            p.style.display = 'none';
          }
        }
      });
    }

    console.log('Final configuration:', config);
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
          country: fragmentData.countryCode || '',
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
      name: 'Los Angeles Office',
      address: '456 Wilshire Blvd, Los Angeles, CA 90036',
      latitude: 34.0522,
      longitude: -118.2437,
      phone: '+1 (310) 555-5678',
      website: 'https://example.com/la',
      categories: [
        'branch',
        'customer-service',
      ],
      country: 'us',
    },
    {
      name: 'New York Office',
      address: '123 Broadway, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+1 (212) 555-1234',
      website: 'https://example.com/ny',
      categories: [
        'headquarters',
        'sales',
      ],
      country: 'us',
    },
    {
      name: 'Chicago Office',
      address: '522-534 W Roosevelt Rd',
      latitude: 41.8713239,
      longitude: -87.6342781,
      phone: '+1 (212) 555-1234',
      website: 'https://example.com/ch',
      categories: [
        'branch',
        'sales',
      ],
      country: 'us',
    },
    {
      name: 'Milan Office',
      address: 'Via Tortona, 25, 20144 Milano MI, Italy',
      latitude: 45.4524723,
      longitude: 9.1560075,
      phone: '+1 (212) 555-1234',
      website: 'https://example.com/ml',
      categories: [
        'headquarters',
        'customer-service',
      ],
      country: 'it',
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
      <div class="map-marker-tooltip">
        <h3 class="map-marker-tooltip__title">${location.name || ''}</h3>
        <p class="map-marker-tooltip__address">${location.address || ''}</p>
        ${location.phone ? `<p class="map-marker-tooltip__phone">Phone: ${location.phone}</p>` : ''}
        ${
  location.website
    ? `<p><a href="${location.website}" target="_blank" class="map-marker-tooltip__link">Website</a></p>`
    : ''
}
        ${
  location.categories && location.categories.length > 0
    ? `<p class="map-marker-tooltip__categories">Categories: ${location.categories.join(', ')}</p>`
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
 * Apply filters to the map based on the given criteria
 * @param {Object} map - The Google Maps instance
 * @param {Array} locations - Array of all location objects
 * @param {string} filterName - The name filter text
 * @param {string} filterCategories - The category filter
 * @param {string} filterCountry - The country filter
 */
function applyFilters(map, locations, filterName, filterCategories, filterCountry) {
  // Make sure map and markers exist
  if (!map || !map.markers || !map.markers.length) {
    console.error('Map Locator: Invalid map or no markers found');
    return;
  }

  console.log('Applying filters:');
  console.log('- Name filter:', filterName);
  console.log('- Category filter:', filterCategories);
  console.log('- Country filter:', filterCountry);

  // Prepare the bounds for visible markers
  const bounds = new google.maps.LatLngBounds();
  let visibleMarkersCount = 0;

  // Process each marker
  map.markers.forEach((marker) => {
    const location = marker.locationData;
    let isVisible = true;

    // Apply name filter if specified (fuzzy match)
    if (filterName && filterName.trim() !== '') {
      const nameFilter = filterName.toLowerCase();
      const locationName = location.name ? location.name.toLowerCase() : '';
      const locationAddress = location.address ? location.address.toLowerCase() : '';

      // Fuzzy match - check if filter is included in name or address
      const matchesName = locationName.includes(nameFilter);
      const matchesAddress = locationAddress.includes(nameFilter);

      // Only show if it matches the name filter
      if (!matchesName && !matchesAddress) {
        isVisible = false;
      }
    }

    // Apply category filter if specified and not 'all'
    if (isVisible && filterCategories && filterCategories !== 'all') {
      // Check if the location has the specified category
      const hasCategory = location.categories
        && location.categories.some((cat) => cat.toLowerCase() === filterCategories.toLowerCase());

      if (!hasCategory) {
        isVisible = false;
      }
    }

    // Apply country filter if specified and not 'all'
    if (isVisible && filterCountry && filterCountry !== 'all') {
      // Check if the location country matches the filter
      const locationCountry = location.country ? location.country.toLowerCase() : '';

      if (locationCountry !== filterCountry.toLowerCase()) {
        isVisible = false;
      }
    }

    // Update marker visibility
    marker.setVisible(isVisible);

    // If visible, extend map bounds to include this marker
    if (isVisible) {
      bounds.extend(marker.getPosition());
      visibleMarkersCount += 1;
    }
  });

  // Update map viewport based on visible markers
  if (visibleMarkersCount === 1) {
    // For a single marker, center on it with a fixed zoom level
    const visibleMarker = map.markers.find((marker) => marker.getVisible());
    console.log('Markers:', map.markers);
    console.log('Visible markers:', visibleMarker);
    console.log('Visible marker:', visibleMarker.getPosition());
    console.log('Visible marker name:', visibleMarker.locationData.name);

    if (visibleMarker) {
      const longitude = parseFloat(visibleMarker.locationData.longitude);
      const latitude = parseFloat(visibleMarker.locationData.latitude);
      map.setCenter({ lng: longitude, lat: latitude, zoom: 7 });
    }
  } else if (visibleMarkersCount > 1) {
    // For multiple markers, fit bounds
    map.fitBounds(bounds);
  }

  console.log(`Filter applied: ${visibleMarkersCount} of ${map.markers.length} markers visible`);
}
