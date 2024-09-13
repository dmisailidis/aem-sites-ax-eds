export default function decorate(block) {
  const [imageDiv, authorNameDiv, dateDiv] = [...block.children];
  const img = imageDiv.querySelector('img');
  const authorName = authorNameDiv.querySelector('p');
  const date = dateDiv.querySelector('p');
  block.replaceChildren();
  console.log(img, authorName, date);

  const authorInfo = document.createElement('div');
  authorInfo.className = 'author-info__info';
  authorName.className = 'author-info__info-name';
  date.className = 'author-info__info-date';
  authorInfo.append(authorName, date);
  block.append(img, authorInfo);
}
