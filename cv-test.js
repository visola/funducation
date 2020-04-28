const fs = require('fs');
const http = require('http');
const cv = require('opencv4nodejs');

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

  const keyPoints = new cv.ORBDetector().detect(frame);
  console.log(`Detect (ORB): ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  let filtered = frame.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  const contours = filtered.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
  console.log(`Contours: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  frame = cv.drawKeyPoints(frame, keyPoints);
  contours.forEach((c) => frame.drawContours([c.getPoints()], 0, new cv.Vec(0, 255, 0)));
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

