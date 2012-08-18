var parent = module.parent.exports
	, models = parent.models
	, wordpress = parent.wordpress
	, semver = parent.semver;

// Authenticate using our plain-object database of doom!
exports.authenticate = function (data, fn) {
	var client = wordpress.createClient({
		username: data.username,
		password: data.password,
		url: data.host
	});

	// Here we check if can login to wp requesting for blog options
	client.authenticatedCall('wp.getOptions', function(err, wpOptions) {
		if(err && err.code === 'ENOTFOUND') return fn("Bad host provided.");
		if(err && err.code === 'ECONNRESET') return fn("Couldnt stablish a connection to the provided host.");
		if(err && err.code === 'ECONNREFUSED') return fn("Couldnt stablish a connection to the provided host.");
		if(err && err.code === 403) return fn("Bad credentials. Try again!");
		if(err && err.code === 405) return fn("XML-RPC not enabled. Contact the blog's admin and try again!");
		if(err) return fn(err);
		if(semver.lt(wpOptions.software_version.value,'3.4.0')) return fn("Your wordpress version must be higher or equal than 3.4.0. Contact the blog's admin and try again!");

		var user = {
			username: name,
			password: pass,
			blogUrl: url
		}

		return fn(null, user);
	});
};