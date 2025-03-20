const bindProgressBar = () => {
  let scrollId = document.querySelector(".progress-bar__bar");
  if (scrollId) {
    scrollId.innerHTML = '';
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
  const [completionDiv] = [...block.children];
  const completion = completionDiv.querySelector('p');
  block.replaceChildren();

  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar__bar')
  if (completion) {
    progressBar.style.width = completion.innerText + '%';
  }

  block.append(progressBar);

  bindProgressBar();
}
