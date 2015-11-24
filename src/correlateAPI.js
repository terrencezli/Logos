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
var db;

/**
 * Constructor for the linkedAPI
 * @constructor
 */
function correlateAPI() {
}

/**
 * API to get color data
 */
correlateAPI.prototype.getColorData = function (cb) {
	var url = 'mongodb://162.243.144.203:27017/pogomylogo';
	var colors = [];

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
					for (var j = 0; j < Object.keys(items[i].bgColor).length; j++) {
						//console.log(Object.keys(items[i].bgColor)[j]);
						var colorKey = Object.keys(items[i].bgColor)[j];
						var percentVal = items[i].bgColor[colorKey];

						if (typeof colors[colorKey] !== 'undefined') {
							colors[colorKey] += percentVal;
						}
						else {
							colors[colorKey] = percentVal;
						}

						//process.stdout.write("colorKey: " + colorKey + "percentVal: " + percentVal);
					}
				}
				cb(colors);

				db.close();
			});
		}
	});
}

/**
 * API to get tag data
 */
correlateAPI.prototype.getTagData = function (cb) {
	var url = 'mongodb://162.243.144.203:27017/pogomylogo';
	
	MongoClient.connect(url, function(err, database) {
		db = database;
		if(err) {
			console.log(err);
		}
		else {
			// get all the collection
			db.collection('logos-tag').find().toArray(function(err, items) {
				console.log(items);

				db.close();
			});
		}
	});
}

var correlate = new correlateAPI();
var lol = correlate.getColorData(function(colors) {
	console.log(colors);
});



module.exports = correlateAPI;