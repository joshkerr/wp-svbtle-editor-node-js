var parent = module.parent.exports 
  , mongoose = parent.mongoose;

var UserSchema = new mongoose.Schema({
	displayName: String,
	blogUrl: String,
	blogUsername: String,
	blogPassword: String,
	source: Object,
	createdAt: Date
});

module.exports = mongoose.model('User', UserSchema);