const PIXI = require('pixi.js');

let app = new PIXI.Application({ 
  antialias: true,
});

app.renderer.backgroundColor = 0xCCDDCC;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

module.exports = app;
