const express = require('express');
const app = express();
const port = 3000;

app.use(express.json({limit: '50mb'}));

require('./routes').setup(app);

app.use(express.static('static/css'));
app.use(express.static('static/html'));
app.use(express.static('static/js'));

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
