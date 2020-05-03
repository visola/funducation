const cv = require('opencv4nodejs');
const fs = require('fs');
const http = require('http');
const objects = require('./model/objects');

const templates = objects.loadObjects('letter').map((object) => {
  object.image = cv.imdecode(Buffer.from(object.image, 'base64'));

  let filtered = object.image.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    .filter((c) => c.hierarchy.z >= 0);
  object.contour = contours[0];

  return object;
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
  const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
  console.log(`Contours: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

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
      console.log(template.value, template.contour.arcLength(), contour.arcLength(), Math.abs(template.contour.arcLength() - contour.arcLength()));
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

    console.log(`Matching shapes: ${Date.now() - start}ms, ${Date.now() - local}ms`);
    local = Date.now();
  });

  contours.forEach((c) => {
    frame.drawContours([c.getPoints()], 0, new cv.Vec(0, 255, 0));
    // frame.drawRectangle(c.boundingRect(), new cv.Vec(0, 255, 255));
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
