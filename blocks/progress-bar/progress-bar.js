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
}
