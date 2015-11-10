var LinkedIn = require('./LinkedInAPI');

var abc = function () {
	var linkedIn = new LinkedIn();

	linkedIn.getCompanies(118, 20, function (response) {
		for (var i = 0; i < 20; i++) {
			linkedIn.storeCompanies(response[i].id, function() {
				console.log("stored");
			});
		}
	});
}

abc();