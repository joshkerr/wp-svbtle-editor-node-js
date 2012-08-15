var parent = module.parent.exports
  , models = parent.models
  , md = parent.md;
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Svbtle' })
};


exports.admin_index = function(req, res) {
  res.render('admin/index', { title: 'Admin', layout: 'layout'})
};

exports.admin_edit = function(req, res) {
  if(req.params.id) {
    models.Post.findOne({'_id': req.params.id }, function(err, post) {
      if(err) console.log("Something happened! >>", err);
      if(!post) console.log("No post found with _id", req.params.id); //This should redirect to 404.jade
      res.render('admin/edit', { title: 'Express', layout: 'admin/layout', post: post});
    });
  } else if(req.body.post && req.body.post.id) {
    models.Post.findOne({'_id': req.body.post.id }, function(err, post) {
      if(err) console.log("Something happened! >>", err);
      if(!post) console.log("No post found with _id", req.body.post.id); //This should redirect to 404.jade
      
      var submit_post = req.body.post;

      post.title = submit_post.title;
      post.contentHtml = md(submit_post.content);
      post.contentMarkdown = submit_post.content;
      post.contentLength = (submit_post.content).length;
      post.status = submit_post.status;
      post.externalUrl = submit_post.externalUrl;

      post.save(function(err) {
        if(err) console.log(err) // Errors should retrieve same page with params as locals!!
        res.redirect('/admin/edit/' + post._id);
      });
    });
  } else if(req.body.post) {
    var submit_post = req.body.post
      , newPost = new models.Post();
    
    newPost.title = submit_post.title;
    newPost.contentHtml = md(submit_post.content);
    newPost.contentMarkdown = submit_post.content;
    newPost.contentLength = submit_post.content.length;
    newPost.status = submit_post.status;
    newPost.externalUrl = submit_post.externalUrl;

    newPost.save(function(err) {
      if(err) console.log(err) // Errors should retrieve same page with params as locals!!
      res.redirect('/admin/edit/' + newPost._id);
    });
  } else {
    res.render('admin/edit', { title: 'Express', layout: 'admin/layout', post: {}});
  }
};

exports.admin_delete = function(req, res) {
  if(req.params.id) {
    models.Post.findById(req.params.id, function(err, post) {
      if(err) console.log("Something happened! >>", err);
      if(post) {
        post.remove(function() {
          res.redirect('/admin');
        });
      } else {
        res.redirect('/admin');
      }
    });
  }
}

exports.admin_settings = function(req, res) {
  res.render('admin/settings', { title: 'Settings', layout: 'admin/layout'})
};