const { dataDir } = require('../../common/dataDirectory');
const fs = require('fs');
const path = require('path');
const join = path.join;

const baseObjectsDir = path.join(dataDir, 'objects');

function listAll() {
  const objects = [];
  walkDirectory(baseObjectsDir, (file) => {
    objects.push(JSON.parse(fs.readFileSync(file)));
  });
  return objects;
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
  listAll,
  loadObject,
  loadObjects,
  saveObject,
};
