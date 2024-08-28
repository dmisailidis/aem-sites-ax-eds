import { createElement } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

const getPageTitle = async (url) => {
  const resp = await fetch(url);
  if (resp.ok) {
    const html = document.createElement('div');
    html.innerHTML = await resp.text();
    return html.querySelector('title').innerText;
  }

  return '';
};

const getAllPathsExceptCurrent = async (paths, startLevel) => {
  const result = [];
  const startLevelVal = startLevel;
  // remove first and last slash characters
  const pathsList = paths.replace(/^\/|\/$/g, '').split('/');
  let pathVal = '';
  // Excluding current link
  for (let i = 0; i <= pathsList.length - 2; i += 1) {
    pathVal = `${pathVal}/${pathsList[i]}`;
    const url = `${window.location.origin}${pathVal}`;

    if (i >= startLevelVal - 1) {
      // eslint-disable-next-line no-await-in-loop
      const name = await getPageTitle(url);
      if (name) {
        result.push({ pathVal, name, url });
      }
    }
  }
  return result;
};

const createLink = (path) => {
  const pathLink = document.createElement('a');
  pathLink.href = path.url;

  if (path.name !== 'HomePage') {
    pathLink.innerText = path.name;
  } else {
    pathLink.title = path.label;
    pathLink.classList.add('icon-home');
  }
  return pathLink;
};

export default async function decorate(block) {
  const [hideBreadcrumbVal, startLevelVal, hideCurrentPageVal] = block.children;
  const hideBreadcrumb = hideBreadcrumbVal?.textContent.trim() || 'false';
  const hideCurrentPage = hideCurrentPageVal?.textContent.trim() || 'false';
  let startLevel = startLevelVal?.textContent.trim() || 1;
  const metaBreadcrumbLevel = getMetadata('breadcrumblevel');

  if (metaBreadcrumbLevel !== '') {
    startLevel = metaBreadcrumbLevel;
  }

  block.innerHTML = '';

  if (hideBreadcrumb === 'true') {
    return;
  }
  const breadcrumb = createElement('nav', '', {
    'aria-label': 'Breadcrumb',
  });
  const HomeLink = createLink({
    path: '', name: 'HomePage', url: window.location.origin, label: 'Home',
  });
  const breadcrumbLinks = [HomeLink.outerHTML];

  window.setTimeout(async () => {
    const path = window.location.pathname;
    const paths = await getAllPathsExceptCurrent(path, startLevel);
    paths.forEach((pathPart) => breadcrumbLinks.push(createLink(pathPart).outerHTML));
    if (hideCurrentPage === 'false') {
      const currentPath = document.createElement('span');
      const currentTitle = document.querySelector('title').innerText;
      currentPath.innerText = currentTitle.replace(' | Pricefx', '');
      breadcrumbLinks.push(currentPath.outerHTML);
    }
    breadcrumb.innerHTML = breadcrumbLinks.join('<span class="breadcrumb-separator">/</span>');
    block.append(breadcrumb);
  }, 0);
}
