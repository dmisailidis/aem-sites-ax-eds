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
    const myHeaders = {};
    myHeaders['Content-Type'] = 'application/json';
    myHeaders.Accept = 'application/json';
    myHeaders.Authorization = 'Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0...';
    myHeaders['x-gw-ims-org-id'] = 'C0B99765576A7A987F000101@AdobeOrg';

    // Static endpoint - only production Adobe I/O Runtime URL
    const apiEndpoint = 'https://42795-ddax.adobeioruntime.net/api/v1/web/ddax-adobe-io/maps-key';

    // Try a simpler GET request first
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        Authorization: myHeaders.Authorization,
        'x-gw-ims-org-id': myHeaders['x-gw-ims-org-id'],
        // Remove Content-Type and Accept to see if they're causing issues
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      console.error('Full response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`Failed to fetch API key: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response was:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    if (!data.key) {
      console.error('API key not found in response. Available keys:', Object.keys(data));
      throw new Error('API key not found in response');
    }

    blockConfig.googleMapApiKey = data.key;

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

      const locations = await fetchLocationData(blockConfig.contentFragmentPath);

      // Create markers for locations
      if (locations && locations.length > 0) {
        createMarkers(
          map,
          locations,
          blockConfig.markerType,
          blockConfig.svgUpload,
        );
      }

      // Check if any of the filtering fields has been set
      const hasNameFilter = !!blockConfig.filterName.trim();
      const hasCategoryFilter = blockConfig.filterCategories && blockConfig.filterCategories !== 'all';
      const hasCountryFilter = blockConfig.filterCountry && blockConfig.filterCountry !== 'all';

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
      mapContainer.innerHTML = '<div class="cmp-map-locator__error">Map could not be loaded. Please try again later.</div>';
    }
  } catch (error) {
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
      // Find all divs with two child divs (label + value pattern)
      const rows = block.querySelectorAll(':scope > div');

      rows[0].style.display = 'none';

      // Skip the first row if it appears to be the component title
      let startIndex = 0;
      if (rows.length > 0 && rows[0].innerText.toLowerCase().includes('map-locator')) {
        startIndex = 1;
      }

      const keys = Object.keys(config);

      // Process each row and try to infer the property from its value
      rows.forEach((row, index) => {
        if (index < startIndex) return; // Skip component title row

        const currentKey = keys[index - startIndex];
        const propValue = row.innerText.trim();
        config[currentKey] = propValue;

        row.style.display = 'none';
      });

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
/**
 * Add standard info window to marker with auto-close functionality
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

    // Store a reference to the currently open info window on the map
    if (!map.openInfoWindow) {
      map.openInfoWindow = null;
    }

    // Add click listener to the marker
    marker.addListener('click', () => {
      // Close the previously open info window (if any)
      if (map.openInfoWindow) {
        map.openInfoWindow.close();
      }

      // Open this info window and store a reference to it
      infoWindow.open(map, marker);
      map.openInfoWindow = infoWindow;
    });

    // If not already added, add a map click listener to close info windows
    // when clicking elsewhere on the map
    if (!map.hasInfoWindowCloseHandler) {
      map.addListener('click', () => {
        // Only close if the click was not on a marker
        // (markers will handle their own info windows)
        if (map.openInfoWindow) {
          map.openInfoWindow.close();
          map.openInfoWindow = null;
        }
      });

      // Mark that we've added this handler, so we don't add it multiple times
      map.hasInfoWindowCloseHandler = true;
    }

    // Add close event to the info window itself
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
      map.openInfoWindow = null;
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

  // Prepare the bounds for visible markers
  const bounds = new google.maps.LatLngBounds();
  let visibleMarkersCount = 0;
  let lastVisibleMarker = null;

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
      lastVisibleMarker = marker; // Keep track of the last visible marker
    }
  });

  // Use setTimeout to ensure the map has time to process marker visibility changes
  setTimeout(() => {
    // Update map viewport based on visible markers
    if (visibleMarkersCount === 1 && lastVisibleMarker) {
      try {
        // Get position directly from the marker
        const position = lastVisibleMarker.getPosition();

        // Force map to center on this position
        map.setCenter(position);

        // Force zoom level change
        const zoomLevel = 14;
        map.setZoom(zoomLevel);

        // Force the map to redraw/refresh
        google.maps.event.trigger(map, 'resize');
      } catch (error) {
        console.error('Error centering map:', error);

        // Fallback method using stored lat/lng
        try {
          const lat = parseFloat(lastVisibleMarker.locationData.latitude);
          const lng = parseFloat(lastVisibleMarker.locationData.longitude);

          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            const center = new google.maps.LatLng(lat, lng);
            map.setCenter(center);
            map.setZoom(14);
            google.maps.event.trigger(map, 'resize');
          }
        } catch (fallbackError) {
          console.error('Fallback centering failed:', fallbackError);
        }
      }
    } else if (visibleMarkersCount > 1) {
      // For multiple markers, fit bounds
      map.fitBounds(bounds);

      // Force map to refresh
      google.maps.event.trigger(map, 'resize');
    }
  }, 300); // Short delay to ensure the map is ready
}
