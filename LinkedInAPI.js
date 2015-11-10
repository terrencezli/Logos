'use strict';
var request = require('request');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , ObjectID = require('mongodb').ObjectID
  , express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , LinkedInStrategy = require('passport-linkedin').Strategy;
var db;

var APP_URL = 'https://api.linkedin.com/v1/company-search';

/**
 * Constructor for the linkedAPI
 * @constructor
 */
function LinkedInAPI() {
}

/**
 * API to call linkedinAPI
 */
LinkedInAPI.prototype.apiCall = function (options, cb) {
	// Add options url to base url
	options.url = APP_URL + options.url;
	// options.json = !options.parseJSON;
    // Make http request call
    request.get(options, function(error, response, body) {
    	if (response.statusCode == 200 && !error) {
	    	var result = JSON.parse(body);
	    	//console.log(result.companies.values)
	    	cb(result.companies.values);
	    }
	    else {
	    	//console.log(response);
	    }
    });
}

/**
 * Make linkedinAPI call with industry parameter
 */
LinkedInAPI.prototype.getCompanies = function (industryCode, start, cb) {
	var data = this.apiCall({
		method: 'GET',
		url: ':(companies:(id,name,website-url,company-type,logo-url))?facet=industry,' + industryCode + '&start=' + start + '&count=20&format=json',
		headers: {
			Authorization: 'Bearer AQUuamoh5szmzqJQ9-a6yZmXM6d3xWKbmpbsQ4gsGJlXheL1v0OxMUIHsRW2_AQjOkU0HVb-EffCPqsl300BcgqXPkTyj9l3O8nyLI0zlNHylTKJ4jJ07eFcNOrjA3kBeBzscAYaJyfJMjaL-7p46JaVVoR0Bp4E5i6-3Aut7wQkBhG2OFM'
		}
	}, function(response) {
		//console.log(response);
		cb(response);
	});

}

/**
 * Store companies into db
 */
LinkedInAPI.prototype.storeCompanies = function (company, cb) {
    var collection = db.collection('companies-test');
    // prevent same id companies
    collection.createIndex({"id": 1}, {unique: true});

    collection.insert(company, function(err, result){
       if(err) {
          //console.log(err);
          db.close();
          //console.log(company);
       }
       else {
       	cb();
       }
    });
}

var count = 0;
var countCompanies = function () {
	count+=20;

	if(count == 20){
		db.close();
	}
}

var main = function () {
	var linkedIn = new LinkedInAPI();

	var url = 'mongodb://162.243.144.203:27017/pogomylogo';
	
	MongoClient.connect(url, function(err, database) {
		db = database;
		if(err) {
			//console.log(err);
		}
		else {
			// get companies
			for (var i = 0; i < 20; i+=20) {
				linkedIn.getCompanies(118, i, function (response) {
					linkedIn.storeCompanies(response, function() {
						console.log("Stored 20");
						countCompanies();
					});
				});
			}
		}
	});
}

main();

module.exports = LinkedInAPI;