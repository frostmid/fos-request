var request = require ('request'),
	Q = require ('q');

function promiseRequest (options) {
	var deferred = Q.defer ();
	
	var callback = function (error, response) {
		if (error) {
			deferred.reject (error);
		} else {
			deferred.resolve (response);
		}
	};


	if (options.body && options.body.pipe) {
		var stream = options.body;
		
		delete options ['body'];
		
		stream.pipe (
			request (options, callback)
		);
	} else {
		request (options, callback);
	}

	return deferred.promise;
}

module.exports = function (options) {
	return promiseRequest (options)
		.then (function (response) {
			if (options.returnResponse) return response;

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
};
