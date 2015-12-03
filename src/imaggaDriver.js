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

var insertTag = function(collection, db, data, cb) {
	db.collection(collection).insert(data, function(err, result) {
		if(!err) {
			console.log("Inserted into " + collection + " collection.");
			cb();
		}
		else {
			console.log(err);
		}
	});
};

var insertColor = function(collection, db, data, cb) {
	db.collection(collection).insert(data, function(err, result) {
		if(!err) {
			console.log("Inserted into " + collection + " collection.");
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
			//console.log(res);
			//throw new Error(res.error);
			return;
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
			//console.log(res);
			//throw new Error(res.error);
			return;
		}

		var data = res.body;
		//console.log(data);
		if(data['results'][0] != undefined) {
			var bgColor = data['results'][0]['info']['background_colors'];
			//console.log('bgColor ' + JSON.stringify(bgColor));
			var fgColor = data['results'][0]['info']['foreground_colors'];
			//console.log('fgColor ' + JSON.stringify(fgColor));
			var imageColor = data['results'][0]['info']['image_colors'];
			//console.log('imageColor ' + JSON.stringify(imageColor));


			//background
			var bgListColors = {};
			for(var i = 0; i < bgColor.length; i++) {
				var newColor = bgColor[i]["closest_palette_color"];
				if(bgListColors[newColor] === undefined) {
					bgListColors[newColor] = bgColor[i]["percentage"];
				}
				else {
					bgListColors[newColor] += bgColor[i]["percentage"];
				}
			}

			//foreground
			var fgListColors = {};
			for(var i = 0; i < fgColor.length; i++) {
				var newColor = fgColor[i]["closest_palette_color"];
				if(fgListColors[newColor] === undefined) {
					fgListColors[newColor] = fgColor[i]["percentage"];
				}
				else {
					fgListColors[newColor] += fgColor[i]["percentage"];
				}
			}

			//image
			var imageListColors = {};
			for(var i = 0; i < imageColor.length; i++) {
				var newColor = imageColor[i]["closest_palette_color"];
				if(imageListColors[newColor] === undefined) {
					imageListColors[newColor] = imageColor[i]["percentage"];
				}
				else {
					imageListColors[newColor] += imageColor[i]["percentage"];
				}
			}

			var temp = {
				"name": doc.name,
				"logoUrl": doc.logoUrl,
				"bgColor": bgListColors,
				"fgColor": fgListColors,
				"imageColor": imageListColors
			};

			pause(3000);
			cb(db, temp, saveFinished);
		}
	});
};

var userTag = function(collection, db, name, url, cb) {
	var tagReq = unirest("GET", "http://api.imagga.com/v1/tagging");
	console.log('User tagging inputted url: ' + url);

	tagReq.query({
		"url": url,
		"version": "2"
	});

	tagReq.headers({
		"authorization": AUTHORIZATION, 
		"accept": "application/json"
	});

	tagReq.end(function (res) {
		if (res.error) {
			console.log('Skipped tag');
			//console.log(res);
			//throw new Error(res.error);
			db.close();
			return;
		}   

		var data = res.body;
		//console.log(data);
		var tagData = data['results'][0]['tags'];
		//console.log('tagData' + JSON.stringify(tagData));

		var temp = {
			"name": name,
			"logoUrl": url,
			"tag": tagData
		};

		cb(collection, db, temp);
		pause(3000);

	});
};

var userColor = function(collection, db, name, url, cb) {
	var colorReq = unirest("GET", "http://api.imagga.com/v1/colors");
	console.log('User coloring inputted url: ' + url);


	colorReq.query({
		"url": url,
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
			//throw new Error(res.error);
			//db.close();
			return;
		}

		var data = res.body;
		//console.log(data);
		if(data['results'][0] != undefined) {
			var bgColor = data['results'][0]['info']['background_colors'];
			//console.log('bgColor ' + JSON.stringify(bgColor));
			var fgColor = data['results'][0]['info']['foreground_colors'];
			//console.log('fgColor ' + JSON.stringify(fgColor));
			var imageColor = data['results'][0]['info']['image_colors'];
			//console.log('imageColor ' + JSON.stringify(imageColor));


			//background
			var bgListColors = {};
			for(var i = 0; i < bgColor.length; i++) {
				var newColor = bgColor[i]["closest_palette_color"];
				if(bgListColors[newColor] === undefined) {
					bgListColors[newColor] = bgColor[i]["percentage"];
				}
				else {
					bgListColors[newColor] += bgColor[i]["percentage"];
				}
			}

			//foreground
			var fgListColors = {};
			for(var i = 0; i < fgColor.length; i++) {
				var newColor = fgColor[i]["closest_palette_color"];
				if(fgListColors[newColor] === undefined) {
					fgListColors[newColor] = fgColor[i]["percentage"];
				}
				else {
					fgListColors[newColor] += fgColor[i]["percentage"];
				}
			}

			//image
			var imageListColors = {};
			for(var i = 0; i < imageColor.length; i++) {
				var newColor = imageColor[i]["closest_palette_color"];
				if(imageListColors[newColor] === undefined) {
					imageListColors[newColor] = imageColor[i]["percentage"];
				}
				else {
					imageListColors[newColor] += imageColor[i]["percentage"];
				}
			}

			var temp = {
				"name": name,
				"logoUrl": url,
				"bgColor": bgListColors,
				"fgColor": fgListColors,
				"imageColor": imageListColors
			};

			pause(3000);
			cb(collection, db, temp);
		}
	});
};


Imagga.prototype.findURLTag = function findURLTag() {
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			console.log(err);
		}
		else {
			assert.equal(null, err);
			console.log("Connected correctly to server.");

			var cursor = db.collection('companies').find();
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
							insertTag("logos-tag-db", db, temp, saveFinished);
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

			var cursor = db.collection('companies').find();
			cursor.count(function(err,count) {

				var savesPending = count;
				console.log('Company count: ' + count);

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
							insertColor("logos-color-db", db, temp, saveFinished);
						});
					}
				});
			});
		}
   });
};

Imagga.prototype.findNumColor = function findNumColor(name) {
MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			console.log(err);
		}
		else {
			assert.equal(null, err);
			console.log("Connected correctly to server.");

			var cursor = db.collection('logos-color').find(name);
			cursor.each(function(err, doc) {
				if(doc != null) {
					console.log(doc);

					//background
					var bgListColors = {};
					var bgLength = doc["bgColor"].length;
					for(var i = 0; i < bgLength; i++) {
						//get the color
						var newColor = doc["bgColor"][i]["closest_palette_color"];
						//check if it has already been found
						if(bgListColors[newColor] === undefined) {
							console.log('adding new bg color: ' + newColor);
							bgListColors[newColor] = doc["bgColor"][i]["percentage"];
						}
						else {
							console.log('adding bg percentage');
							bgListColors[newColor] += doc["bgColor"][i]["percentage"];
						}
					}
					console.log(Object.keys(bgListColors).length);

					//foreground
					var fgListColors = {};
					var fgLength = doc["fgColor"].length;
					for(var i = 0; i < fgLength; i++) {
						//get the color
						var newColor = doc["fgColor"][i]["closest_palette_color"];
						//check if it has already been found
						if(fgListColors[newColor] === undefined) {
							console.log('adding new fg color: ' + newColor);
							fgListColors[newColor] = doc["fgColor"][i]["percentage"];
						}
						else {
							console.log('adding fg percentage');
							fgListColors[newColor] += doc["fgColor"][i]["percentage"];
						}
					}
					console.log(Object.keys(fgListColors).length);

					//image
					var imageListColors = {};
					var imageLength = doc["imageColor"].length;
					for(var i = 0; i < imageLength; i++) {
						//get the color
						var newColor = doc["imageColor"][i]["closest_palette_color"];
						//check if it has already been found
						if(imageListColors[newColor] === undefined) {
							console.log('adding new fg color: ' + newColor);
							imageListColors[newColor] = doc["imageColor"][i]["percentage"];
						}
						else {
							console.log('adding fg percentage');
							imageListColors[newColor] += doc["imageColor"][i]["percentage"];
						}
					}
					console.log(Object.keys(imageListColors).length);

				}
			});
			//db.close();
		}
   });
}

var testUserTag = function(collection, name, url) {
	MongoClient.connect('mongodb://pogomylogo:pogo1234pogo@162.243.144.203:27017/pogomylogo', function(err, db) {
		if(err) {
			console.log(err);
		}
		else {
			assert.equal(null, err);
			console.log("Connected correctly to server.");

			userTag(collection, db, name, url, function(collection, db, data) {
				insertTag(collection, db, data, function() {
					db.close();
				});
			});

		}
	});
}

var testUserColor = function(db, collection, name, url) {
	userColor(collection, db, name, url, function(collection, db, data) {
		insertColor(collection, db, data, function() {
		});
	});

}

var test = new Imagga();
test.findURLTag();
test.findURLColor();
//test.findNumColor({"name": "Palo Alto Networks"});
//testUserTag("aaron", "https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAAVaAAAAJDgyN2I3NjlhLTkwYjUtNDQxOS1iZTE5LWY0YzhkOTIyZmRkYw.png");
//testUserColor("terrence", "https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAAVaAAAAJDgyN2I3NjlhLTkwYjUtNDQxOS1iZTE5LWY0YzhkOTIyZmRkYw.png");

//module.exports.imagga = Imagga;

module.exports.tag = testUserTag;
module.exports.color1 = testUserColor;
