const PIXI = require('pixi.js');
const app = require('./application');

const assets = {
  forrest: PIXI.Texture.from('./assets/forrest.png'),
  mountains: PIXI.Texture.from('./assets/mountains.png'),
  penguin: PIXI.Texture.from('./assets/penguin.png'),
};

/**
 * Load a texture as a sprite with a scale set as proportion of the view.
 * 
 * @param {string} name Name of the texture to load.
 * @param {number} proportion Proportion of the view to set as the size.
 */
function getSprite(name, proportion) {
  const sprite = new PIXI.Sprite(assets[name]);
  const originalProportion = 100 * sprite.height / app.view.height;
  const scale = proportion * originalProportion;
  sprite.scale = new PIXI.Point(scale, scale);
  return sprite;
}

module.exports = {
  getSprite,
};
