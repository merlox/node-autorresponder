'use stict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const publicRoutes = require('./server/publicRoutes.js');

app.use('/autorresponder', publicRoutes);

app.listen(8888,  0.0.0.0, (req, res) => {
	console.log('Listening on localhost:8888');
});