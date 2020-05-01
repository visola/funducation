const cv = require('opencv4nodejs');
const fs = require('fs');
const http = require('http');
const objects = require('./model/objects');

const detector = new cv.ORBDetector();

const baseKeyPoints = objects.loadObjects('letter').map((object) => {
  const image = cv.imdecode(Buffer.from(object.image, 'base64'));
  console.log(`Image loaded: ${image.cols}X${image.rows}`);
  const keyPoints = detector.detect(image);
  console.log(`  Keypoints: ${keyPoints}`);
  const description = detector.compute(image, keyPoints);
  console.log(`  Description: ${description.cols}X${description.rows}`);
  return {
    description,
    image,
    keyPoints,
    type: object.type,
    value: object.value,
  };
});

var server = http.createServer(function(request, response) {
  const start = Date.now();
  let local = Date.now();

  const capture = new cv.VideoCapture(0);
  let frame = capture.read();
  console.log(`Capture: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  capture.release();
  console.log(`Release: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  let filtered = frame.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  const contours = filtered.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
  console.log(`Contours: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  baseKeyPoints.forEach((kp) => {
    console.log(`Compare ${kp.value}: ${Date.now() - start}ms, ${Date.now() - local}ms`);
    local = Date.now();

    contours.forEach((c) => {
      try {
        const rect = c.boundingRect();
        rect.x -= 10;
        rect.y -= 10;
        rect.width= 10;
        rect.height= 10;

        if (rect.height == 1 || rect.width == 1) {
          return;
        }

        frame.drawRectangle(c.boundingRect(), new cv.Vec(255, 255, 255));
        const area = frame.getRegion(rect);
        const keyPoints = detector.detect(area);
        const description = detector.compute(area, keyPoints);
        console.log('-----');
        console.log(description.cols, kp.description.cols);
        console.log(cv.matchBruteForceHammingLut(description, kp.description).length);
        console.log('-----');
      } catch(e) {console.log(e);}
    });
  });

  contours.forEach((c) => {
    frame.drawContours([c.getPoints()], 0, new cv.Vec(0, 255, 0));
    frame.drawRectangle(c.boundingRect(), new cv.Vec(0, 255, 255));
  });
  console.log(`Drawing: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  const buffer = cv.imencode('.bmp', frame);
  console.log(`Encode: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  response.writeHead(200, { 'Content-type': 'image/bmp' });
  response.write(buffer);
  response.end();
  console.log(`---- Total: ${Date.now() - start}ms`);
});

server.listen(8080);
console.log("Server is listening on port 8080");
