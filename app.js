
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = exports.mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , models = exports.models = require('./models')
  , wordpress = exports.wordpress = require('wordpress')
  , md = exports.md = require( "markdown" ).markdown
  , toMarkdown = exports.toMarkdown  = require('to-markdown').toMarkdown
  , routes = require('./routes')
  , hash = exports.hash = require('./pass').hash
  , utils = require('./utils')
  , auth = require('./auth');


var app = express();

// Environment set up
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var mongo_url = process.env.MONGOHQ_URL || 'mongodb://localhost/svbtle';


// Connect mongoose to database
mongoose.connect(mongo_url);



// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret here'));
  app.use(express.session({
    cookie: {maxAge: 60000 * 20} // 20 minutes
  , secret: 'foo'
  ,   store: new mongoStore({ url: mongo_url })
  }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Session-persisted message middleware
app.use(utils.session_middleware);

// App Routes
app.get('/', routes.index);

app.get('/admin', utils.restrict, function (req, res) {
  wordpress.createClient({
    username: req.session.user.username,
    password: req.session.user.password,
    url: req.session.user.blogUrl
  }).getPosts({type: 'post'}, ['id','title','status','date'], function(err, posts) {
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

