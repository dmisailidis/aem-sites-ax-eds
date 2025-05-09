const getFileSize = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const sizeInBytes = blob.size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    const fileSize = sizeInMB.toFixed(2);
    return fileSize;
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return null; // Return null or handle the error as needed
  }
};

export default async function decorate(block) {
  const [titleDiv, assetLinkDiv] = [...block.children];

  const title = titleDiv.querySelector('p').innerText;
  let assetLink = null;
  let fileName = null;
  let fileSize = null;

  if (assetLinkDiv.querySelector('a')) {
    assetLink = assetLinkDiv.querySelector('a').href;
  }

  if (assetLink) {
    const lastSlashIndex = assetLink.lastIndexOf('/');
    fileName = assetLink.substring(lastSlashIndex + 1);
  }
  block.replaceChildren();
  block.appendChild(assetLinkDiv.querySelector('a'));

  const link = block.querySelector('a');
  link.setAttribute('role', 'button');
  link.replaceChildren();

  const fileType = fileName.split('.').pop();
  try {
    fileSize = await getFileSize(assetLink);
  } catch (error) {
    console.error('Error fetching the PDF file size:', error);
  }

  const linkRight = document.createElement('div');
  const fileTitle = document.createElement('p');
  fileTitle.innerText = title;
  const fileInfo = document.createElement('span');
  fileInfo.innerText = `${fileType.toUpperCase()} | ${fileSize}MB`;
  linkRight.classList.add('link-right');
  linkRight.appendChild(fileTitle);
  linkRight.appendChild(fileInfo);
  const linkLeft = document.createElement('div');
  linkLeft.classList.add('link-left', 'icon-download');

  link.appendChild(linkRight);
  link.appendChild(linkLeft);
}
