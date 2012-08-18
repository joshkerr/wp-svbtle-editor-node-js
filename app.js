
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
  , semver = exports.semver = require('semver')
  , auth = require('./auth');


var app = express();

// Environment set up
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('env', 'dev');
});

app.configure('production', function() {
  app.use(express.errorHandler());
  app.set('env', 'prod');
});

var mongo_url = process.env.MONGOHQ_URL || 'mongodb://localhost/svbtle';


// Connect mongoose to database
mongoose.connect(mongo_url);

// Configuration
app.configure(function(){
  // make ".jade" the default
  app.set('view engine', 'jade');
  // set views location
  app.set('views', __dirname + '/views');
  // serve static files
  app.use(express.static(__dirname + '/public'));

  // session support
  app.use(express.cookieParser('secret here'));
  app.use(express.session({
    cookie: {maxAge: 100000 * 2000} // 20 minutes
  , secret: 'foo'
  , store: new mongoStore({ url: mongo_url })
  }));

  // parse request bodies (req.body)
  app.use(express.bodyParser());

  // support _method (PUT in forms etc)
  app.use(express.methodOverride());

  // expose the "message" local variable when views are rendered
  app.use(utils.session_middleware);

  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  
  app.use(app.router);
});


// App Routes
app.get('/', routes.index);

app.get('/admin', utils.restrict, routes.admin_index);
app.get('/admin/new', utils.restrict, routes.admin_edit);
app.post('/admin/edit', utils.restrict, routes.admin_edit);
app.get('/admin/edit/:id', utils.restrict, routes.admin_edit);
app.get('/admin/delete/:id', utils.restrict, routes.admin_delete);

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.post('/login', function(req, res){
  auth.authenticate(req.body, function(err, user) {
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
      req.session.error = 'Something went WRONG. Please contact us via @gravityonmars';
      if(typeof err === 'string') req.session.error = err;
      console.error(err);
      res.redirect('/');
    }
  });
});

var port = process.env.PORT || 3000;

app.listen(port);

