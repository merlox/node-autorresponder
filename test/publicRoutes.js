'use strict';

process.env.NODE_ENV = 'test';

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongoUrl = require('./../config/config.json').testMongo;
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../server.js');
const should = chai.should();
const assert = require('assert');
let db = {};

chai.use(chaiHttp);

describe('Autorresponders', () => {
	beforeEach(cb => {
		mongo.connect(mongoUrl, (err, database) => {
			if(err) return cb(err);

			db = database;
			db.collection('autorresponders').remove({}, err => {
				if(err) return cb(err);

				cb(null);
			});
		});
	});

	describe('GET autorresponder', () => {
		it('should get one autorresponder', cb => {
			chai.request(server)
				.get('/autorresponder/get-autorresponder/341234')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');

					cb();
				});
		});
	});

	describe('ADD autorresponder', () => {
		it('should not post an autorresponder without title', cb => {
			const autorresponder = {
				content: 'Este es el contenido del autorresponder',
				category: 'coches'
			};

			chai.request(server)
				.post('/autorresponder/add-autorresponder/')
				.send(autorresponder)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);

					cb();
				});
		});

		it('should not post an autorresponder without content', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				category: 'coches'
			};

			chai.request(server)
				.post('/autorresponder/add-autorresponder/')
				.send(autorresponder)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);

					cb();
				});
		});

		it('should not post an autorresponder without category', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder'
			};

			chai.request(server)
				.post('/autorresponder/add-autorresponder/')
				.send(autorresponder)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);

					cb();
				});
		});

		it('should not post an autorresponder with a non-existing category', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder',
				category: 'abcdefgz',
				order: 2
			};

			chai.request(server)
				.post('/autorresponder/add-autorresponder')
				.send(autorresponder)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);

					cb();
				});
		});

		it('should post an autorresponder without order and set it\'s order +1 bigger than the biggest one', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder',
				category: 'coches'
			};
			const insertAutorresponders = [{
				title: 'Example of a good title',
				content: 'Example of good content',
				category: 'coches',
				order: 5
			}, {
				title: 'Another example of a good title',
				content: 'Anothere example of good content',
				category: 'coches',
				order: 8
			}]

			db.collection('autorresponders').insert(insertAutorresponders, err => {
				db.collection('autorrespondersCategory').insert({
					name: 'coches'
				}, err => {
					chai.request(server)
						.post('/autorresponder/add-autorresponder')
						.send(autorresponder)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.should.have.property('err').eql(null);

							db.collection('autorresponders').find({
								category: autorresponder.category
							}).sort({
								order: -1
							}).limit(1).toArray((err, autorrespondersFound) => {
								assert.equal(autorrespondersFound[0].order, insertAutorresponders[1].order+1);

								cb();
							});
						});
				});
			});
		});

		it('should post an autorresponder with all the fields', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};

			db.collection('autorrespondersCategory').insert({
				name: 'coches'
			}, err => {
				chai.request(server)
					.post('/autorresponder/add-autorresponder')
					.send(autorresponder)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});
	});

	describe('EDIT autorresponder', () => {
		it('should not edit a non-existing autorresponder', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};
			const _id = 'dasefugh2387f9';

			chai.request(server)
				.post(`/autorresponder/edit-autorresponder/${_id}`)
				.send(autorresponder)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);
					
					cb();
				});
		});

		it('should not edit an existing autorresponder with empty fields', cb => {
			const _id = new ObjectId();
			const autorresponder = {
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};
			const autorresponderEdit = {
				title: '',
				content: '',
				category: 'coches',
				order: 5
			};

			db.collection('autorresponders').insert(autorresponder, err => {
				chai.request(server)
					.post(`/autorresponder/edit-autorresponder/${_id}`)
					.send(autorresponderEdit)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equal(null);
						
						cb();
					});
			});
		});

		it('should not edit an existing autorresponder with a non-existing category', cb => {
			const _id = new ObjectId();
			const autorresponder = {
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};
			const autorresponderEdit = {
				title: 'Este es un nuevo autorresponder genérico',
				content: 'Este es el nuevo contenido del autorresponder',
				category: 'hjoiuouio'
			};

			db.collection('autorresponders').insert(autorresponder, err => {
				chai.request(server)
					.post(`/autorresponder/edit-autorresponder/${_id}`)
					.send(autorresponderEdit)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equal(null);
						
						cb();
					});
			});
		});

		it(`should not edit the order of the next autorresponders if the updated haven't changed`, cb => {
			const _id = new ObjectId();
			const _id2 = new ObjectId();
			const autorresponders = [{
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			}, {
				_id: _id2,
				title: 'this es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 3
			}];
			const autorresponderEdit = {
				title: 'Adios',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 1
			};

			db.collection('autorresponders').insert(autorresponders, err => {
				chai.request(server)
					.post(`/autorresponder/edit-autorresponder/${_id}`)
					.send(autorresponderEdit)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						db.collection('autorresponders').find({
							_id: {
								$in: [_id, _id2]
							}
						}, (err, autorrespondersFound) => {
							for(let i = 0; i < autorrespondersFound.length; i++){
								assert.equal(autorresponders[i].order, autorrespondersFound[i].order);
							}

							cb();
						});
					});
			});
		});

		it('should edit an autorresponder', cb => {
			const _id = new ObjectId();
			const autorresponder = {
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};
			const autorresponderEdit = {
				title: 'Adios',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 5
			};

			db.collection('autorresponders').insert(autorresponder, err => {
				chai.request(server)
					.post(`/autorresponder/edit-autorresponder/${_id}`)
					.send(autorresponder)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err').eql(null);
						
						cb();
					});
			});
		});
	});

	describe('REMOVE autorresponder', () => {
		it('should not remove a non-existing autorresponder', cb => {
			const _id = 'asijfi';

			chai.request(server)
				.get(`/autorresponder/remove-autorresponder/${_id}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('err');
					res.body.err.should.not.equal(null);

					cb();
				});
		});

		it('should remove an existing autorresponder', cb => {
			const _id = new ObjectId();
			const autorresponder = {
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};

			db.collection('autorresponders').insert(autorresponder, err => {
				chai.request(server)
					.get(`/autorresponder/remove-autorresponder/${_id}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should backup the autorresponder to autorrespondersDeleted', cb => {
			const _id = new ObjectId();
			const autorresponder = {
				_id: _id,
				title: 'Este es un autorresponder genérico',
				content: 'Este es el contenido del autorresponder',
				category: 'coches',
				order: 2
			};

			db.collection('autorresponders').insert(autorresponder, err => {
				chai.request(server)
					.get(`/autorresponder/remove-autorresponder/${_id}`)
					.end((err, res) => {
						res.should.have.status(200);
						
						db.collection('autorrespondersDeleted').findOne(autorresponder, (err, autorresponderFound) => {
							assert.deepEqual(autorresponder, autorresponderFound);

							cb();
						});
					});
			});
		});
	});
});

describe('Category', () => {
	beforeEach(cb => {
		mongo.connect(mongoUrl, (err, database) => {
			if(err) return cb(err);

			db = database;
			db.collection('autorrespondersCategory').remove({}, err => {
				if(err) return cb(err);

				cb(null);
			});
		});
	});

	describe('GET ALL Categories', () => {
		it('should get all the categories', cb => {
			chai.request(server)
				.get(`/autorresponder/get-all-categories`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.should.have.property('err').eql(null);
					res.body.should.have.property('categories');
					res.body.categories.should.not.equals(null);

					cb();
				});
		});
	});

	describe('GET Category', () => {
		it('should get an existing category', cb => {
			const categoryName = 'example';

			db.collection('autorrespondersCategory').insert({
				name: categoryName
			}, err => {
				chai.request(server)
					.get(`/autorresponder/get-category/${categoryName}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);
						res.body.should.have.property('category');
						res.body.category.should.not.equals(null);

						cb();
					});
			});
		});

		it('should not get a non-existing category', cb => {
			const categoryName = 'non-existing';

			chai.request(server)
				.get(`/autorresponder/get-category/${categoryName}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equals(null);

					cb();
				});
		});
	});

	describe('ADD Category', () => {
		it('should add a category', cb => {
			const categoryName = 'hola';

			chai.request(server)
				.get(`/autorresponder/add-category/${categoryName}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.should.have.property('err').eql(null);

					cb();
				});
		});

		it('should not add an existing category', cb => {
			const categoryName = 'hola';

			db.collection('autorrespondersCategory').insert({
				name: categoryName
			}, err => {
				chai.request(server)
					.get(`/autorresponder/add-category/${categoryName}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equals(null);

						cb();
					});
			});
		});
	});

	describe('EDIT Category', () => {
		it('should edit a category', cb => {
			const categories = {
				categoryName: 'example',
				newCategoryName: 'new-example'
			};

			db.collection('autorrespondersCategory').insert({
				name: categories.categoryName
			}, err => {
				chai.request(server)
					.post(`/autorresponder/edit-category/`)
					.send(categories)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should not edit a non-existing category', cb => {
			const categories = {
				categoryName: 'example',
				newCategoryName: 'new-example'
			};

			chai.request(server)
				.post(`/autorresponder/edit-category/`)
				.send(categories)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equals(null);

					cb();
				});
		});

		it('should change all the autorresponders and subscribers category name', cb => {
			const category = {
				categoryName: 'example',
				newCategoryName: 'new-example'
			};
			const arraySubscribers = [{
				category: category.categoryName,
				email: 'subscriberName1@gmail.com'
			}, {
				category: category.categoryName,
				email: 'subscriberName2@gmail.com'
			}];
			const arrayAutorresponders = [{
				category: category.categoryName,
				title: 'This is an example',
				content: 'The content of the autorresponder'
			}, {
				category: category.categoryName,
				title: 'This is another different example',
				content: 'The content of the other autorresponder'
			}];

			db.collection('autorresponder').insert(arrayAutorresponders, err => {
				db.collection('autorrespondersSubscribers').insert(arraySubscribers, err => {
					db.collection('autorrespondersCategory').insert({
						name: category.categoryName
					}, err => {
						chai.request(server)
							.post(`/autorresponder/edit-category/`)
							.send(category)
							.end((err, res) => {
								res.should.have.status(200);

								db.collection('autorresponders').find({
									category: category.newCategoryName
								}, {
									_id: false,
									category: true
								}, (err, autorrespondersFound) => {
									for(let i = 0; i < autorrespondersFound.length; i++){
										assert.equal(autorrespondersFound.category, newCategoryName);
									}

									db.collection('autorrespondersSubscribers').find({
										category: category.newCategoryName
									}, {
										_id: false,
										category: true
									}, (err, subscribersFound) => {
										for(let i = 0; i < subscribersFound.length; i++){
											assert.equal(subscribersFound.category, newCategoryName);
										}

										cb();
									});
								});
							});
					});
				});
			});
		});
	});

	describe('REMOVE Category', () => {
		it('should remove a category', cb => {
			const categoryName = 'example';

			db.collection('autorrespondersCategory').insert({
				name: categoryName
			}, err => {
				chai.request(server)
					.get(`/autorresponder/remove-category/${categoryName}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should not remove a non-existing category', cb => {
			const categoryName = 'example';

			chai.request(server)
				.get(`/autorresponder/remove-category/${categoryName}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equals(null);

					cb();
				});
		});

		it('should backup the category to the autorrespondersDeletedCategories', cb => {
			const category = {
				name: 'examplex'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				chai.request(server)
					.get(`/autorresponder/remove-category/${category.name}`)
					.end((err, res) => {
						res.should.have.status(200);

						db.collection('autorrespondersDeletedCategories').findOne({
							name: category.name
						}, (err, categoryFound) => {
							assert.equal(category.name, categoryFound.name);

							cb();
						});
					});
			});
		});
	});
});

describe('Subscribers', () => {
	beforeEach(cb => {
		mongo.connect(mongoUrl, (err, database) => {
			if(err) return cb(err);

			db = database;
			db.collection('autorrespondersSubscribers').remove({}, err => {
				if(err) return cb(err);

				cb(null);
			});
		});
	});

	describe('GET Subscriber', () => {
		it('should get a subscriber given an _id', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'merunas@gmail.com',
				category: 'newsletter',
				name: 'Pepe Navarro'
			};

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.get(`/autorresponder/get-subscriber/${_id}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);
						res.body.should.have.property('subscriber');
						res.body.subscriber.should.not.equals(null);

						cb();
					});
			});
		});

		it('should not get a non-existing subscriber', cb => {
			const _id = new ObjectId();

			chai.request(server)
				.get(`/autorresponder/get-subscriber/${_id}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equals(null);

					cb();
				});
		});
	});

	describe('ADD Subscriber', () => {
		it('should add a subscriber with name', cb => {
			const subscriber = {
				email: 'merunas@gmail.com',
				category: 'newsletter',
				name: 'Pepe Navarro'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				chai.request(server)
					.post(`/autorresponder/add-subscriber`)
					.send(subscriber)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should add a subscriber without name', cb => {
			const subscriber = {
				email: 'merunas@gmail.com',
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				chai.request(server)
					.post(`/autorresponder/add-subscriber`)
					.send(subscriber)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should add an existing subscriber to a different category', cb => {
			const subscriber = {
				email: 'merunas@gmail.com',
				category: 'newsletter'
			};
			const subscriberNewCategory = {
				email: 'merunas@gmail.com',
				category: 'magic'
			};
			const category = {
				name: 'magic'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/add-subscriber`)
						.send(subscriberNewCategory)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.should.have.property('err').eql(null);

							cb();
						});
				});
			});
		});

		it('should not add an existing subscriber to the same category', cb => {
			const subscriber = {
				email: 'merunas@gmail.com',
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/add-subscriber`)
						.send(subscriber)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.err.should.not.equals(null);

							cb();
						});
				});
			});
		});

		it('should not add a subscriber without email', cb => {
			const subscriber = {
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/add-subscriber`)
						.send(subscriber)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.err.should.not.equals(null);

							cb();
						});
				});
			});
		});

		it('should not add a subscriber without a valid email', cb => {
			const subscriber = {
				email: 'estonovale@.com',
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/add-subscriber`)
						.send(subscriber)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.err.should.not.equals(null);

							cb();
						});
				});
			});
		});

		it('should not add a subscriber without category', cb => {
			const subscriber = {
				email: 'email@valid.com'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/add-subscriber`)
						.send(subscriber)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.err.should.not.equals(null);

							cb();
						});
				});
			});
		});

		it('should not add a subscriber to a non-existing category', cb => {
			const subscriber = {
				email: 'email@valid.com',
				category: 'newsletter'
			};

			// Category not inserted
			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.post(`/autorresponder/add-subscriber`)
					.send(subscriber)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equals(null);

						cb();
					});
			});
		});
	});

	describe('EDIT Subscriber', () => {
		it('should edit an existing subscriber', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const subscriberEdit = {
				email: 'emailNuevo@example.com',
				category: 'Conejo'
			};
			const category = {
				name: 'Conejo'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/edit-subscriber/${_id}`)
						.send(subscriberEdit)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.should.have.property('err').eql(null);

							cb();
						});
				});
			});
		});

		it('should not edit a non-existing subscriber', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				chai.request(server)
					.post(`/autorresponder/edit-subscriber/iaosdfuyhn3`)
					.send(subscriber)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equals(null);

						cb();
					});
			});
		});

		it('should not edit a existing subscriber with empty fields', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const subscriberEdit = {
				email: '',
				category: '',
				name: 'Pepe Navarro'
			};

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.post(`/autorresponder/edit-subscriber/${_id}`)
					.send(subscriberEdit)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equals(null);

						cb();
					});
			});
		});

		it('should not edit an existing subscriber to a non-existing category', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const subscriberEdit = {
				email: '',
				category: '',
				name: 'thisdoesntexist'
			};

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.post(`/autorresponder/edit-subscriber/${_id}`)
					.send(subscriberEdit)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.err.should.not.equals(null);

						cb();
					});
			});
		});

		it('should not edit an existing subscriber to an already existing email', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const subscriberEdit = {
				email: 'email@valid.com',
				category: 'newsletter'
			};
			const category = {
				name: 'newsletter'
			};

			db.collection('autorrespondersCategory').insert(category, err => {
				db.collection('autorrespondersSubscribers').insert(subscriber, err => {
					chai.request(server)
						.post(`/autorresponder/edit-subscriber/${_id}`)
						.send(subscriberEdit)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('err');
							res.body.err.should.not.equals(null);

							cb();
						});
				});
			});
		});
	});

	describe('REMOVE Subscriber', () => {
		it('should remove an existing subscriber', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.get(`/autorresponder/remove-subscriber/${_id}`)
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('err');
						res.body.should.have.property('err').eql(null);

						cb();
					});
			});
		});

		it('should not remove a non-existing subscriber', cb => {
			chai.request(server)
				.get(`/autorresponder/remove-subscriber/18645asd4f2sdf`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					res.body.err.should.not.equals(null);

					cb();
				});
		});

		it('should backup the subscriber to the autorrespondersUnsubscribers database', cb => {
			const _id = new ObjectId();
			const subscriber = {
				_id: _id,
				email: 'email@valid.com',
				category: 'newsletter'
			};

			db.collection('autorrespondersSubscribers').insert(subscriber, err => {
				chai.request(server)
					.get(`/autorresponder/remove-subscriber/${_id}`)
					.end((err, res) => {
						res.should.have.status(200);

						db.collection('autorrespondersUnsubscribers').findOne({
							_id: _id
						}, (err, subscriberFound) => {
							assert.equal(subscriberFound.email, subscriber.email);

							cb();
						});
					});
			});
		});
	});
});