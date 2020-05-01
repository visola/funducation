const cv = require('opencv4nodejs');
const objects = require('../model/objects');
const opencv = require('../opencv');

function handleCreateObject(req ,resp) {
  objects.saveObject(req.body);
  resp.json(req.body);
}

function handleGetObject(req, response) {
  const { type, value } = req.params;
  const object = objects.loadObject(type, value);

  const image = cv.imdecode(Buffer.from(object.image, 'base64'));
  const detector = new cv.AKAZEDetector();
  const keyPoints = detector.detect(image);
  cv.drawKeyPoints(image, keyPoints);

  response.set('Content-Type', 'image/bmp');
  response.send(opencv.toBuffer(image));
}

module.exports = {
  setup(app) {
    app.get('/objects/:type/:value', handleGetObject);
    app.post('/objects', handleCreateObject);
  },
};
