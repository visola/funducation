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
  
  let filtered = image.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());

  const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    .filter((c) => c.hierarchy.z >= 0);
  const contour = contours[0];
  image.drawContours([contour.getPoints()], 0, new cv.Vec(0, 255, 0));

  response.set('Content-Type', 'image/bmp');
  response.send(opencv.toBuffer(image));
}

function handleListObjects(_, response) {
  response.json(objects.listAll());
}

module.exports = {
  setup(app) {
    app.get('/objects/:type/:value', handleGetObject);
    app.get('/objects', handleListObjects);
    app.post('/objects', handleCreateObject);
  },
};
