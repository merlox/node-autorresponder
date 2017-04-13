'use strict';

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const config = require('./config/config.json');
const path = require('path');
const sendEmail = require('./email/email.js').sendEmail;
const render = require('./email/render.js');
let mongoUrl = '';
let db = {};

if(process.env.NODE_ENV === 'test')
	mongoUrl = config.testMongo;
else
	mongoUrl = config.mongo;

if(process.argv[2] === 'start'){
	sendAutorresponders(response => {
		console.log(response);
		process.exit(0);
	}); // On start send autorresponders
}

module.exports = sendAutorresponders;

/**
 * 1º It connects to the database
 * 2º It gets all the subcribers
 * 3º It gets the email to send
 * 4º It renders the email to send
 * 5º It sends the email to the subscriber in his category
 * IF there are error, just log them to the screen and continue with the next autorresponder
 */
function sendAutorresponders(callback){
	connectDb(done => {
		getSubscribers((err, subscribers) => {
			if(err) return callback(err);

			let autorrespondersSent = 0;
			let autorrespondersChecked = 0;

			for(let i = 0; i < subscribers.length; i++){
				const subscriber = subscribers[i];

				getSubscriberCategoryAutorresponders(subscriber.category, (err, autorresponders) => {
					if(err) console.log(err);

					const nextAutorresponder = getNextAutorresponderToSend(subscriber, autorresponders);

					if(nextAutorresponder != null){
						renderAndSendAutorresponder(subscriber.email, nextAutorresponder, err => {
							if(err) console.log(err);
							
							autorrespondersChecked++;
							autorrespondersSent++;

							saveSentDateEmail(subscriber, nextAutorresponder, err => {
								if(err) console.log(err);

								if(autorrespondersChecked >= subscribers.length){
									return callback(`Done sending autorresponders. Autorresponders sent: ${autorrespondersSent} from: ${subscribers.length} subscribers and ${autorrespondersChecked} autorresponders checked.`);
								}
							});
						});
					}else{
						autorrespondersChecked++;

						if(autorrespondersChecked >= subscribers.length){
							return callback(`Done sending autorresponders. Autorresponders sent: ${autorrespondersSent} from: ${subscribers.length} subscribers and ${autorrespondersChecked} autorresponders checked.`);
						}
					}
				});
			}
		});
	});

	function getSubscribers(cb){
		db.collection('autorrespondersSubscribers').find({}).toArray((err, subscribers) => {
			if(err) return cb('#1 Error seaching for subscribers', null);
			if(!subscribers || subscribers.length <= 0) return cb('#2 No subscribers found', null);

			return cb(null, subscribers);
		});
	};

	function getSubscriberCategoryAutorresponders(category, cb){
		db.collection('autorresponders').find({
			category: category
		}, {
			sort: [['order', 'asc']]
		}).toArray((err, autorresponders) => {
			if(err) return cb(`#3 Error getting the autorresponders of the category: ${category}`, null);
			if(!autorresponders || autorresponders.length <= 0) 
				return cb(`#4 No autorresponders found for the category: ${category}`, null);

			cb(null, autorresponders);
		});
	};

	/* Returns the next autorresponder to send or null if the last one has been sent 
	 or null if the hours passed between the last sent email and now is less than the
	 emailHoursBetweenEmails in config.json */
	function getNextAutorresponderToSend(subscriber, autorresponders){
		const isFirstAutorresponder = Object.keys(subscriber).indexOf('lastEmail');
		let nextAutorresponder = null;

		// If the first autorresponders has been sent
		if(isFirstAutorresponder !== -1){

			// Check if the last email's order is bigger or equal than this autorresponder
			if(subscriber.lastEmail < autorresponders[autorresponders.length - 1].order){
				const hoursAfterLastEmail = parseInt(((new Date().getTime() - subscriber.lastSentDate.getTime()) / (1000*60*60)));

				if(hoursAfterLastEmail >= config.emailHoursBetweenEmails){
					findNextAutorresponderByOrder();
				}

				// If the emailHoursBetweenEmails have not passed, return null at the end
			}
		}else{
			nextAutorresponder = autorresponders[0];
		}

		return nextAutorresponder;

		/**
		 * Loops all the keys of all the autorresponders and checks if the order 
		 * is eql subscriber.lastEmail if so, gets the next autorresponder
		 */
		function findNextAutorresponderByOrder(){
			let isNext = false;

			for(let i = 0; i < autorresponders.length; i++){
				const autorresponder = autorresponders[i];

				if(isNext){
					nextAutorresponder = autorresponder;
					break;
				}

				for(let key in autorresponder){
					if(key === 'order' && autorresponder[key] === subscriber.lastEmail){
						isNext = true;
					}
				}
			}
		};
	};

	function renderAndSendAutorresponder(subscriberEmail, autorresponder, cb){
		render(path.join(__dirname, 'email', 'email.html'), {
			emailContent: autorresponder.content
		}, (err, html) => {
			if(err) cb(`#7 Error rending the email to send to ${subscriberEmail}`);

			const emailData = {
				from: config.emailFrom,
				to: subscriberEmail,
				subject: autorresponder.title,
				html: html,
				image: 'emailImage.jpg'
			};

			sendEmail(emailData, err => {
				if(err) cb(`#6 Could not send the email to: ${subscriberEmail}`);

				cb(null);
			});
		});
	};

	function saveSentDateEmail(subscriber, autorresponder, cb){
		db.collection('autorrespondersSubscribers').update(subscriber, {
			$set: {
				lastEmail: autorresponder.order,
				lastSentDate: new Date()
			}
		}, err => {
			if(err) return cb(`#8 Error setting the last email of the subscriber: ${subscriber.email}`);

			cb(null);
		});
	};
};

function connectDb(cb){
	mongo.connect(mongoUrl, (err, database) => {
		if(err) endExecution(err);

		db = database;
		cb();
	});
};

function endExecution(err){
	console.log(err);
	process.exit(1);
};