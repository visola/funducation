const buttonEl = document.querySelector('button');
const imgEl = document.querySelector('svg > image');
const previewEl = document.querySelector('#preview');
const imagePreviewEl = document.querySelector('#preview img');
const saveObjectButtonEl = document.querySelector('#preview button')
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

function getBase64Image(imgEl) {
  const canvas = document.createElement("canvas");
  canvas.width = imgEl.width;
  canvas.height = imgEl.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0);
  const dataURL = canvas.toDataURL("image/bmp");
  const indexOfComma = dataURL.indexOf(',');
  return dataURL.substring(indexOfComma + 1);
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

saveObjectButtonEl.addEventListener('click', () => {
  const type = document.querySelector('#preview [name=type]').value;
  const value = document.querySelector('#preview [name=value]').value;
  const object = {
    image: getBase64Image(imagePreviewEl),
    type,
    value,
  };
  fetch('/objects', {
    body: JSON.stringify(object),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
});

svgEl.addEventListener('click', (e) => {
  const border = 15;
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const indexOfSvg = elements.indexOf(svgEl);
  const rect = elements[indexOfSvg - 2];
  const x = parseInt(rect.getAttribute('x'), 10) - border;
  const y = parseInt(rect.getAttribute('y'), 10) - border;
  const width = parseInt(rect.getAttribute('width'), 10) + border * 2;
  const height = parseInt(rect.getAttribute('height'), 10) + border * 2;

  const cropUrl = `/crop?x=${x}&y=${y}&width=${width}&height=${height}`;
  imagePreviewEl.setAttribute('src', cropUrl);
});

updateAll();
