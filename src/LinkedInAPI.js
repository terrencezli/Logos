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
		url: ':(companies:(id,name,website-url,company-type,logo-url,employeeCountRange,industries))?facet=industry,' + industryCode + '&start=' + start + '&count=20&format=json',
		headers: {
			Authorization: 'Bearer AQV2bRlp32_y1znkzUEGMAf3QUxcBFnT73A_8rhHGMta1ZxGY2-paZ8LPD4r6v17AP3nZX3dp56ScWbqI9gMaaQTxfjTOYznMh0H69gXL9Gt3Dj0na7lO2FakrZYVY6jFVqc4zVeUvHop8LfGsl6x2KYIQ5buM_jn9xjbZGO2aXpnqvsZf4'
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
    var collection = db.collection('companies');
    
    // prevent same id companies
    collection.createIndex({"id": 1}, {unique: true});

    //console.log(company)
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
						console.log("Stored " + count);
						countCompanies();
					});
				});
			}
		}
	});
}

main();

module.exports = LinkedInAPI;