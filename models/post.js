var parent = module.parent.exports 
  , mongoose = parent.mongoose;

var PostSchema = new mongoose.Schema({
	userId: String,
	title: String,
	contentHtml: String,
	contentMarkdown: String,
	status: Boolean,
	externalUrl: String,
	createdAt: Date
});

module.exports = mongoose.model('Post', PostSchema);