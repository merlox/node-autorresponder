'use strict';

onload(getCategories);

// Don't hide overlay if they click the email or email edit
listenAll('.autorresponder-email, .autorresponder-edit', 'click', (e) => {
	e.stopPropagation();
});
listen('.overlay', 'click', hideOverlay);
listen('.autorresponder-edit-submit', 'click', updateAutorresponder);
listen('.autorresponder-add-submit', 'click', addAutorresponder);

function getCategories(){
	httpGet('/autorresponder/get-all-categories', (err, response) => {
		if(err) return error(err);
		if(response.error) return error(response.error);

		let categoryHTML;
		for(let i = 0; i < response.categories.length; i++){
			let category = response.categories[i];
			categoryHTML = `<div class="category">
					<div class="category-header">
						<h3>${category.name}</h3>
						<span>${category.subscribers.length} Subs</span>
						<button class="category-add-autorresponder">Add</button>
					</div>
					<ul class="category-autorresponders">`;

			if(category.autorresponders.length <= 0){
				categoryHTML += 
					`<div class="category-no-autorresponders">
					There are no autorresponders for this category</div>`;
			}else{
				category.autorresponders.sort((a, b) => {
					return a.order - b.order;
				});

				for(let j = 0; j < category.autorresponders.length; j++){
					let autorresponder = category.autorresponders[j];
					categoryHTML += `<li>${autorresponder.order} ${autorresponder.title}
							<input type="hidden" class="autorresponder-id" 
								value="${autorresponder._id}"/>
							<ul class="category-autorresponder-actions">
								<li>View</li>
								<li>Edit</li>
								<li>Delete</li>
							</ul>
						</li>`;
				}
			}

			categoryHTML += `</ul></div>`;

			q('.container-categories').innerHTML += categoryHTML;
		}

		listenAll('.category-autorresponders > li', 'mouseenter', showActionsAutorresponder);
		listenAll('.category-autorresponders > li', 'mouseleave', hideActionsAutorresponder);
		listenAll('.category-autorresponders > li', 'click', clickActionsAutorresponder);
		listenAll('.category-add-autorresponder', 'click', loadAutorresponderAdd);
	});
};

function showActionsAutorresponder(e){
	e.target.querySelector(`.category-autorresponder-actions`).style.display = 'flex';
};

function hideActionsAutorresponder(e){
	e.target.querySelector(`.category-autorresponder-actions`).style.display = 'none';
};

function clickActionsAutorresponder(e){
	const action = e.target.innerHTML.toLowerCase();
	const id = e.target.parentNode.parentNode.querySelector('.autorresponder-id').value;

	switch(action){
		case 'view':
			loadAutorresponderView(id);
		break;

		case 'edit':
			loadAutorresponderEdit(id);
		break;

		case 'delete':
			deleteAutorresponder(id);
		break;
	}
};

function loadAutorresponderView(id){
	httpGet(`/autorresponder/get-autorresponder/${id}`, (err, response) => {
		if(err) return error(err);
		if(response.error) return error(err);

		q('.autorresponder-view-content').innerHTML = response.autorresponder.content;
		q('.autorresponder-email').style.display = 'block';
		q('.overlay').style.display = 'block';
	});
};

function loadAutorresponderEdit(id){
	httpGet(`/autorresponder/get-autorresponder/${id}`, (err, response) => {
		if(err) return error(err);
		if(response.error) return error(err);

		q('.autorresponder-edit-id').value = response.autorresponder._id;
		q('.autorresponder-edit-category').value = response.autorresponder.category;
		tinyMCE.activeEditor.setContent(response.autorresponder.content);
		q('.autorresponder-edit-title').value = response.autorresponder.title;
		q('.autorresponder-edit-order').value = response.autorresponder.order;
		q('.autorresponder-edit-submit').style.display = 'inline-block';
		q('.autorresponder-add-submit').style.display = 'none';
		q('.autorresponder-edit').style.display = 'block';
		q('.overlay').style.display = 'block';
	});
};

// Shows the overlay with the add autorresponder button and sets the fields values
function loadAutorresponderAdd(e){
	const category = e.target.parentNode.querySelector('h3').innerHTML.toLowerCase();

	resetAutorresponderFields();
	q('.autorresponder-edit-category').value = category;
	q('.autorresponder-edit-submit').style.display = 'none';
	q('.autorresponder-add-submit').style.display = 'inline-block';
	q('.autorresponder-edit').style.display = 'block';
	q('.overlay').style.display = 'block';
};

function updateAutorresponder(){
	const id = q('.autorresponder-edit-id').value;
	const autorresponder = {
		category: q('.autorresponder-edit-category').value,
		title: q('.autorresponder-edit-title').value,
		content: tinyMCE.activeEditor.getContent(),	
		order: q('.autorresponder-edit-order').value
	};
	
	httpPost(`/autorresponder/edit-autorresponder/${id}`, autorresponder, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		reloadCategories();
	});
};

function deleteAutorresponder(id){
	httpGet(`/autorresponder/remove-autorresponder/${id}`, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		reloadCategories();
	});
};

function addAutorresponder(){
	const autorresponder = {
		category: q('.autorresponder-edit-category').value,
		title: q('.autorresponder-edit-title').value,
		content: tinyMCE.activeEditor.getContent()
	};
	const order = q('.autorresponder-edit-order').value;

	if(order != null && order.length != 0)
		autorresponder['order'] = order;

	httpPost('/autorresponder/add-autorresponder', autorresponder, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		reloadCategories();
	});
};

function hideOverlay(){
	q('.overlay').style.display = 'none';
	q('.autorresponder-email').style.display = 'none';
	q('.autorresponder-edit').style.display = 'none';
};

function reloadCategories(){
	q('.container-categories').innerHTML = '';
	getCategories();
	hideOverlay();
};

function resetAutorresponderFields(){
	q('.autorresponder-edit-id').value = '';
	q('.autorresponder-edit-category').value = '';
	tinyMCE.activeEditor.setContent('');
	q('.autorresponder-edit-title').value = '';
	q('.autorresponder-edit-order').value = '';
};