import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Fetches child pages based on the parent page path
 * @param {string} parentPath - Path to the parent page
 * @param {number} depth - Depth of child pages to fetch
 * @return {Promise<Array>} - Array of child page data
 */
async function fetchChildPages(parentPath, depth = 1) {
  try {
    // Fetch the query index
    const response = await fetch('/query-index.json');
    if (!response.ok) {
      throw new Error('Failed to fetch query index');
    }
    const data = await response.json();
    
    // Filter pages that are children of the specified parent path
    return data.filter(page => {
      const pagePath = page.path;
      if (!pagePath.startsWith(parentPath)) return false;
      
      // Calculate the level difference to check depth
      const parentPathParts = parentPath.split('/').filter(Boolean);
      const pagePathParts = pagePath.split('/').filter(Boolean);
      const levelDifference = pagePathParts.length - parentPathParts.length;
      
      return levelDifference > 0 && levelDifference <= depth;
    });
  } catch (error) {
    console.error('Error fetching child pages:', error);
    return [];
  }
}

/**
 * Fetches pages based on a search query
 * @param {string} query - Search query
 * @return {Promise<Array>} - Array of matching page data
 */
async function fetchSearchResults(query) {
  try {
    // Fetch the query index
    const response = await fetch('/query-index.json');
    if (!response.ok) {
      throw new Error('Failed to fetch query index');
    }
    const data = await response.json();
    
    // Simple search implementation
    const searchTerms = query.toLowerCase().split(' ');
    
    return data.filter(page => {
      const title = (page.title || '').toLowerCase();
      const description = (page.description || '').toLowerCase();
      
      return searchTerms.some(term => 
        title.includes(term) || description.includes(term)
      );
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return [];
  }
}

/**
 * Fetches pages that match the specified tags
 * @param {string} parentPath - Path to limit the search (optional)
 * @param {Array} tags - Array of tags to match
 * @param {string} match - Match type ('anyTag' or 'allTags')
 * @return {Promise<Array>} - Array of matching page data
 */
async function fetchPagesByTags(parentPath, tags, match = 'anyTag') {
  try {
    // Fetch the query index
    const response = await fetch('/query-index.json');
    if (!response.ok) {
      throw new Error('Failed to fetch query index');
    }
    const data = await response.json();
    
    // Filter pages based on tags
    return data.filter(page => {
      // First, check if we need to limit by parent path
      if (parentPath && !page.path.startsWith(parentPath)) {
        return false;
      }
      
      // Then check tags
      const pageTags = page.tags || [];
      
      if (match === 'anyTag') {
        return tags.some(tag => pageTags.includes(tag));
      } else {
        // allTags - must match all specified tags
        return tags.every(tag => pageTags.includes(tag));
      }
    });
  } catch (error) {
    console.error('Error fetching pages by tags:', error);
    return [];
  }
}

/**
 * Sorts the page data based on the provided criteria
 * @param {Array} pages - Array of page data
 * @param {string} orderBy - Property to sort by
 * @param {string} sortOrder - 'ascending' or 'descending'
 * @return {Array} - Sorted array of page data
 */
function sortPages(pages, orderBy = 'title', sortOrder = 'ascending') {
  return [...pages].sort((a, b) => {
    const valA = a[orderBy] || '';
    const valB = b[orderBy] || '';
    
    const comparison = typeof valA === 'string' 
      ? valA.localeCompare(valB)
      : valA - valB;
    
    return sortOrder === 'ascending' ? comparison : -comparison;
  });
}

/**
 * Formats a date for display
 * @param {string} dateStr - Date string
 * @return {string} - Formatted date string
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
}

/**
 * Extract configuration from the block
 * @param {Element} block - The block element
 * @return {Object} - Configuration object
 */
function extractConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach(row => {
    if (row.children.length >= 2) {
      const key = row.children[0].textContent.trim();
      const value = row.children[1].textContent.trim();
      config[key] = value;
    }
  });
  return config;
}

/**
 * Process list items from provided data
 * @param {Array} items - Array of item data
 * @param {Object} config - Configuration options
 * @return {DocumentFragment} - Fragment with list items
 */
function createListItems(items, config) {
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.classList.add('list-item');
    
    if (config.displayAsTeaser === 'true') {
      li.classList.add('list-teaser');
    }
    
    // Create title element
    const title = document.createElement(config.displayAsTeaser === 'true' ? 'h3' : 'span');
    title.classList.add('list-item-title');
    
    if (config.linkItems === 'true' && item.path) {
      const link = document.createElement('a');
      link.href = item.path;
      link.textContent = item.title || '';
      title.appendChild(link);
    } else {
      title.textContent = item.title || '';
    }
    
    // Add icon if available
    if (item.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('list-item-icon', `icon-${item.icon}`);
      li.appendChild(iconSpan);
    }
    
    li.appendChild(title);
    
    // Add description if configured
    if (config.showDescription === 'true' && item.description) {
      const description = document.createElement('p');
      description.classList.add('list-item-description');
      description.textContent = item.description;
      li.appendChild(description);
    }
    
    // Add date if configured
    if (config.showDate === 'true' && item.lastModified) {
      const date = document.createElement('span');
      date.classList.add('list-item-date');
      date.textContent = formatDate(item.lastModified);
      li.appendChild(date);
    }
    
    fragment.appendChild(li);
  });
  
  return fragment;
}

/**
 * Decorates the list block
 * @param {Element} block - The list block element
 */
export default async function decorate(block) {
  // Extract configuration
  const config = extractConfig(block);
  
  // Parse fixed list items if using that mode
  let fixedListItems = [];
  if (config.buildList === 'fixedList') {
    // For fixed list, we'll extract items from child blocks
    const itemBlocks = [...block.querySelectorAll('.list-item')];
    itemBlocks.forEach(itemBlock => {
      const title = itemBlock.querySelector('.list-item-title')?.textContent || '';
      const description = itemBlock.querySelector('.list-item-description')?.textContent || '';
      const link = itemBlock.querySelector('.list-item-title a')?.href || '';
      const iconEl = itemBlock.querySelector('.list-item-icon');
      const icon = iconEl ? 
        Array.from(iconEl.classList)
          .find(cls => cls.startsWith('icon-'))?.substring(5) : '';
      
      fixedListItems.push({
        title,
        description,
        path: link,
        icon
      });
    });
  }
  
  // Clear the block content to prepare for the list
  block.innerHTML = '';
  
  // Create list container
  const listElement = document.createElement('ul');
  listElement.classList.add('list-container');
  
  if (config.displayAsTeaser === 'true') {
    listElement.classList.add('list-teaser-container');
  }
  
  if (config.id) {
    listElement.id = config.id;
  }
  
  let listItems = [];
  
  // Fetch list items based on the buildList method
  try {
    switch (config.buildList) {
      case 'childPages':
        if (config.parentPage) {
          const childDepth = parseInt(config.childDepth, 10) || 1;
          listItems = await fetchChildPages(config.parentPage, childDepth);
        }
        break;
        
      case 'fixedList':
        // Use the pre-processed fixed list items
        listItems = fixedListItems;
        break;
        
      case 'search':
        if (config.searchQuery) {
          listItems = await fetchSearchResults(config.searchQuery);
        }
        break;
        
      case 'tags':
        if (config.referenceTags) {
          const tags = config.referenceTags.split(',').map(tag => tag.trim());
          listItems = await fetchPagesByTags(config.referenceParentPage, tags, config.match);
        }
        break;
        
      default:
        console.warn(`Unknown list building method: ${config.buildList}`);
    }
    
    // Apply sorting
    listItems = sortPages(listItems, config.orderBy, config.sortOrder);
    
    // Apply item limit
    if (config.maxItems) {
      const maxItems = parseInt(config.maxItems, 10);
      if (maxItems > 0) {
        listItems = listItems.slice(0, maxItems);
      }
    }
    
    // Create and add list items
    const itemsFragment = createListItems(listItems, config);
    listElement.appendChild(itemsFragment);
    
  } catch (error) {
    console.error('Error building list:', error);
    // Add a message for error state
    const errorMsg = document.createElement('li');
    errorMsg.textContent = 'Unable to load list items.';
    listElement.appendChild(errorMsg);
  }
  
  // Add the list to the block
  block.appendChild(listElement);
}