'use strict';

let idEdit;
let editName;
let idDelete;
let editMode = false;

// Category listeners
listen('.category-add', 'click', categoryShowOverlayAdd);
listen('.category-edit', 'click', () => {
	editMode = !editMode;
});
listen('.category-add-new', 'click', categoryCreate);
listenAll('.overlay-category-add input, .overlay-category-edit-name input', 'click', (e) => {
	e.stopPropagation();
});
listen('.overlay-category-confirm-delete-yes', 'click', categoryRemove);
listen('.overlay-category-edit-name-confirm', 'click', categoryEdit);

function categoryShowOverlayAdd(){
	q('.overlay-category-add').style.display = 'block';
	q('.overlay-category-add input').focus();
	q('.overlay').style.display = 'block';
};

function categoryShowOverlayEdit(e){
	idEdit = e.target.parentNode.id.substring(3);
	editName = e.target.parentNode.querySelector('.categ-name').innerHTML;

	q('.overlay-category-edit-name').style.display = 'block';
	q('.overlay-category-edit-name input').value = editName;
	q('.overlay-category-edit-name input').focus();	
	q('.overlay').style.display = 'block';
};

function categoryCreate(){
	const name = q('.overlay-category-add input').value;

	if(name != null && name.length > 0){
		httpGet(`/autorresponder/add-category/${name}`, (err, response) => {
			if(err) return error(err);
			if(response.err) return error(response.err);

			httpGet(`/autorresponder/get-category/${name}`, (err, response) => {
				if(err) return error(err);
				if(response.err) return error(response.err);

				const newCategory = new Category(response._id, name, [], []);
				categories.push(newCategory);
				q('.overlay-category-add input').value = '';
			});
		});
	}
};

// To confirm category edit name
function categoryEdit(){
	const input = q('.overlay-category-edit-name input');
	const request = {
		categoryName: editName,
		newCategoryName: input.value
	};

	if(input != null && input.value.length > 0){
		httpPost(`/autorresponder/edit-category/`, request, (err, response) => {
			if(err) return error(err);
			if(response.err) return error(response.err);

			reloadCategories();
			editMode = false;
		});
	}
};

function promptConfirmDelete(id, name){
	idDelete = id;
	q('.overlay-category-confirm-delete').style.display = 'block';
	q('.overlay-category-confirm-delete p').innerHTML = `Confirm delete of: ${name} ?`;
	q('.overlay').style.display = 'block';
};

function categoryRemove(){
	const correctId = idDelete.substring(3);
	httpGet(`/autorresponder/remove-category/${correctId}`, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		q(`#${idDelete}`).remove();
	});
};

function showCategoryEditBox(e){
	if(editMode){
		e.target.querySelector('.category-overlay-edit').style.display = 'block';
	}
};

function hideCategoryEditBox(e){
	if(editMode){
		e.target.querySelector('.category-overlay-edit').style.display = 'none';	
	}
};

// Category object
function Category(_id, name, autorresponders, subscribers){
	this._id = 'id_'+_id; // Must start with a char to allow query selectors
	this.name = name;
	this.autorresponders = autorresponders || [];
	this.subscribers = subscribers;
	const that = this;

	init();

	function init(){
		let categoryHTML = 
			`<div class="category" id="${that._id}" 
				onmouseenter="showCategoryEditBox(event)"
				onmouseleave="hideCategoryEditBox(event)">

				<div class="category-header">
					<h3 class="categ-name">${that.name}</h3>
					<span>${that.subscribers.length} Subs</span>
					<button onclick="loadAutorresponderAdd(event)" class="category-add-autorresponder">Add</button>
					<a href="javascript:void(0)" onclick="promptConfirmDelete('${that._id}', '${that.name}');" class="category-remove-icon">
						✕
					</a>
				</div>
				<ul class="category-autorresponders">`;

		if(that.autorresponders.length <= 0){
			categoryHTML += 
				`<div class="category-no-autorresponders">
				There are no autorresponders for this category</div>`;
		}else{
			that.autorresponders.sort((a, b) => {
				return a.order - b.order;
			});

			for(let j = 0; j < that.autorresponders.length; j++){
				const autorresponder = that.autorresponders[j];

				categoryHTML += 
					`<li onmouseenter="showActionsAutorresponder(event)" 
						 onmouseleave="hideActionsAutorresponder(event)"
						 onclick="clickActionsAutorresponder(event)">
						${autorresponder.order} ${autorresponder.title}
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

		categoryHTML += `</ul>
			<div class="category-overlay-edit" onclick="categoryShowOverlayEdit(event)"></div></div>`;

		q('.container-categories').innerHTML += categoryHTML;		
	};

	function deleteC(){

		// Todo add modal asking for confimation
		q(`${that._id}`).remove();
	};
};