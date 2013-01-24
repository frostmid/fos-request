var request = require ('request'),
	URL = require ('url'),
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

	if (options.auth) {
		var parsedUrl = URL.parse (options.url);
		parsedUrl.auth = options.auth.username + ':' + options.auth.password;
		
		options.url = URL.format (parsedUrl);
		delete options.auth;
	}


	if (options.body && options.body.pipe) {
		var stream = options.body;
		
		delete options ['body'];
		
		stream.pipe (
			request (options, callback)
		);
	} else {
		if (options.returnRequest) {
			return request (options);
		} else {
			request (options, callback);
		}
	}

	return deferred.promise;
}

module.exports = function (options) {
	var request = promiseRequest (options);

	if (options.returnRequest) {
		return request;
	}
	return request
		.then (function (response) {
			if (options.returnResponse) return response;

			var contentType;

			if (response.headers ['content-type'] && !options.accept) {
				contentType = response.headers ['content-type'].split (';') [0];
			} else {
				contentType = options.accept || 'application/json';
			}

			if (contentType == 'application/json' || contentType == 'text/json') {
				var body;
				try {
					body = JSON.parse (response.body);
				} catch (e) {
					console.error ('Failed to parse http response body', e.message, options, response.body);
					throw e;
				}

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
