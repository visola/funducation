const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

const dataDir = path.join(homedir, 'funducation');

function ensureDataDirectoryExists() {
  if (fs.existsSync(dataDir)) {
    return;
  }

  fs.mkdirSync(dataDir, { recursive: true });
}

ensureDataDirectoryExists();

module.exports = {
  get dataDir() {
    return dataDir;
  },
};
