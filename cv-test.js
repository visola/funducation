const fs = require('fs');
const path = require('path');
const http = require('http');
const cv = require('opencv4nodejs');

const detector = new cv.ORBDetector();

const keyPointsBaseDir = 'keyPoints';
const baseKeyPoints = fs.readdirSync(keyPointsBaseDir).map((fileName) => {
  if (fileName.endsWith('_kp.jpg')) {
    return null;
  }

  const image = cv.imread(path.join(keyPointsBaseDir, fileName));
  const keyPoints = detector.detect(image);

  return {
    fileName,
    mat: detector.compute(image, keyPoints),
  };
}).filter((v) => v != null);

var server = http.createServer(function(request, response) {
  if (request.path == '/') {
    response.writeHead(404);
    return;
  }

  const start = Date.now();
  let local = Date.now();

  const capture = new cv.VideoCapture(0);
  let frame = capture.read();
  console.log(`Capture: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  capture.release();
  console.log(`Release: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  const keyPoints = detector.detect(frame);
  const description = detector.compute(frame, keyPoints);
  console.log(`Detect (ORB): ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  const matches = baseKeyPoints.map((kp) => {
    console.log(kp.fileName);
    console.log(cv.matchBruteForce(description, kp.mat).length);
  });
    

  let filtered = frame.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  const contours = filtered.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
  console.log(`Contours: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  baseKeyPoints.forEach((kp) => {
    console.log(kp.fileName);
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
      console.log(cv.matchBruteForce(description, kp.mat).length);
      }catch(e) {console.log(e, rect);}
    });
  });

  frame = cv.drawKeyPoints(frame, keyPoints);
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
