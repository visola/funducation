const model = require('./model');
const opencv = require('./opencv');

module.exports = {
  setup(app) {
    model.setup(app);
    opencv.setup(app);
  },
};
