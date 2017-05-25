'use stict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const publicRoutes = require('./server/publicRoutes.js');
const path = require('path');
const fs = require('fs');
const shell = require('./shell/shell.js');

app.use('/autorresponder', express.static(path.join(__dirname, 'public/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

if(process.env.NODE_ENV != 'test'){
	app.use((req, res, next) => {
		console.log(`\x1b[1m${req.method}\x1b[0m ${req.originalUrl} ${req.ip}`);
		next();
	});
}

app.use('/autorresponder', publicRoutes);

// Send 404 not found to the routes not handled by /autorresponder
app.use((req, res, next) => {
	return res.status(404).send(`Cannot find ${req.originalUrl}`);
});

shell.checkArguments(err => {
	if(err){
		console.log(err);
		process.exit(0);
	}else{
		let configJSON = fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf-8');
		configJSON = JSON.parse(configJSON);

		app.listen(configJSON.port, configJSON.ip, (req, res) => {
			console.log(`Listening on ${configJSON.ip}:${configJSON.port}/autorresponder`);
		});
	}
});

module.exports = app;
