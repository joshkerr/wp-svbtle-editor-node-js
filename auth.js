var parent = module.parent.exports
	, models = parent.models
	, wordpress = parent.wordpress
	, semver = parent.semver
	, utils = parent.utils;

// Authenticate using our plain-object database of doom!
exports.authenticate = function (data, fn) {
	var client = wordpress.createClient({
		username: data.username,
		password: data.password,
		url: data.host
	});

	// Here we check if can login to wp requesting for blog options
	client.authenticatedCall('wp.getOptions', function(err, wpOptions) {
		utils.wpErrorChecks(err, function(wpErr) {
			if(wpErr) return fn(wpErr);
			if(semver.lt(wpOptions.software_version.value,'3.4.0')) return fn("Your wordpress version must be higher or equal than 3.4.0. Contact the blog's admin and try again!");

			var user = {
				username: data.usenname,
				password: data.password,
				blogUrl: data.host
			}

			return fn(null, user);
		})
	});
};