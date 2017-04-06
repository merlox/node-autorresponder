'use strict';

// Category listeners
listen('.category-add', 'click', categoryShowOverlayAdd);
listen('.category-edit', 'click', categoryEdit);
listen('.category-remove', 'click', categoryRemove);
listen('.category-add-new', 'click', categoryCreate);
listen('.overlay-category-add input', 'click', (e) => {
	e.stopPropagation();
});

function categoryShowOverlayAdd(){
	q('.overlay-category-add').style.display = 'block';
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

function categoryEdit(id, name){

};

function promptConfirmDelete(id, name){
	q('.overlay-category-confirm-delete').style.display = 'block';
	q('.overlay-category-confirm-delete p').innerHTML = `Confirm delete of: ${name} ?`;
};

function categoryRemove(id, name){

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
			`<div class="category" id="${that._id}">
				<div class="category-header">
					<h3>${that.name}</h3>
					<span>${that.subscribers.length} Subs</span>
					<button class="category-add-autorresponder" onclick="loadAutorresponderAdd">Add</button>
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
					`<li onmouseenter="showActionsAutorresponder" 
						 onmouseleave="hideActionsAutorresponder"
						 onclick="clickActionsAutorresponder">
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

		categoryHTML += `</ul></div>`;

		q('.container-categories').innerHTML += categoryHTML;		
	};

	function deleteC(){

		// Todo add modal asking for confimation
		q(`${that._id}`).remove();
	};
};