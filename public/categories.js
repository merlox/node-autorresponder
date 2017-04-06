'use strict';

// Category listeners
listen('.category-add', 'click', categoryAdd);
listen('.category-edit', 'click', categoryEdit);
listen('.category-remove', 'click', categoryRemove);

function categoryAdd(){
	q('.overlay-category-add').style.display = 'block';
	q('.overlay').style.display = 'block';
};

function categoryEdit(){

};

function categoryRemove(){

};

function categorySetName(){
	httpGet(`/autorresponder/add-category/${input.value}`, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		console.log(response);
	});
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
					
					<div class="category-edit-container">
						<input type="text" class="category-edit-input"/>
						<button class="category-edit-input-ok">Ok</button>
						<button class="category-edit-input-cancel">X</button>
					</div>

					<span>${that.subscribers.length} Subs</span>
					<button class="category-add-autorresponder">Add</button>
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
					`<li>${autorresponder.order} ${autorresponder.title}
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

		setListeners();
	};

	function setListeners(){

		if(that.autorresponders.length > 0){
			listenAll(`${that._id} .category-autorresponders > li`, 'mouseenter', () => {
				console.log('called')
				showActionsAutorresponder();
			});
			listenAll(`${that._id} .category-autorresponders > li`, 'mouseleave', hideActionsAutorresponder);
			listenAll(`${that._id} .category-autorresponders > li`, 'click', clickActionsAutorresponder);
		}
		listenAll(`${that._id} .category-add-autorresponder`, 'click', loadAutorresponderAdd);
	};

	// function update(){
	// 	// that.delete();
	// 	init();
	// };

	// function delete(){

	// 	// Todo add modal asking for confimation
	// 	q(`${that._id}`).remove();
	// };
};