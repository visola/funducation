const PIXI = require('pixi.js');

const app = require('./js/application.js');
document.body.innerHTML = '';
document.body.appendChild(app.view);

const assets = require('./js/assets.js');
const stage = require('./js/stage.js');

const forrest = assets.getSprite('forrest', 5);
stage.add(forrest, 10, 10);

const mountains = assets.getSprite('mountains', 5);
stage.add(mountains, 70, 70);
