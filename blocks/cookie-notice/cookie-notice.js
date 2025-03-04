export default function decorate(block) {

  //const text = document.createElement('p');
  //text.appendChild(document.createTextNode('This is a cookie notice.'));
  const btn = document.createElement('button');
  btn.setAttribute('id', 'accept-cookies');
  //btn.appendChild(document.createTextNode('Accept'));
  //block.replaceChildren();
  //block.appendChild(text);
  block.appendChild(btn);

  //initCookieNotice();



}

function initCookieNotice() {
    const cookieNotice = document.querySelector('.cookie-notice.block');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    // Check if the user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted') || localStorage.getItem('cookiesAccepted') !== 'true') {
        cookieNotice.style.display = 'block';
    }

    // Handle the accept button click
    acceptCookiesButton.addEventListener('click', function () {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieNotice.style.display = 'none';
    });
};
