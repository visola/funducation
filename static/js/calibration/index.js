const buttonEl = document.querySelector('button');
const imgEl = document.querySelector('image');
const svgEl = document.querySelector('svg');

const REFRESH_INTERVAL = 500;
let contours = [];

function _arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

function updateContours() {
  fetch(`/contours?ts=${Date.now()}`)
    .then((r) => r.json())
    .then((data) => {
      contours.forEach((r) => r.remove());
      contours = [];
      data.forEach((r) => {
        if (r.width < 5 || r.height < 5) {
          return;
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', r.x);
        rect.setAttribute('y', r.y);
        rect.setAttribute('height', r.height);
        rect.setAttribute('width', r.width);
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', '#00FF00');
        rect.setAttribute('stroke-width', 1);
        svgEl.appendChild(rect);
        contours.push(rect);
      });
    });
}

function updateAll() {
  fetch('/capture')
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      imgEl.setAttribute('href', 'data:image/bmp;base64,' + _arrayBufferToBase64(buffer));
      updateContours();
    });
}

buttonEl.addEventListener('click', () => {
  updateAll();
});

imgEl.addEventListener('load', () => {
  updateContours();
});

updateAll();
