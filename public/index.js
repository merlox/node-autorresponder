'use strict';

let categories = [];

onload(getCategories);
listen('.overlay', 'click', hideOverlay);

function getCategories(){
	httpGet('/autorresponder/get-all-categories', (err, response) => {
		if(err) return error(err);
		if(response.error) return error(response.error);

		// Sort alphabetically suporting unicode case insensitivelly
		response.categories.sort((a, b) => {
			return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
		});

		for(let i = 0; i < response.categories.length; i++){
			const category = response.categories[i];
			const theCategory = new Category(category._id, category.name, category.autorresponders, category.subscribers);

			categories.push(theCategory);
		}
	});
};

function reloadCategories(){
	q('.container-categories').innerHTML = '';
	getCategories();
	hideOverlay();
};


function hideOverlay(){
	q('.overlay').style.display = 'none';
	q('.overlay-autorresponder-email').style.display = 'none';
	q('.overlay-autorresponder-edit').style.display = 'none';
	q('.overlay-category-add').style.display = 'none';
	q('.overlay-category-confirm-delete').style.display = 'none';
	q('.overlay-category-edit-name').style.display = 'none';
	q('.overlay-subscribers').style.display = 'none';
	q('.overlay-subscribers-edit').style.display = 'none';
};