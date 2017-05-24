'use strict';

process.env.NODE_ENV = 'test';

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongoUrl = require('./../config/config.json').testMongo;
const chai = require('chai');
const should = chai.should();
const assert = require('assert');
const cronAutorresponder = require('./../cronAutorresponder.js');
let db = {};

describe('SEND AUTORRESPONDER', () => {
	beforeEach(cb => {
		mongo.connect(mongoUrl, (err, database) => {
			db = database;
			db.collection('autorresponders').remove({}, err => {
				db.collection('autorrespondersCategory').remove({}, err => {
					db.collection('autorrespondersSubscribers').remove({}, err => {

						cb(null);
					});
				});
			});
		});
	});

	it('Should send one autorresponder to the correct email', cb => {
		const category = {
			name: 'example'
		};
		const subscriber = {
			category: 'example',
			email: 'merunasgrincalaitis@gmail.com'
		};
		const autorresponder = {
			category: 'example',
			title: 'This is the test autorresponder',
			content: '<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 1
		};

		db.collection('autorrespondersCategory').insert(category, err => {
			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				db.collection('autorresponders').insert(autorresponder, err => {
					cronAutorresponder(done => {

						cb();
					});
				});
			});
		});
	});

	it('Should send 2 autorresponders to the correct emails', cb => {
		const category = {
			name: 'example'
		};
		const subscribers = [{
			category: 'example',
			email: 'merunasgrincalaitis@gmail.com'
		}, {
			category: 'example',
			email: 'merloxdixcontrol@gmail.com'
		}];
		const autorresponders = [{
			category: 'example',
			title: 'This is the test autorresponder',
			content: '<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 1
		}, {
			category: 'example',
			title: 'AThis is the test autorresponder',
			content: 'A<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 5
		}];

		db.collection('autorrespondersCategory').insert(category, err => {
			db.collection('autorrespondersSubscribers').insert(subscribers, err => {
				db.collection('autorresponders').insert(autorresponders, err => {
					cronAutorresponder(done => {

						cb();
					});
				});
			});
		});
	});

	it('Should set the lastSentDate and lastEmail sent of the subscriber correctly', cb => {
		const category = {
			name: 'example'
		};
		const subscriber = {
			category: 'example',
			email: 'merunasgrincalaitis@gmail.com'
		};
		const autorresponder = {
			category: 'example',
			title: 'This is the test autorresponder',
			content: '<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 1
		};

		db.collection('autorrespondersCategory').insert(category, err => {
			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				db.collection('autorresponders').insert(autorresponder, err => {
					cronAutorresponder(done => {
						db.collection('autorrespondersSubscribers').findOne(subscriber, (err, subscriberFound) => {
							subscriberFound.should.not.equals(null);
							subscriberFound.should.have.property('lastSentDate');
							subscriberFound.should.have.property('lastEmail');
							subscriberFound.should.have.property('lastEmail').eql(autorresponder.order);

							cb();
						});
					});
				});
			});
		});
	});

	it('Should send the next email when the hours in config.json have passed', cb => {
		let nextDay = new Date();
		nextDay.setDate(nextDay.getDate() - 1.1);

		const category = {
			name: 'example'
		};
		const subscriber = {
			category: 'example',
			email: 'merunasgrincalaitis@gmail.com',
			lastEmail: 1,
			lastSentDate: nextDay
		};
		const autorresponders = [{
			category: 'example',
			title: 'This is the test autorresponder',
			content: '<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 1
		}, {
			category: 'example',
			title: 'AThis is the test autorresponder',
			content: 'A<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 5
		}];


		db.collection('autorrespondersCategory').insert(category, err => {
			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				db.collection('autorresponders').insert(autorresponders, err => {
					cronAutorresponder(done => {
						db.collection('autorrespondersSubscribers').findOne({
							email: subscriber.email
						}, (err, subscriberFound) => {
							subscriberFound.should.not.equals(null);
							subscriberFound.should.have.property('lastSentDate');
							subscriberFound.should.have.property('lastEmail');
							subscriberFound.should.have.property('lastEmail').eql(autorresponders[1].order);

							cb();
						});
					});
				});
			});
		});
	});

	it('Should not send the next email when the hours in config.json have not passed', cb => {
		const category = {
			name: 'example'
		};
		const subscriber = {
			category: 'example',
			email: 'merunasgrincalaitis@gmail.com',
			lastEmail: 1,
			lastSentDate: new Date() // Today
		};
		const autorresponders = [{
			category: 'example',
			title: 'This is the test autorresponder',
			content: '<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 1
		}, {
			category: 'example',
			title: 'AThis is the test autorresponder',
			content: 'A<h2>Hello sir.</h2> <br/>You are receiving this autorresponder correctly',
			order: 5
		}];


		db.collection('autorrespondersCategory').insert(category, err => {
			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				db.collection('autorresponders').insert(autorresponders, err => {
					cronAutorresponder(done => {
						db.collection('autorrespondersSubscribers').findOne(subscriber, (err, subscriberFound) => {
							subscriberFound.should.not.equals(null);
							subscriberFound.should.have.property('lastSentDate');
							subscriberFound.should.have.property('lastEmail');
							subscriberFound.should.have.property('lastEmail').eql(autorresponders[0].order);

							cb();
						});
					});
				});
			});
		});
	});
});