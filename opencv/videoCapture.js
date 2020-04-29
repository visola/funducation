const cv = require('opencv4nodejs');

let lastCapturedFrame = null;

function capture() {
  const videoCapture = new cv.VideoCapture(0);
  lastCapturedFrame = videoCapture.read();
  videoCapture.release();
  return lastCapturedFrame;
}

module.exports = {
  capture,
  get lastCapturedFrame() {
    if (!lastCapturedFrame) {
      capture();
    }
    return lastCapturedFrame;
  }
};
