'use strict';

process.env.NODE_ENV = 'test';

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongoUrl = require('./../config/config.json').testMongo;
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../server.js');
const should = chai.should();
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

		it('should post an autorresponder without order', cb => {
			const autorresponder = {
				title: 'Este es un buen ejemplo de autorresponder',
				content: 'Este es el contenido del autorresponder',
				category: 'coches'
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
					res.body.err.should.not.equal(null);
					
					cb();
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
					res.body.categories.shoult.not.equals(null);

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

	describe('GET Subscriber')
});