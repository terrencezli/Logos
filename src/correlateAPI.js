'use strict';
var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , ObjectID = require('mongodb').ObjectID
  , express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , LinkedInStrategy = require('passport-linkedin').Strategy;
var imagga = require('./imaggaDriver');


var db;
var url = 'mongodb://162.243.144.203:27017/pogomylogo';

/**
 * Constructor for the linkedAPI
 * @constructor
 */
function correlateAPI() {
}

/**
 * Method to get foreground and background
 *
 */
var colorArray = function (items, arr) {
	var colorArr = arr;

	for (var j = 0; j < Object.keys(items).length; j++) {
		//console.log(Object.keys(items)[j]);
		var colorKey = Object.keys(items)[j];
		var percentVal = items[colorKey];

		if (typeof colorArr[colorKey] !== 'undefined') {
			colorArr[colorKey] += percentVal;
		}
		else {
			colorArr[colorKey] = percentVal;
		}

		//process.stdout.write("colorKey: " + colorKey + "percentVal: " + percentVal);
	}

	return colorArr;
}

/**
 * Parameters for company search
 */

correlateAPI.prototype.getCompanyData = function (companyType, industries, employeeCountRange, cb) {
	MongoClient.connect(url, function(err, database) {
		var filteredCompany = [];
		var validInd = false;

		db = database;
		if(err) {
			console.log(err);
		}
		else {
			// get all the collection
			db.collection('companies').find().toArray(function(err, items) {
				if (err) {
					console.log(err)
				}

				//console.log(items);

				// start filtering
				for (var i = 0; i < items.length; i++) {

					if (industries && items[i].industries != null) {
						var ind = items[i].industries.values;
						
						for (var key in ind) {
							if (ind.hasOwnProperty(key) && ind[key].code == industries) {
								validInd = true;
							}
						}
					}


					// companyType is privately held public or non profit
					if ((items[i].companyType != null && 
							items[i].companyType.name == companyType) &&
						validInd &&
						(items[i].employeeCountRange != null &&
							items[i].employeeCountRange.name == employeeCountRange)) {
						filteredCompany.push(items[i]);
					}
				}

				cb(filteredCompany);

				db.close();
			});
		}

	});
}

/**
 * API to get color data
 */
correlateAPI.prototype.getColorData = function (cb) {
	var bg = [];
	var fg = [];
	var imageColor = [];

	MongoClient.connect(url, function(err, database) {

		db = database;
		if(err) {
			console.log(err);
		}
		else {
			// get all the collection
			db.collection('logos-color').find().toArray(function(err, items) {
				//console.log(items);

				for (var i = 0; i < items.length; i++) {
					bg = colorArray(items[i].bgColor, bg);

					fg = colorArray(items[i].fgColor, fg);

					for (var j = 0; j < Object.keys(items[i].imageColor).length; j++) {
						//console.log(Object.keys(items[i].bgColor)[j]);
						var colorKey = Object.keys(items[i].imageColor)[j];
						//var percentVal = items[i].imageColor[colorKey];

						if (typeof imageColor[colorKey] !== 'undefined') {
							imageColor[colorKey] += 1;
						}
						else {
							imageColor[colorKey] = 1;
						}

						//process.stdout.write("colorKey: " + colorKey + "percentVal: " + percentVal);
					}
				}

				bg = Object.keys(bg).sort(function(a,b){return bg[b]-bg[a]});
				fg = Object.keys(fg).sort(function(a,b){return fg[b]-fg[a]});
				imageColor = Object.keys(imageColor).sort(function(a,b){return imageColor[b]-imageColor[a]});
				
				cb(bg, fg, imageColor);

				db.close();
			});
		}
	});
}

/**
 * API to get tag data
 */
correlateAPI.prototype.getTagData = function (cb) {
	var tags = [];

	MongoClient.connect(url, function(err, database) {
		db = database;
		if(err) {
			console.log(err);
		}
		else {
			// get all the collection
			db.collection('logos-tag').find().toArray(function(err, items) {
				//console.log(items.length);

				for (var i = 0; i < items.length; i++) {
					for (var j = 0; j < Object.keys(items[i].tag).length; j++) {
						//console.log(items[i].tag[j])
						var tagName = items[i].tag[j].tag;
						var confidenceVal = items[i].tag[j].confidence;

						if (typeof tags[tagName] !== 'undefined') {
							tags[tagName] += confidenceVal;
						}
						else {
							tags[tagName] = confidenceVal;
						}

						//process.stdout.write("colorKey: " + colorKey + "percentVal: " + percentVal);
					}
				}

				tags = Object.keys(tags).sort(function(a,b){return tags[b]-tags[a]});
				
				cb(tags);

				db.close();
			});
		}
	});
}

var correlate = new correlateAPI();
correlate.getCompanyData("Privately Held", 118, "51-200", function(collection) {
	//console.log(collection);

	MongoClient.connect(url, function(err, database) {
		db = database;
		if(err) {
			console.log(err);
		}
		else {
			for (var i = 0; i < collection.length; i++) {
				imagga.color1(database, 'logos-color', collection[i].name, collection[i].logoUrl);
			}
		}
	});

	// for (var company in collection) {
	// 	if (collection[company].logoUrl != null) {
	// 		// console.log(collection[company].employeeCountRange)
			//imagga.color('logos-color', collection[0].name, collection[0].logoUrl);
	// 	}
	// }
});
// correlate.getColorData(function(bg, fg, imageColor) {
// 	console.log(bg);
// 	console.log(fg);
// 	console.log(imageColor);
// });
// correlate.getTagData(function(tags) {
// 	console.log(tags.sort());
// });


module.exports = correlateAPI;