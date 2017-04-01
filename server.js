'use stict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const publicRoutes = require('./server/publicRoutes.js');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

if(process.env.NODE_ENV != 'test'){
	app.use((req, res, next) => {
		console.log(`\x1b[1m${req.method}\x1b[0m ${req.originalUrl} ${req.ip}`);
		next();
	});
}

app.use('/autorresponder', publicRoutes);

app.listen(8888, '0.0.0.0', (req, res) => {
	console.log('Listening on localhost:8888');
});

module.exports = app;