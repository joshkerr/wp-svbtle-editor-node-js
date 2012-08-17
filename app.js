
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = exports.mongoose = require('mongoose')
  , models = exports.models = require('./models')
  , md = exports.md = require("node-markdown").Markdown
  , routes = require('./routes')
  , hash = exports.hash = require('./pass').hash
  , utils = require('./utils')
  , wordpress = exports.wordpress = require('wordpress')
  , auth = require('./auth');


var app = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret here'));
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Session-persisted message middleware
app.use(utils.session_middleware);

// Environment set up
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Connect mongoose to database
mongoose.connect('mongodb://svbtle:facebook123@alex.mongohq.com:10088/app6786727');


// App Routes
app.get('/', routes.index);

app.get('/admin', utils.restrict, function (req, res) {
  var client = wordpress.createClient({
    username: req.session.user.username,
    password: req.session.user.password,
    url: req.session.user.blogUrl
  }).getPosts(function(err, posts) {
    res.render('admin/index', {
      ideas: posts.filter(function(post) { return post.status === 'draft' }),
      publications: posts.filter(function(post) { return post.status === 'publish' })
    });
  });
});

app.get('/admin/new', utils.restrict, routes.admin_edit);

app.post('/admin/edit', utils.restrict, routes.admin_edit);
app.get('/admin/edit/:id', utils.restrict, routes.admin_edit);
app.get('/admin/delete/:id', utils.restrict, routes.admin_delete);

app.get('/admin/settings', function (req, res) {

  models.User.findOne({'_id': req.user._id}, function(err, foundUser) {
    res.render('admin/settings', {
      user: foundUser
    });
  }); 

});
app.post('/admin/settings', function(req, res) {

    // if xml-rpc works then...

    models.User.findOne({'_id': req.user._id}, function(err, foundUser) {
        var submit_post = req.body.settings;

        foundUser.blogUrl = submit_post.blogUrl;
        foundUser.blogUsername = submit_post.blogUsername;
        foundUser.blogPassword = submit_post.blogPassword;
        foundUser.save();

        // Should update session values 
    });

    res.redirect('/admin/settings')
});

app.get('/restricted', utils.restrict, function(req, res){
  res.send('Wahoo! restricted area');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

// app.get('/login', function(req, res){
//   if (req.session.user) {
//     req.session.success = 'Authenticated as ' + req.session.user.name
//       + ' click to <a href="/logout">logout</a>. '
//       + ' You may now access <a href="/restricted">/restricted</a>.';
//   }
//   res.render('/admin');
// });

app.post('/login', function(req, res){
  auth.authenticate(req.body.username, req.body.password, req.body.host, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function() {
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        res.redirect('/admin');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('/');
    }
  });
});



var port = process.env.PORT || 3000;

app.listen(port);

