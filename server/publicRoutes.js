'use strict';

const router = require('express').Router;

/**
 * Things to note: 
 * ► This plugin is written totally in english
 * ► A message is also called an autorresponder
 * ► A category is a group of autorresponders with subscribers
 * ► Subscribers and autorresponders are stored inside categories
 * ► Removing a subscriber, category or autorresponder just moves it to a backup database
 */

/**
 * CRUD Autorresponders
 * {
 * 		id: 'id',
 * 		title: 'string',
 * 		content: 'string',
 * 		category: 'string',
 * 		created: 'date',
 * 		order: 'int' // The order in which send this autorresponder
 * }
 */

// Gets one autorresponder given an id
router.get('/get-single-autorresponder/:id', (req, res) => {
	const id = req.params.id;
	const response = {
		err: null,
		autorresponder: null
	};

	functions.getSingleAutorresponder(id, (err, single) => {
		if(err) response.err = err;
		response.autorresponder = single;
		res.send(response);
	});
});

// Adds an autorresponder to the category
router.post('/add-autorresponder/:category', (req, res) => {
	const category = req.params.category;
	const autorresponder = req.body.data.autorresponder;
	
	functions.addAutorresponder(category, autorresponder, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Changes an autorresponder given an id
router.post('/edit-autorresponder/:id', (req, res) => {
	const id = req.params.id;
	const autorresponder = req.body.data.autorresponder;
	
	functions.editAutorresponder(id, autorresponder, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Moves the autorresponder to the 'deletedAutorresponders' database for backup purposes instead of deleting it
router.get('/remove-autorresponder/:id', (req, res) => {
	const id = req.params.id;
	
	functions.deleteAutorresponder(id, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

/**
 * CRUD Categories
 * {
 * 		id: 'id',
 * 		name: 'string',
 * 		created: 'date',
 * 		subscribers: [{}],
 * 		autorresponders: [{}]
 * }
 */

// Gets a single category given the categoryID to see stats and get autorresponders
router.get('/get-category/:category', (req, res) => {
	const category = req.params.category;
	const response = {
		err: null,
		category: null
	};

	functions.getCategory(category, (err, json) => {
		if(err) response.err = err;
		response.category = json;
		res.send(response);
	});
});

// Creates a new category and sets the default values
router.get('/add-category/:category', (req, res) => {
	const category = req.params.category;

	functions.addCategory(category, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Changes a category name
router.post('/edit-category/:category', (req, res) => {
	const category = req.params.category;
	const newCategory = req.body.data.category;

	functions.editCategory(category, newCategory, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Moves the category to the 'deletedCategories' database as a backup instead of deleting it
router.get('/remove-category/:category', (req, res) => {
	const category = req.params.category;

	functions.removeCategory(category, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

/** 
 * CRUD Subscriber
 * {
 * 		id: 'id',
 * 		email: 'string',
 * 		category: 'string',
 * 		created: 'date',
 * 		name: 'string' (optional)
 * }
 */

// Get one subscriber given the id
router.get('/get-subscriber/:id', (req, res) => {
	const id = req.params.id;
	const response = {
		err: null,
		subscriber: null
	};

	functions.getSubscriber(id, (err, json) => {
		if(err) response.err = err;
		response.subscriber = json;
		res.send(response);
	});
});

// Adds a new subscriber to the given list
router.post('/add-subscriber/:category', (req, res) => {
	const category = req.params.category;
	const subscriber = req.body.data.subscriber;

	functions.addSubscriber(category, subscriber, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Changes a subscriber given the id
router.post('/edit-subscriber/:id', (req, res) => {
	const id = req.params.id;
	const newSubscriber = req.body.data.subscriber;

	functions.editSubscriber(id, newSubscriber, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

// Moves the subscriber to the 'unsubscribed' database instead of deleting for backup purposes
router.get('/remove-subscriber/:id', (req, res) => {
	const id = req.params.id;

	functions.removeSubscriber(id, err => {
		if(err) return res.send(err);
		res.send(null);
	});
});

module.exports = router;