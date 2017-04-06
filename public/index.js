'use strict';

const categories = [];

onload(getCategories);

function getCategories(){
	httpGet('/autorresponder/get-all-categories', (err, response) => {
		if(err) return error(err);
		if(response.error) return error(response.error);

		response.categories.forEach(category => {
			const theCategory = new Category(category._id, category.name, category.autorresponders, category.subscribers);
			categories.push(theCategory);
		});
	});
};

function reloadCategories(){
	q('.container-categories').innerHTML = '';
	getCategories();
	hideOverlay();
};