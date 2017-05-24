'use strict';

function q(selector){
	return document.querySelector(selector);
};

function qAll(selector){
	return document.querySelector(selector);
};

function listen(selector, event, cb){
	return document.querySelector(selector).addEventListener(event, cb);
};

function listenAll(selector, event, cb){
	let elements = document.querySelectorAll(selector);

	for(let i = 0; i < elements.length; i++){
		elements[i].addEventListener(event, cb);
	}
};

function onload(cb){
	return window.addEventListener('load', cb);
};

// Shows an error message at the top of the browser window
let errorTimeout;
function error(err){
	clearTimeout(errorTimeout);

	errorTimeout = setTimeout(() => {
		let html = `<div class="error">${err}</div>`;

		q('body').insertAdjacentHTML('afterbegin', html);
		setTimeout(() => {
			q('.error').remove();
		}, 5e3);
	}, 500);
};

/** 
 * Returns callback(err, responseText) the err says if there was an error or not
 */
function httpGet(url, cb){

	// If no callback is provided in the function calling, ignore the callback
	if(cb == undefined){
		cb = () => {};	
	}

	let request = new XMLHttpRequest();
	request.open('GET', url);
	request.addEventListener('readystatechange', () => {

		if(request.readyState == XMLHttpRequest.DONE && request.status < 400){
			let response = request.responseText;
			let error = null;

			try{
				response = JSON.parse(response);
			}catch(e){
				error = `Could not parse the response of ${url}`;
			}

			cb(error, response);
		}else if(request.readyState == XMLHttpRequest.DONE){
			cb(request.responseText, null);      
      	}
	});

	request.send();
};

/**
 * Performs a POST ajax request
 * @param  {object}   data data must be an object
 */
function httpPost(url, data, cb){
	if(cb == undefined)
		cb = () => {};	

	if(typeof data != 'object')
		return cb('The second parameter of the POST request must be an object', null);

	let request = new XMLHttpRequest();
	request.open('POST', url);
	request.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
	request.addEventListener('readystatechange', () => {

		if(request.readyState == XMLHttpRequest.DONE && request.status < 400){
			let response = request.responseText;
			let error = null;

			try{
				response = JSON.parse(response);
			}catch(e){
				error = `Could not parse the response of ${url}`;
			}

			cb(error, response);
		}else if(request.readyState == XMLHttpRequest.DONE){
			cb(request.responseText, null);      
      	}
	});

	request.send(JSON.stringify(data));	
};