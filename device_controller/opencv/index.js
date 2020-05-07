const cv = require('opencv4nodejs');

const videoCapture = new cv.VideoCapture(0);

let lastFrame = null;
let lastCapturedFrame = null;

function capture() {
  lastCapturedFrame = lastFrame;
  return lastCapturedFrame;
}

function contours() {
  let filtered = ensureFrame().cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  return filtered.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
}

function crop(x, y, width, height) {
  const frame = ensureFrame();

  if (!x || x <= 0) x = 1;
  if (!y || y <= 0) y = 1;
  if (x > frame.cols) x = frame.cols - 2;
  if (y > frame.rows) y = frame.rows - 2;
  if (!width || x + width > frame.cols) width = frame.cols - x;
  if (!height || y + height > frame.rows) height = frame.rows - y;

  return frame.getRegion(new cv.Rect(x, y, width, height));
}

function ensureFrame() {
  if (!lastCapturedFrame) {
    capture();
  }
  return lastCapturedFrame;
}

function readNextFrame() {
  videoCapture.readAsync()
    .then((frame) => {
      lastFrame = frame;
      readNextFrame();
    });
}

function toBuffer(image) {
  return cv.imencode('.bmp', image);
}

// Ensure video is up and a frame exists
lastFrame = lastCapturedFrame = videoCapture.read();
// Read frames continuously
readNextFrame();

module.exports = {
  capture,
  get contours() {
    return contours();
  },
  crop,
  get lastCapturedFrame() {
    return ensureFrame();
  },
  get lastFrame() {
    return lastFrame;
  },
  toBuffer,
};
