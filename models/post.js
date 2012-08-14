var parent = module.parent.exports 
  , mongoose = parent.mongoose;

var PostSchema = new mongoose.Schema({
	post_user_id: String,
	postTitle: String,
	postContentHtml: String,
	postContentMarkdown: String,
	postStatus: Boolean,
	postExternalUrl: String,
	createdAt: Date
});

module.exports = mongoose.model('Post', PostSchema);