var LinkedIn = require('./LinkedInAPI');

var abc = function () {
	var linkedIn = new LinkedIn();

	linkedIn.getCompanies(118, 0, function (response) {
			console.log(response);
		});

	// for (var start = 0; start <= 60; start+=20) {
	// 	linkedIn.getCompanies(118, start, function (response) {
	// 		console.log(response);
	// 	});
	// }
}

abc();