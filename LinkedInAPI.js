'use strict';
var request = require('request');

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
	    	cb(result.companies);
	    }
    });
}

/**
 * Make linkedinAPI call with industry parameter
 */
LinkedInAPI.prototype.getCompanies = function (industryCode, start, cb) {
	var data = this.apiCall({
		method: 'GET',
		url: '?facet=industry,' + industryCode + '&start=' + start + '&count=20&format=json',
		headers: {
			Authorization: 'Bearer AQWz3I0GKRXObUqpWPLoFGeHmq1ug_6snY8tNJkmpnhuZ08DQeA7zgIRRCLvV2yKrYNjRIPWlweg4j4WHYCgPN_zqo3DwnQpFcjubrvGCo8z5MAqoVm3Be1_I7Tg9C-jGvXTCEF7lNBgA5I-ZCSwMbYtd52BIQ0-TsU_3pcY1VIsZa0_Ugk'
		}
	}, function(response) {
		//for (var i = 0; i < )
		cb(response);
	});

}

module.exports = LinkedInAPI;