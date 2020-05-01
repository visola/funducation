const { dataDir } = require('./dataDirectory');
const fs = require('fs');
const path = require('path');

const baseObjectsDir = path.join(dataDir, 'objects');

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

module.exports = {
  loadObject,
  loadObjects,
  saveObject,
};
