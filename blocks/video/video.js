export default function decorate(block) {
  const [videoDiv] = [...block.children];
  block.replaceChildren();
  const url = videoDiv.querySelector('a').innerText;
  const video = document.createElement('video');
  video.width = 640;
  video.height = 360;
  video.controls = true;

  const source = document.createElement('source');
  source.src = url;
  source.type = 'video/mp4';
  video.appendChild(source);
  video.innerHTML += 'Your browser does not support the video tag.';
  block.appendChild(video);
}
