const cv = require('opencv4nodejs');
const { dataDir } = require('../../common/dataDirectory');
const fs = require('fs');
const path = require('path');
const join = path.join;

const baseObjectsDir = path.join(dataDir, 'objects');

function detectIn(frame, objects) {
  let filtered = frame.cvtColor(cv.COLOR_BGR2GRAY);
  filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
  const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  const matchedIndexes = new Set();
  return contours.map((contour, index) => {
    if (matchedIndexes.has(contour.hierarchy.z)) {
      return;
    }

    const rect = contour.boundingRect();
    if (rect.height < 30 || rect.width < 30 || rect.height > 150 || rect.width > 150) {
      return;
    }

    const bestMatch = objects.map((template) => {
      return {
        match: contour.matchShapes(template.contour, 1),
        template: template,
      };
    }).filter((r) => r.match < 0.4)
    .sort((r1, r2) => {
      return r1.match - r2.match;
    })[0];

    if (!bestMatch) {
      return null;
    }

    matchedIndexes.add(index);
    const { match, template } = bestMatch;
    return {contour, match, template};
  }).filter((m) => m != null); // Remove contours that didn't match
}

function listAll() {
  const objects = [];
  walkDirectory(baseObjectsDir, (file) => {
    objects.push(JSON.parse(fs.readFileSync(file)));
  });
  return objects;
}

function listProcessedObjects() {
  return listAll().map((object) => {
    object.frame = cv.imdecode(Buffer.from(object.image, 'base64'));

    let filtered = object.frame.cvtColor(cv.COLOR_BGR2GRAY);
    filtered = filtered.inRange(new cv.Vec(50, 50, 50).norm(), new cv.Vec(100, 100, 100).norm());
    const contours = filtered.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
      .filter((c) => c.hierarchy.z >= 0);
    object.contour = contours[0];

    return object;
  });
}

function loadObject(type, value) {
  const objectFile = path.join(baseObjectsDir, type, `${value}.json`);
  return JSON.parse(fs.readFileSync(objectFile));
}

function loadObjects(type) {
  const typeDir = path.join(baseObjectsDir, type);
  return fs.readdirSync(typeDir).map((file) => {
    return JSON.parse(fs.readFileSync(path.join(typeDir, file)));
  });
}

function saveObject(object) {
  const typeDir = path.join(baseObjectsDir, object.type);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(typeDir, `${object.value}.json`), JSON.stringify(object));
}

function walkDirectory(path, callback) {
  const dirents = fs.readdirSync(path, { withFileTypes: true });

  dirents.forEach(dirent => {
    if (dirent.isDirectory()) {
      walkDirectory(join(path, dirent.name), callback);
    } else {
      callback(join(path, dirent.name));
    }
  });
}

module.exports = {
  detectIn,
  listAll,
  listProcessedObjects,
  loadObject,
  loadObjects,
  saveObject,
};
