var parent = module.parent.exports 
  , mongoose = parent.mongoose;

var UserSchema = new mongoose.Schema({
	displayName: String,
	themeId: String,
	blogName: String,
	url: String,
	blogUrl: String,
	smallBio: String,
	typeKit: String,
	googleAnalytics: String,
	source: Object,
	createdAt: Date
});

module.exports = mongoose.model('User', UserSchema);