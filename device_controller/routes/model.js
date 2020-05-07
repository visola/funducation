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

function handleMatchTest(_, response) {
  const templates = objects.listProcessedObjects();

  response.set('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
  const sendNextFrame = () => {
    const frame = opencv.lastFrame;
    objects.detectIn(frame, templates).forEach((d) => {
      const rect = d.contour.boundingRect();
      frame.drawRectangle(rect, new cv.Vec(0, 255, 255));
      frame.putText(
        `${d.template.value}:${Math.round(10000*d.match)/10000} `,
        new cv.Point(rect.x - 2, rect.y),
        cv.FONT_HERSHEY_SIMPLEX,
        0.5,
        new cv.Vec(255, 255, 0),
        2,
      );
    });

    response.write(`--frame\nContent-Type: image/bmp\n\n`);
    response.write(opencv.toBuffer(frame));
  };

  const timer = setInterval(sendNextFrame, 250);
  response.addListener('close', () => {
    clearInterval(timer);
  });
}

function handleDetect(_, response) {
  const frame = opencv.lastButtonFrame;
  if (frame == null) {
    response.json({});
    return;
  }

  const templates = objects.listProcessedObjects();
  const detected = objects.detectIn(opencv.lastButtonFrame, templates).map((d) => {
    const { x, y, width, height } = d.contour.boundingRect();
    const { type, value } = d.template;
    return {height, type, value, width, x, y};
  });
  response.json({buttonPressedAt: opencv.buttonPressedAt, detected});
}

module.exports = {
  setup(app) {
    app.get('/detect', handleDetect);
    app.get('/objects', handleListObjects);
    app.post('/objects', handleCreateObject);
    app.get('/objects/:type/:value', handleGetObject);
    app.get('/objects/match-test', handleMatchTest);
  },
};
