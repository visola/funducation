const app = require('./js/application');
const assets = require('./js/assets');

document.body.innerHTML = '';
document.body.appendChild(app.view);
window.addEventListener('resize', () => {
  app.setSize(window.innerWidth, window.innerHeight);
});
app.setSize(window.innerWidth, window.innerHeight);

app.addImage(assets.forest, 10, 10, 150, 150);
