var request = require ('request'),
	Q = require ('q');

function promiseRequest (options) {
	var deferred = Q.defer ();

	request (options, function (error, response) {
		if (error) {
			deferred.reject (error);
		} else {
			deferred.resolve (response);
		}
	});

	return deferred.promise;
}

module.exports = function (options) {
	return promiseRequest (options)
		.then (function (response) {
			var contentType;

			if (response.headers ['content-type'] && !options.accept) {
				contentType = response.headers ['content-type'].split (';') [0];
			} else {
				contentType = options.accept || 'application/json';
			}

			if (contentType == 'application/json' || contentType == 'text/json') {
				var body = JSON.parse (response.body);

				if (body.error) {
					throw body;
				} else {
					return body;
				}
				
			} else {
				return response.body;
			}
		});
}
