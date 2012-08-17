var parent = module.parent.exports
	, models = parent.models
	, wordpress = parent.wordpress
	, hash = parent.hash;

// dummy database
var users = {
  tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('foobar', function(err, salt, hash){
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});

// Authenticate using our plain-object database of doom!
exports.authenticate = function (name, pass, url, fn) {
	var client = wordpress.createClient({
		username: name,
		password: pass,
		url: url
	});
	// Here we check if can login to wp requesting for blog options
	client.authenticatedCall('wp.getOptions', function(err, wpOptions) {
		if(err) {
			switch(err.code) {
				case 'ENOTFOUND':
					console.log("Bad Host");
					return fn("Bad host provided.")
					break;
				case 'ECONNRESET':
					console.log("Couldnt stablish connection.");
					return fn("Couldnt stablish connection.")
					break;
				case 403:
					console.log("Bad credentials.");
					return fn("Couldnt stablish connection.")
					break;
				case 405:
					console.log("XML-RPC not enabled. Contact the blog's admin and try again!");
					return fn("XML-RPC not enabled. Contact the blog's admin and try again!.")
					break;
				default:
					console.log("Something happened! >>", err);
					return fn("Something happened! >> " + err.toString());
			}
		}
		//Here needs to check for compatibility

		var user = {
			username: name,
			password: pass,
			blogUrl: url
		}

		return fn(null, user);
	});

  // if (!module.parent) console.log('authenticating %s:%s', name, pass);
  // var user = users[name];
  // // query the db for the given username
  // if (!user) return fn(new Error('cannot find user'));
  // // apply the same algorithm to the POSTed password, applying
  // // the hash against the pass / salt, if there is a match we
  // // found the user
  // hash(pass, user.salt, function(err, hash){
  //   if (err) return fn(err);
  //   if (hash == user.hash) return fn(null, user);
  //   fn(new Error('invalid password'));
  // })
}
