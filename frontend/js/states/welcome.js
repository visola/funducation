const app = require('../application');
const assets = require('../assets');
const textToSpeech = require('../textToSpeech');

module.exports = function () {
  app.addImage(assets.candy, 250, 250);
  textToSpeech.speak('Hello! My name is Candy, the sheep. Can you please write your name for me?');
};
