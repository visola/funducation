const app = require('./js/application');

document.body.innerHTML = '';
document.body.appendChild(app.view);

require('./js/state');
