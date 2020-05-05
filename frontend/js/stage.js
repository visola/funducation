const app = require('./application');

/**
 * 
 * @param {PIXI.Container} container The container to add to stage.
 * @param {number} posX X position as a proportion of the view size (0-100).
 * @param {nnumber} posY Y position as a proportion of the view size (0-100).
 */
function addToStage(container, posX, posY) {
  container.x = app.view.width / 100 * posX;
  container.y = app.view.height / 100 * posY;
  app.stage.addChild(container);
}

module.exports = {
  add: addToStage,
};
