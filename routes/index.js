const cv = require('opencv4nodejs');
const contours = require('../opencv/contours');
const videoCapture = require('../opencv/videoCapture');

function handleCaptureImage(_, response) {
  response.set('Content-Type', 'image/bmp');
  response.send(cv.imencode('.bmp', videoCapture.capture()));
};

function handleContours(_, response) {
  response.set('Content-Type', 'application/json');
  response.send(JSON.stringify(contours.contours.map((c) => c.boundingRect())));
};

module.exports = {
  setup(app) {
    app.get('/capture', handleCaptureImage);
    app.get('/contours', handleContours);
  },
};
