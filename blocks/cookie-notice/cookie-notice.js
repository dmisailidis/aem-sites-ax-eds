export default function decorate(block) {
  const [textDiv, buttonDiv, versionDiv] = [...block.children];
  const text = textDiv.querySelector('p');
  const version = versionDiv.querySelector('p');
  const btn = document.createElement('button');
  btn.setAttribute('id', 'accept-cookies');
  const btnLabel = buttonDiv.querySelector('p');
  btn.innerText = btnLabel ? btnLabel.innerText : '';
  const btnWrapper = document.createElement('div');
  btnWrapper.classList.add('icon-button', 'icon-button-secondary');
  btnWrapper.appendChild(btn);
  block.replaceChildren();
  block.appendChild(text);
  block.appendChild(btnWrapper);

  initCookieNotice(version ? version.innerText : null);
}

function initCookieNotice(version) {
    const cookieNotice = document.querySelector('.cookie-notice.block');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    // Check if the user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')
        || localStorage.getItem('cookiesAccepted') !== 'true'
        || localStorage.getItem('cookieNoticeVersion') !== version) {
        localStorage.removeItem('cookiesAccepted');
        localStorage.removeItem('cookieNoticeVersion');
        cookieNotice.style.display = 'block';
    }

    // Handle the accept button click
    acceptCookiesButton.addEventListener('click', function () {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('cookieNoticeVersion', version);
        cookieNotice.style.display = 'none';
    });
};
