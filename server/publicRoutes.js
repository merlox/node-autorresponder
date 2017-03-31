'use strict';

const router = require('express').Router();
const functions = require('./functions.js');

/**
 * Things to note: 
 * ► This plugin is written totally in english
 * ► A message is also called an autorresponder
 * ► Subscribers and autorresponders have categories
 * ► Removing a subscriber, category or autorresponder just moves it to a backup database
 * ► There can be only 1 admin user that gets written in the secrets file the first time you start the app
 * ► Update category subscribers categoryname and autorresponders categoryname when category name changes in /edit-category
 */

/**
 * CRUD Categories
 */

// Gets a single category given the categoryName with subscribers and get autorresponders
router.get('/get-all-categories/', (req, res) => {
	const response = {
		err: null,
		categories: []
	};

	functions.getAllCategories((err, categories) => {
		if(err) response.err = err;
		response.categories = categories;
		res.send(response);
	});
});

// Gets a single category given the categoryName with subscribers and get autorresponders
router.get('/get-category/:categoryName', (req, res) => {
	const categoryName = req.params.categoryName;
	const response = {
		err: null,
		category: null
	};

	functions.getCategory(categoryName, (err, json) => {
		if(err) response.err = err;
		response.category = json;
		res.send(response);
	});
});

// Creates a new category and sets the default values
router.get('/add-category/:categoryName', (req, res) => {
	const categoryName = req.params.categoryName;
	const response = {
		err: null
	};

	functions.addCategory(categoryName, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

// Changes a category name
router.post('/edit-category/:categoryName', (req, res) => {
	const categoryName = req.params.categoryName;
	const newCategoryName = req.body.newCategoryName;
	const response = {
		err: null
	};

	functions.editCategory(categoryName, newCategoryName, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

// Moves the category to the 'autorrespondersDeletedCategories' database as a backup instead of deleting it
router.get('/remove-category/:categoryName', (req, res) => {
	const categoryName = req.params.categoryName;
	const response = {
		err: null
	};

	functions.removeCategory(categoryName, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

/**
 * CRUD Autorresponders
 */

// Gets one autorresponder given an _id
router.get('/get-single-autorresponder/:_id', (req, res) => {
	const _id = req.params._id;
	const response = {
		err: null,
		autorresponder: null
	};

	functions.getSingleAutorresponder(_id, (err, single) => {
		if(err) response.err = err;
		response.autorresponder = single;
		res.send(response);
	});
});

/** Adds an autorresponder to the category
 *  autorresponder = {
 *  	title, content, category
 *  }
 */
router.post('/add-autorresponder', (req, res) => {
	const autorresponder = req.body;
	const response = {
		err: null
	};
	
	functions.addAutorresponder(autorresponder, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

/**
 * Changes an autorresponder given an _id
 * autorresponder = {
 * 		title, content, category_id, order (Min 1 field)
 * }
 */
router.post('/edit-autorresponder/:_id', (req, res) => {
	const _id = req.params._id;
	const autorresponder = req.body;
	const response = {
		err: null
	};
	
	functions.editAutorresponder(_id, autorresponder, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

// Moves the autorresponder to the 'autorrespondersDeleted' database for backup purposes instead of deleting it
router.get('/remove-autorresponder/:_id', (req, res) => {
	const _id = req.params._id;
	const response = {
		err: null
	};
	
	functions.deleteAutorresponder(_id, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

/** 
 * CRUD Subscriber
 */

// Get one subscriber given the _id
router.get('/get-subscriber/:_id', (req, res) => {
	const _id = req.params._id;
	const response = {
		err: null,
		subscriber: null
	};

	functions.getSubscriber(_id, (err, json) => {
		if(err) response.err = err;
		response.subscriber = json;
		res.send(response);
	});
});

/**
 * Adds a new subscriber to the given category
 * subscriber = {
 * 		email, category, name (optional)
 * }
 */
router.post('/add-subscriber', (req, res) => {
	const subscriber = req.body.subscriber;
	const response = {
		err: null
	};

	functions.addSubscriber(subscriber, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

// Changes a subscriber given the _id
router.post('/edit-subscriber/:_id', (req, res) => {
	const _id = req.params._id;
	const newSubscriber = req.body.subscriber;
	const response = {
		err: null
	};

	functions.editSubscriber(_id, newSubscriber, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

// Moves the subscriber to the 'autorrespondersUnsubscribed' database instead of deleting for backup purposes
router.get('/remove-subscriber/:_id', (req, res) => {
	const _id = req.params._id;
	const response = {
		err: null
	};

	functions.removeSubscriber(_id, err => {
		if(err) response.err = err;
		res.send(response);
	});
});

module.exports = router;