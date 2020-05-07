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
  const templates = objects.listAll().map((object) => {
    object.image = cv.imdecode(Buffer.from(object.image, 'base64'));

    let filtered = object.image.cvtColor(cv.COLOR_BGR2GRAY);
    filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
    const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
      .filter((c) => c.hierarchy.z >= 0);
    object.contour = contours[0];
  
    return object;
  });

  response.set('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
  const sendNextFrame = () => {
    const frame = opencv.lastFrame;

    let filtered = frame.cvtColor(cv.COLOR_BGR2GRAY);
    filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
    const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    const matchedIndexes = new Set();
    contours.forEach((contour, index) => {
      if (matchedIndexes.has(contour.hierarchy.z)) {
        return;
      }

      const rect = contour.boundingRect();
      if (rect.height < 30 || rect.width < 30 || rect.height > 150 || rect.width > 150) {
        return;
      }

      const bestMatch = templates.map((template) => {
        return {
          match: contour.matchShapes(template.contour, 1),
          template: template,
        };
      }).filter((r) => r.match < 0.4)
      .sort((r1, r2) => {
        return r1.match - r2.match;
      })[0];

      if (bestMatch) {
        matchedIndexes.add(index);
        const { match, template } = bestMatch;
        frame.drawRectangle(contour.boundingRect(), new cv.Vec(0, 255, 255));
        const {x, y} = contour.boundingRect();
        frame.putText(
          `${template.value}:${Math.round(10000*match)/10000} `,
          new cv.Point(x - 2, y),
          cv.FONT_HERSHEY_SIMPLEX,
          0.5,
          new cv.Vec(255, 255, 0),
          2,
        );
      }
    });

    response.write(`--frame\nContent-Type: image/bmp\n\n`);
    response.write(opencv.toBuffer(frame));
  };

  const timer = setInterval(sendNextFrame, 250);
  response.addListener('close', () => {
    clearInterval(timer);
  })
}

module.exports = {
  setup(app) {
    app.get('/objects', handleListObjects);
    app.post('/objects', handleCreateObject);

    app.get('/objects/:type/:value', handleGetObject);
    
    app.get('/objects/match-test', handleMatchTest);
  },
};
