const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

module.exports = {
  addImage(asset, x, y, width, height) {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', asset.src);
    image.setAttribute('x', x);
    image.setAttribute('y', y);
    image.setAttribute('width', width);
    image.setAttribute('height', height);
    svg.appendChild(image);
  },

  setSize(width, height) {
    svg.setAttribute('height', height);
    svg.setAttribute('width', width);
  },

  get view() {
    return svg;
  },
};
