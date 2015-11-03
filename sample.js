var LinkedIn = require('./LinkedInAPI');

var abc = function () {
	var linkedIn = new LinkedIn();
	var start = 0;

	for (; start <= 60; start+=20) {
		linkedIn.getCompanies(118, start, function (response) {
			console.log(response);
		});
	}
}

abc();