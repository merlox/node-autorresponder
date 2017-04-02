'use strict';

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const config = require('./../config/config.json');
let mongoUrl = '';
let db = {};

if(process.env.NODE_ENV === 'test')
	mongoUrl = config.testMongo;
else
	mongoUrl = config.mongo;

connectDatabase();

function connectDatabase(){
	mongo.connect(mongoUrl, (err, database) => {
		if(err){
			setTimeout(() => {

				// Retry connection on error
				connectDatabase();
			}, 3e3);
		}

		db = database;
	});
};

function getAllCategories(cb){
	const allCategories = [];
	let error = null;

	db.collection('autorrespondersCategory').find({}).toArray((err, categories) => {
		if(err) return cb(`#41 Error getting all the categories`, null);

		let counter = 0;
		if(categories.length > 0){
			for(let i = 0; i < categories.length; i++){
				getCategory(categories[i].name, (err, category) => {
					counter++;
					if(err) error = err;

					allCategories.push(category);
					if(counter >= categories.length){
						if(error) return cb(error, null);
						cb(null, allCategories);
					}
				});
			}
		}else{
			cb(null, []);
		}
	});
};

/**
 * Returns a json with the category data + autorrespondes[] + subscribers[]
 * {
 * 		categoryData,
 * 		autorresponders: [{}],
 * 		subscribers: [{}]
 * }
 */
function getCategory(categoryName, cb){
	db.collection('autorrespondersCategory').findOne({
		name: categoryName
	}, (err, json) => {
		if(err) return cb(`#1 Error getting the category ${categoryName}`, null);
		if(!json) return cb(`#36 Could not find the category ${categoryName}`, null);

		db.collection('autorresponders').find({
			category: categoryName
		}).toArray((err, autorresponders) => {
			if(err) return cb(`#11 Could not get the category ${categoryName} autorresponders`);

			if(autorresponders && autorresponders.length > 0)			
				json['autorresponders'] = autorresponders;
			else
				json['autorresponders'] = [];

			db.collection('autorrespondersSubscribers').find({
				category: categoryName
			}).toArray((err, subscribers) => {
				if(err) return cb(`#13 Could not get the subscribers for the category ${categoryName}`);

				json['subscribers'] = subscribers;
				cb(null, json);
			});
		});
	});
};

function addCategory(categoryName, cb){
	db.collection('autorrespondersCategory').findOne({
		name: categoryName
	}, (err, result) => {
		if(err) return cb(`#24 Error checking if category ${categoryName} exists`);
		if(result) return cb(`#25 The category ${categoryName} already exists`);

		db.collection('autorrespondersCategory').insert({
			name: categoryName,
			created: new Date().getTime(),
			subscribers: [],
			autorresponders: []
		}, err => {
			if(err) return cb(`#2 Could not create the category ${categoryName}`);

			cb(null);
		});
	});
};

function editCategory(categoryName, newCategoryName, cb){
	if(!categoryName) return cb(`#61 The category name cannot be empty`);
	if(!newCategoryName) return cb(`#39 The new category name cannot be empty`);

	db.collection('autorrespondersCategory').findOne({
		name: newCategoryName
	}, (err, result) => {
		if(err) return cb(`#3 Could not check if the new category ${newCategoryName} exists already`);
		if(result) return cb(`#4 That category already exists`);
		
		db.collection('autorrespondersCategory').findOne({
			name: categoryName
		}, (err, categoryFound) => {
			if(err) return cb(`#37 Error checking the category ${categoryName}`);
			if(!categoryFound) return cb(`#38 The category ${categoryName} does not exists`);

			db.collection('autorrespondersCategory').update({
				name: categoryName
			}, {
				$set: {
					name: newCategoryName
				}
			}, err => {
				if(err) return cb(`#5 Could not update the new category name ${newCategoryName}`);

				updateAllAutorrespondersAndSubscribers();
			});
		});
	});

	function updateAllAutorrespondersAndSubscribers(){
		db.collection('autorresponders').updateMany({
			category: categoryName
		}, {
			$set: {
				category: newCategoryName
			}
		}, err => {
			if(err) return cb(`#86 Error updating autorresponders category name to ${newCategoryName}`);

			db.collection('autorrespondersSubscribers').updateMany({
				category: categoryName
			}, {
				$set: {
					category: newCategoryName
				}
			}, err => {
				if(err) return cb(`#87 Error updating subscribers category name to ${newCategoryName}`);
				
				cb(null);
			});
		});
	};
};

/**
 * Moves a category to the 'autorrespondersDeletedCategories' 
 * then it removes the category from the 'autorrespondersCategory' database
 */
function removeCategory(categoryName, cb){
	db.collection('autorrespondersCategory').findOne({
		name: categoryName
	}, (err, categoryFound) => {
		if(err) return cb(`#6 Error searching for that category ${categoryName}`);
		if(!categoryFound) return cb(`#7 Could not find that category ${categoryName}`);

		db.collection('autorrespondersDeletedCategories').insert(categoryFound, err => {
			if(err) return cb(`#8 Error deleting the category ${categoryName}`);

			db.collection('autorrespondersCategory').remove({
				name: categoryName
			}, err => {
				if(err) return cb(`#9 Error deleting the category ${categoryName}`);

				cb(null);
			});
		})
	});
};

function getSingleAutorresponder(_id, cb){
	_id = utilToObjectId(_id);
	if(!ObjectId)
		return `#51 Could not convert id to objectId, must be 24 characters`;

	db.collection('autorresponders').findOne({
		_id: _id
	}, (err, autorresponder) => {
		if(err) return cb(`#10 Could not find the autorresponder ${_id}`, null);

		cb(null, autorresponder);
	})
};

function addAutorresponder(autorresponder, cb){
	let updateOrder = false;

	if(!autorresponder) return cb(`#42 No autorresponder body received`);
	if(!autorresponder.title) return cb(`#43 No autorresponder title received`);
	if(!autorresponder.content) return cb(`#44 No autorresponder content received`);
	if(!autorresponder.category) return cb(`#45 No autorresponder category received`);
	if(autorresponder.order && autorresponder.order > 0){
		updateOrder = true;
	}else if(autorresponder.order <= 0){
		return cb(`#54 The order of the autorresponder must be bigger than 0`);
	}

	db.collection('autorrespondersCategory').findOne({
		name: autorresponder.category
	}, (err, category) => {
		if(err) return cb(`#46 Error checking if category ${autorresponder.category} exists`);
		if(!category) return cb(`#47 The category ${autorresponder.category} does not exists`);

		// If no order has been set, insert it at the end of the category order
		if(!updateOrder){
			let setOrderTo1NoBiggerFound = false;

			db.collection('autorresponders').find({
				category: autorresponder.category
			}).sort({
				order: -1
			}).limit(1).toArray((err, autorrespondersFound) => {
				if(err) return cb(`#14 Error adding autorresponder to the category ${autorresponder.category}`);
				if(!autorrespondersFound) setOrderTo1NoBiggerFound = true;
				
				checkIfRepeated(autorresponder, (err, isRepeated) => {
					if(err) return cb(err);
					if(isRepeated) return cb(`#49 The autorresponder: '${autorresponder.title}' is repeated`);

					db.collection('autorresponders').insert({
						category: autorresponder.category,
						title: autorresponder.title,
						content: autorresponder.content,
						created: new Date().getTime(),
						order: (setOrderTo1NoBiggerFound) ? 1 : ++autorrespondersFound[0].order
					}, err => {
						if(err) return cb(`#15 Could not add autorresponder to the category ${autorresponder.category}`);

						cb(null);
					});
				});
			});
		}else{
			const _id = new ObjectId();

			checkIfRepeated(autorresponder, (err, isRepeated) => {
				if(err) return cb(err);
				if(isRepeated) return cb(`#56 The autorresponder: '${autorresponder.title}' is repeated`);

				db.collection('autorresponders').insert({
					_id: _id,
					category: autorresponder.category,
					title: autorresponder.title,
					content: autorresponder.content,
					created: new Date().getTime(),
					order: autorresponder.order
				}, err => {
					if(err) return cb(`#57 Could not add autorresponder to the category ${autorresponder.category}`);

					utilIncreaseOrderNextAutorresponders(_id, err => {
						if(err) return cb(err);

						cb(null);
					});
				});
			});
		}
	});

	function checkIfRepeated(autorresponder, cb){
		db.collection('autorresponders').findOne({
			category: autorresponder.category,
			title: autorresponder.title,
			content: autorresponder.content
		}, (err, autorresponderFound) => {
			if(err) cb(`#48 Error checking if autorresponder: '${autorresponder.title}' is repeated`, false);
			if(autorresponderFound) cb(null, true);
			else cb(null, false);
		});
	};
};

function editAutorresponder(_id, autorresponder, cb){
	const newAutorresponder = {};
	let updateOrder = false;
	let checkExistingCategory = false;

	_id = utilToObjectId(_id);
	if(!ObjectId)
		return `#52 Could not convert id to objectId, must be 24 characters`;

	if(!autorresponder || Object.keys(autorresponder).length < 1)
		return cb(`#50 No updating parameters received`);

	if(autorresponder.title != null && autorresponder.title.length > 0) 
		newAutorresponder['title'] = autorresponder.title;
	else if(autorresponder.title != null && autorresponder.title.length <= 0)
		return cb(`#63 The autorresponder title cannot be empty`);

	if(autorresponder.content != null && autorresponder.content.length > 0) 
		newAutorresponder['content'] = autorresponder.content;
	else if (autorresponder.content != null && autorresponder.content.length <= 0)
		return cb(`#64 The autorresponder content cannot be empty`);

	if(autorresponder.order != null && autorresponder.order > 0){
		autorresponder.order = parseInt(autorresponder.order);
		newAutorresponder['order'] = autorresponder.order;
		updateOrder = true;
	}else if(autorresponder.order != null && autorresponder.order <= 0)
		return cb(`#55 The order of the autorresponder must be bigger than 0`);

	if(autorresponder.category != null && autorresponder.category.length > 0){
		newAutorresponder['category'] = autorresponder.category;
		checkExistingCategory = true;
	}else if(autorresponder.category != null && autorresponder.category.length <= 0)
		return cb(`#65 The category of the autorresponder cannot be empty`);		 

	if(checkExistingCategory){
		db.collection('autorrespondersCategory').findOne({
			name: autorresponder.category
		}, (err, categoryFound) => {
			if(err) return cb(`#66 Error checking if category: '${autorresponder.category}' exists`);
			if(!categoryFound) return cb(`#67 The category: '${autorresponder.category}' does not exist`);

			updateAutorresponder();
		});
	}else{
		updateAutorresponder();
	}

	function updateAutorresponder(){
		db.collection('autorresponders').findOne({
			_id: _id
		}, (err, autorresponderFound) => {
			if(err) return cb(`#58 Error searching the autorresponder ${_id}`);
			if(!autorresponderFound) return cb(`#59 Cannot find the autorresponder ${_id}`);

			db.collection('autorresponders').update({
				_id: _id
			}, {
				$set: newAutorresponder
			}, err => {
				if(err) return cb(`#16 Could not update the autorresponder ${_id.toHexString()}`);

				if(updateOrder){

					// Do not increase the order of the next autorresponders if the updated one haven't changed
					if(autorresponder.order === autorresponderFound.order){
						cb(null);
					}else{
						utilIncreaseOrderNextAutorresponders(_id, err => {
							if(err) return cb(err);

							cb(null);
						});
					}
				}else{
					cb(null);
				}
			});
		});
	};
};

function deleteAutorresponder(_id, cb){
	_id = utilToObjectId(_id);
	if(!ObjectId)
		return `#53 Could not convert id to objectId, must be 24 characters`;

	db.collection('autorresponders').findOne({
		_id: _id
	}, (err, result) => {
		if(err) return cb(`#19 Error searching the autorresponder: '${_id}'`);
		if(!result) return cb(`#20 Could not find the autorresponder: '${_id}'`);

		db.collection('autorrespondersDeleted').insert(result, err => {
			if(err) return cb(`#21 Error while doing the backup of the autorresponder: '${_id}'`);

			db.collection('autorresponders').remove({
				_id: _id
			}, err => {
				if(err) return cb(`#22 Error deleting the autorresponder: '${_id}'`);

				cb(null);
			});
		});
	});
};

function getSubscriber(_id, cb){
	_id = utilToObjectId(_id);

	if(!_id)
		return cb(`#84 The subscriber id is not valid, must be 24 characters`);

	db.collection('autorrespondersSubscribers').findOne({
		_id: _id
	}, (err, subscriber) => {
		if(err) return cb(`#23 Error searching the subscriber`, null);
		if(!subscriber) return cb(`#68 No subscriber has been found`, null);

		cb(null, subscriber);
	});
};

function addSubscriber(subscriber, cb){
	if(!subscriber)
		return cb(`#69 Subscriber data has not been received`);

	if(!subscriber.email || subscriber.email.length <= 0) 
		return cb(`#27 Subscriber email cannot be empty`);

	if(!subscriber.category || subscriber.category.length <= 0)
		return cb(`#70 Subscriber category cannot be empty`);

	if(!/.+@.+\..+/.test(subscriber.email)) 
		return cb(`#62 Subscriber email is not valid`);

	// Check if this category exists
	db.collection('autorrespondersCategory').findOne({
		name: subscriber.category
	}, (err, categoryFound) => {
		if(err) return cb(`#71 Error checking if category exists`);
		if(!categoryFound) return cb(`#72 Cannot find the category in which to add the subscriber`);

		// Check if this subscriber already exists in the same category
		db.collection('autorrespondersSubscribers').findOne({
			email: subscriber.email,
			category: subscriber.category
		}, (err, subscriberFound) => {
			if(err) return cb(`#26 Error checking if subscriber ${subscriber.email} exists`);
			if(subscriberFound) return cb(`#28 Subscriber ${subscriber.email} already exists in that category`);

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				if(err) return cb(`#29 Error inserting subscriber ${subscriber.email}`);

				cb(null);
			});
		});
	});
};

function editSubscriber(_id, subscriber, cb){
	let checkExistingCategory = false;
	let checkExistingEmail = false;
	_id = utilToObjectId(_id);

	if(!_id)
		return cb(`#85 The subscriber id is not valid, must be 24 characters`);

	if(!subscriber) return cb('#30 Subscriber data cannot be empty');

	if(subscriber.category != null && subscriber.category.length > 0)
		checkExistingCategory = true;
	else if(subscriber.category != null && subscriber.category.length <= 0)
		return cb(`#73 Cannot update the subscriber to an empty category`);

	if(subscriber.name != null && subscriber.name.length <= 0)
		return cb(`#74 Cannot update the subscriber to an empty name`);

	if(subscriber.email != null && subscriber.email.length > 0){
		if(!/.+@.+\..+/.test(subscriber.email))
			return cb(`#76 Cannot update the subscriber email without a valid email`);
		else
			checkExistingEmail = true;

	}else if(subscriber.email != null && subscriber.email.length <= 0)
		return cb(`#75 Cannot update the subscriber to an empty email`);

	db.collection('autorrespondersSubscribers').findOne({
		_id: _id
	}, (err, subscriberFound) => {
		if(err) return cb(`#81 Error checking if the subscriber exists`);
		if(!subscriberFound) return cb(`#82 The subscriber ${_id} does not exists`);

		if(checkExistingEmail && checkExistingCategory){
			searchExistingEmail(err => {
				return cb(err);

				searchExistingCategory(err => {
					return cb(err);

					updateSubscriber();
				});
			});
		}else if(checkExistingCategory){
			searchExistingCategory(err => {
				return cb(err);

				updateSubscriber();
			});
		}else if(checkExistingEmail){
			searchExistingEmail(err => {
				return cb(err);

				updateSubscriber();
			});
		}else{
			updateSubscriber();
		}
	});

	function updateSubscriber(){
		db.collection('autorrespondersSubscribers').update({
			_id: _id
		}, {
			$set: subscriber
		}, err => {
			if(err) return cb(`#31 Could not update subscriber ${_id}`);

			cb(null);
		});
	};

	function searchExistingEmail(done){
		db.collection('autorrespondersSubscribers').findOne({
			email: subscriber.email
		}, (err, subscriberFound) => {
			if(err) return done(`#77 Error checking if the new email exists already`);
			if(subscriberFound) return done(`#78 The email ${subscriber.email} already exists`);

			done(null);
		});
	};

	function searchExistingCategory(done){
		db.collection('autorrespondersCategory').findOne({
			name: subscriber.category
		}, (err, categoryFound) => {
			if(err) return done(`#79 Error checking if the new category exists`);
			if(!categoryFound) return done(`#80 Cannot find the category ${subscriber.category}`);

			done(null);
		});
	};
};

function removeSubscriber(_id, cb){
	_id = utilToObjectId(_id);

	if(!_id)
		return cb(`#83 The subscriber id is not valid, must be 24 characters`);

	db.collection('autorrespondersSubscribers').findOne({
		_id: _id
	}, (err, subscriberFound) => {
		if(err) return cb(`#32 Error checking if subscriber ${_id} exists`);
		if(!subscriberFound) return cb(`#33 Could not find the subscriber ${_id}`);

		db.collection('autorrespondersUnsubscribers').insert(subscriberFound, err => {
			if(err) return cb(`#34 Error backing up the subscriber ${_id} before deleting`);

			db.collection('autorrespondersSubscribers').remove({
				_id: _id
			}, err => {
				if(err) return cb(`#35 Could not remove the subscriber ${_id}`);

				cb(null);
			});
		});
	});
};

exports.getAllCategories = getAllCategories;
exports.getCategory = getCategory;
exports.addCategory = addCategory;
exports.editCategory = editCategory;
exports.removeCategory = removeCategory;
exports.getSingleAutorresponder = getSingleAutorresponder;
exports.addAutorresponder = addAutorresponder;
exports.editAutorresponder = editAutorresponder;
exports.deleteAutorresponder = deleteAutorresponder;
exports.getSubscriber = getSubscriber;
exports.addSubscriber = addSubscriber;
exports.editSubscriber = editSubscriber;
exports.removeSubscriber = removeSubscriber;

/**
 * Convert an id to a mongo object id
 * @param {string} _id the string id to convert. Must be 24 chars
 * @returns error or null
 */
function utilToObjectId(id){
	try{
		id = new ObjectId(id);
	}catch(e){
		return null;
	}

	return id;
};

/**
 * Increases the order of the autorresponders that have bigger or equal order
 * of the _id received
 * @param {string} _id the id of the modified order autorresponder
 * @returns callback null or error
 */
function utilIncreaseOrderNextAutorresponders(_id, cb){

	// Search the autorresponder to get category and increase the order 
	// of the next autorresponders in that same category
	db.collection('autorresponders').findOne({
		_id: _id
	}, (err, autorresponderFound) => {
		if(err) return cb(`#17 Error searching the autorresponder ${_id.toHexString()}`);
		if(!autorresponderFound) return cb(`#60 Could not find the autorresponder ${_id.toHexString()}`);

		db.collection('autorresponders').updateMany({
			_id: {
				$ne: _id
			},
			category: autorresponderFound.category,
			order: {
				$gte: autorresponderFound.order
			}
		}, {
			$inc: {
				order: 1
			}
		}, err => {
			if(err) return cb(`#18 Could not increase the order of the category ${autorresponderFound.category} when updating the order of the autorresponder: '${_id.toHexString()}' ${err}`);

			cb(null);
		});
	});
};
