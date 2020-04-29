const cv = require('opencv4nodejs');
const videoCapture = require('./videoCapture');

function contours() {
  let filtered = videoCapture.lastCapturedFrame.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  return filtered.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
}

module.exports = {
  get contours() {
    return contours();
  },
};
