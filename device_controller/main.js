const express = require('express');

const app = express();

app.use(express.json({limit: '50mb'}));

require('./routes').setup(app);

app.use(express.static('static/css'));
app.use(express.static('static/html'));
app.use(express.static('static/js'));

const port = 3000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
