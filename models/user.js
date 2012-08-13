var parent = module.parent.exports 
  , mongoose = parent.mongoose;

var UserSchema = new mongoose.Schema({
	displayName: String,
	source: Object,
	createdAt: Date
});

module.exports = mongoose.model('User', UserSchema);