'use stict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const publicRoutes = require('./server/publicRoutes.js');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

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

checkConfigUser(err => {
	if(err){
		console.log(err);
		process.exit(0);
	}else{
		app.listen(8888, '0.0.0.0', (req, res) => {
			console.log('Listening on localhost:8888');
		});
	}
});

module.exports = app;

function checkConfigUser(done){
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	let config = fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf-8');

	config = JSON.parse(config);

	if(!config.username || !config.password){
		console.log('');
		console.log('> This is the first time using the node-autorresponder app, so we will setup your username and password');
		console.log('> Remember that if you forget the credentials, you can check the config/config.json file and change them anytime');
		console.log('');

		rl.question('> Write a new username (required for login): ', username => {
			rl.question('> Write a new password (required for login): ', password => {
				rl.close();
				config['username'] = username;
				config['password'] = password;

				fs.writeFile(path.join(__dirname, 'config', 'config.json'), JSON.stringify(config, null, 4), err => {
					if(err){
						const err = 'Error setting up the credentials, restart the application.'
						console.log(err);
						done(err);
					}else{
						console.log('Good! Your credentials have been set up correctly.');
						done();
					}
				});
			});
		});
	}else{
		done();
	}
};