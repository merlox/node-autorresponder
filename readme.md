# Another node autorresponder self hosted system!

Node autorresponder is another email marketing application that runs in your hosting on port 8888.

Excellent for marketing, it allows you to establish a relationship with a list of subscribers sorted by categories using autorresponders. For free!

If you want to contribute to this project, contact me to establish a system where we can cooperate because right now I'm doing this myself.

## Things to note: 

► This plugin is written totally in english
► A message is also called an autorresponder
► Subscribers and autorresponders have categories
► Removing a subscriber, category or autorresponder just moves it to a backup database
► There can be only 1 admin user that gets written in the secrets file the first time you start the app
► Update category subscribers categoryname and autorresponders categoryname when category name changes in /edit-category

### Category Object

collection('autorrespondersCategory')

```
{
	_id: '_id',
	name: 'string',
  	created: 'date'
}
```

### Autorresponders Object

collection('autorresponders')

```
{
	_id: '_id',
	category: 'categoryName', 		
	title: 'string',
	content: 'string',
	created: 'date',
	order: 'int' // The order in which send this autorresponder
}
```

### Subscribers Object

collection('autorrespondersSubscribers')

```
{
	_id: '_id',
	category: 'categoryName',
	email: 'string',
	created: 'date',
	name: 'string' (optional)
}
```