var parent = module.parent.exports
  , models = parent.models
  , md = parent.md
  , toMarkdown = parent.toMarkdown
  , wordpress = parent.wordpress;
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Wordpress Svbtle' })
};


exports.admin_index = function(req, res) {
  res.render('admin/index', { title: 'wordpress svbtle editor', layout: 'layout'})
};

exports.admin_edit = function(req, res) {
  var client = wordpress.createClient({
      username: req.session.user.username,
      password: req.session.user.password,
      url: req.session.user.blogUrl
    })
  , post = {
        id: "",
        title: "",
        content: "",
        status: "",
        markdownContent: "",
        externalUrl: ""
    };

  if(req.params.id) {
    client.getPost(req.params.id, ['title','content','status','customFields'], function(err, wp_post) {
      if(err) console.log("Something happened! >>", err);
      if(!wp_post) console.log("No post found with _id", req.params.id); //This should redirect to 404.jade
      
        post.id= wp_post.id;
        post.title= wp_post.title;
        post.status= wp_post.status;

      // wp_post.customFields.forEach(function(customField) {
      //   if(customField.key === 'wp-svbtle-markdown') post.content = customField.value;
      //   if(customField.key === '_wp_svbtle_external_url') post.externalUrl = customField.value;
      // });

      if (post.content == "") post.content = toMarkdown(wp_post.content);
  
      res.render('admin/edit', { title: wp_post.title, layout: 'admin/layout', post: post });
    });
  } else if(req.body.post && req.body.post.id) {
    var wp_post = {
      id: req.body.post.id,
      title: req.body.post.title,
      status: req.body.post.status,
      content: md.toHTML(req.body.post.content),
      customFields: []
    }, markdown = {
      key: 'wp-svbtle-markdown',
      value: req.body.post.content
    }, externalUrl = {
      key: '_wp_svbtle_external_url',
      value: req.body.post.externalUrl
    };

    // Retrieve custom fields for properly update
    client.getPost(req.body.post.id, ['customFields'], function(err, wp_post_data) {
      if(err) console.log("Something happened! >>", err);
      if(!wp_post_data) console.log("No post found with _id", req.body.post.id); //This should redirect to 404.jade

      wp_post_data.customFields.forEach(function(customField) {
        if(customField.key === 'wp-svbtle-markdown') markdown.id = customField.id;
        if(customField.key === '_wp_svbtle_external_url') externalUrl.id = customField.id;
      });

      // Add the custom fields to update
      wp_post.customFields.push(markdown);
      wp_post.customFields.push(externalUrl);

      //Save the edited post
      client.editPost(req.body.post.id, wp_post, function(err, saved) {
        if(saved) console.log('post saved with id:', wp_post.id)
        res.redirect('/admin/edit/' + req.body.post.id);
      });
    })    

  } else if(req.body.post) {
    var submit_post = req.body.post
      , newPost = {
          title: submit_post.title,
          content: md.toHTML(submit_post.content || ""),
          status: submit_post.status || 'draft',
          customFields: [{
            key: 'wp-svbtle-markdown',
            value: submit_post.content || ''
          }, {
            key: '_wp_svbtle_external_url',
            value: submit_post.externalUrl || ''
          }]
      };
    
    client.newPost(newPost, function(err, post_id) {
      if(post_id) console.log('post saved with id:', post_id)
      res.redirect('/admin/edit/' + post_id);
    });
  } else {
    res.render('admin/edit', { title: 'New post', layout: 'admin/layout', post: {}});
  }
};

exports.admin_delete = function(req, res) {
  if(req.params.id) {
    wordpress.createClient({
      username: req.session.user.username,
      password: req.session.user.password,
      url: req.session.user.blogUrl
    }).deletePost(req.params.id, function(err, deleted) {
      if(deleted) console.log("Deleted post with id:", req.params.id);
      res.redirect('/admin');
    });
  }
}

exports.admin_settings = function(req, res) {
  res.render('admin/settings', { title: 'Settings', layout: 'admin/layout'})
};