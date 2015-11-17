var unirest = require("unirest");
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var AUTHORIZATION = "Basic YWNjXzE5ZmIzNzU1YzQ1M2I3ZjplMDg5ZjIyNGM1ZWE4MWVlZjY1MDZjYWI5OTIxOTA1OA==";
var mongoURL = 'mongodb://pogomylogo:pogo1234pogo@162.243.144.203:27017/pogomylogo';

function Imagga() {
};

var pause = function(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

var insertTag = function(db, data, cb) {
	db.collection('logos-tag').insert(data, function(err, result) {
		if(!err) {
			console.log("Inserted into logos-tag collection.");
			cb();
		}
		else {
			console.log(err);
		}
	});
};

var tag = function(db, doc, saveFinished, cb) {
	var tagReq = unirest("GET", "http://api.imagga.com/v1/tagging");

	//console.log('tag doc: ' + JSON.stringify(doc));
	console.log('Company name: ' + doc.name);
	console.log('Tagging url: ' + doc.logoUrl);

	tagReq.query({
		"url": doc.logoUrl,
		"version": "2"
	});

	tagReq.headers({
		"authorization": AUTHORIZATION, 
		"accept": "application/json"
	});

	tagReq.end(function (res) {
		if (res.error) {
			console.log('Skipped tag');
			console.log(res);
			throw new Error(res.error);
		}   

		var data = res.body;
		//console.log(data);
		var tagData = data['results'][0]['tags'];
		//console.log('tagData' + JSON.stringify(tagData));

		var temp = {
			"name": doc.name,
			"logoUrl": doc.logoUrl,
			"tag": tagData
		};

		pause(3000);
		cb(db, temp, saveFinished);
	});
};

var insertColor = function(db, data, cb) {
	db.collection('logos-color').insert(data, function(err, result) {
		if(!err) {
			console.log("Inserted into logos-color collection.");
			cb();
		}
		else {
			console.log(err);
		}
	});
};

var color = function(db, doc, saveFinished, cb) {
	var colorReq = unirest("GET", "http://api.imagga.com/v1/colors");

	//console.log('tag doc: ' + JSON.stringify(doc));
	console.log('Company name: ' + doc.name);
	console.log('Color url: ' + doc.logoUrl);


	colorReq.query({
		"url": doc.logoUrl,
		"version": "2"
	});

	colorReq.headers({
		"authorization": AUTHORIZATION,
		"accept": "application/json"
	});

	colorReq.end(function (res) {
		if (res.error) {
			console.log("Skipped color");
			console.log(res);
			throw new Error(res.error);
		}

		var data = res.body;
		//console.log(data);
		var bgColor = data['results'][0]['info']['background_colors'];
		//console.log('bgColor ' + JSON.stringify(bgColor));
		var fgColor = data['results'][0]['info']['foreground_colors'];
		//console.log('fgColor ' + JSON.stringify(fgColor));
		var imageColor = data['results'][0]['info']['image_colors'];
		//console.log('imageColor ' + JSON.stringify(imageColor));



		var temp = {
			"name": doc.name,
			"logoUrl": doc.logoUrl,
			"bgColor": bgColor,
			"fgColor": fgColor,
			"imageColor": imageColor
		};

		pause(3000);
		cb(db, temp, saveFinished);
	});
	//cb();
};

//Find urls in DB (put by LinkedIn API)
Imagga.prototype.findURLTag = function findURLTag() {
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			console.log(err);
		}
		else {
			assert.equal(null, err);
			console.log("Connected correctly to server.");

			var cursor = db.collection('companies-test').find();
			cursor.count(function(err,count) {

				var savesPending = count;
				console.log('Company count: ' + count);

				//this tag IS working
				//tag("http://playground.imagga.com/static/img/example_photo.jpg");

				if(count == 0){
					db.close();
					return;
				}

				var saveFinished = function(){
					savesPending--;
					if(savesPending == 0){
						db.close();
					}
				}

				cursor.each(function (err, doc) {
 					if (doc != null) {
						tag(db, doc, saveFinished, function(db, temp, saveFinished) {
							insertTag(db, temp, saveFinished);
						});
					}
				});
			});
		}
   });
};

Imagga.prototype.findURLColor = function findURLColor() {
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			console.log(err);
		}
		else {
			assert.equal(null, err);
			console.log("Connected correctly to server.");

			var cursor = db.collection('companies-test').find();
			cursor.count(function(err,count) {

				var savesPending = count;
				console.log('Company count: ' + count);

				//this tag IS working
				//tag("http://playground.imagga.com/static/img/example_photo.jpg");

				if(count == 0){
					db.close();
					return;
				}

				var saveFinished = function(){
					savesPending--;
					if(savesPending == 0){
						db.close();
					}
				}

				cursor.each(function (err, doc) {
 					if (doc != null) {
						color(db, doc, saveFinished, function(db, temp, saveFinished) {
							insertColor(db, temp, saveFinished);
						});
					}
				});
			});
		}
   });
};


var test = new Imagga();
test.findURLTag();
test.findURLColor();

module.exports.imagga = Imagga;
