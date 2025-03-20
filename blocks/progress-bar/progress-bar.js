const bindProgressBar = () => {
  let scrollId = document.querySelector(".progress-bar__bar");
  if (scrollId) {
    scrollId.innerHTML = '';
    scrollId.style.width = "0%";
    function scrollSpy() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if(scrollId) {
        scrollId.style.width = scrolled + "%";
      }
    }
    document.addEventListener('scroll', scrollSpy)
  }
};

export default function decorate(block) {
  const [completionDiv, typeDiv] = [...block.children];
  const completion = completionDiv.querySelector('p');
  const type = typeDiv.querySelector('p');
  const typeVal = type ? type.innerText : 'static';
  block.replaceChildren();

  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar__bar');
  if (completion && typeVal === 'static') {
    progressBar.style.width = completion.innerText + '%';
  }

  block.classList.add(typeVal);
  block.append(progressBar);

  if (typeVal === 'dynamic') {
    bindProgressBar();
  }
}
