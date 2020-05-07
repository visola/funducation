const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

function addImage(asset, x, y, width, height) {
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('href', asset.src);
  image.setAttribute('x', x);
  image.setAttribute('y', y);
  image.setAttribute('width', width || asset.width);
  image.setAttribute('height', height || asset.height);
  svg.appendChild(image);
}

function setSize(width, height) {
  svg.setAttribute('height', height);
  svg.setAttribute('width', width);
}

window.addEventListener('resize', () => {
  setSize(window.innerWidth, window.innerHeight);
});

setSize(window.innerWidth, window.innerHeight);

module.exports = {
  addImage,
  setSize,
  get view() {
    return svg;
  },
};
