'use strict';

listen('.overlay-subscribers-edit-confirm', 'click', subscribersEdit);

function subscribersShow(categoryName){
	let subscribers;

	for(let i = 0; i < categories.length; i++){
		if(categories[i].name === categoryName){
			subscribers = categories[i].subscribers;
			break;
		}
	}

	if(subscribers){
		q('.overlay-subscribers').style.display = 'block';
		q('.overlay').style.display = 'block';
		let html = `<h3>${categoryName} - ${subscribers.length}</h3>`;

		if(subscribers.length <= 0){
			html = `There are no subscribers for the category: ${categoryName}`;
		}else{
			for(let i = 0; i < subscribers.length; i++){
				html += `<li>${subscribers[i].email} 
					<button 
						onclick="subscribersEditShowOverlay(${subscribers[i]._id}, ${categoryName}, ${subscribers[i].email});">
							Edit</button> 
					<button onclick="subscribersRemove(${subscribers[i]._id});">Remove</button></li>`;
			}
		}

		q('.overlay-subscribers').innerHTML = html;
	}
};

// Shows overlay and sets data with the current _id, email and category dropdown so the user can change it
function subscribersEditShowOverlay(_id, category, email){
	let $overlay = q('.overlay-subscribers-edit');
	$overlay.style.display = 'block';
	$overlay.querySelector('.overlay-subscribers-edit-id').value = _id;
	$overlay.querySelector('.overlay-subscribers-edit-email').value = email;

	// Loop all the categories and set this one as active.
	$overlay.querySelector('.overlay-subscribers-edit-category').innerHTML;
};

// Sends the edit request
function subscribersEdit(_id, category, newEmail){
	if(newEmail && newEmail.length > 0 && /.+@.+\..+/.test(newEmail)){
		subscriber = {
			email: newEmail,
			category: category
		};

		httpPost(`/autorresponder/edit-subscriber/${_id}`, subscriber, (err, response) => {
			if(err) return error(err);
			if(response.err) return error(response.err);

			console.log(response);
			hideOverlay();
		});
	}else{
		error('The new email is empty or bad formated');
	}
};

function subscribersRemove(_id){
	httpGet(`/autorresponder/remove-subscriber/${_id}`, (err, response) => {
		if(err) return error(err);
		if(response.err) return error(response.err);

		console.log(response);
		hideOverlay();
	});
};