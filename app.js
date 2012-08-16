
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = exports.mongoose = require('mongoose')
  , models = exports.models = require('./models')
  , md = exports.md = require("node-markdown").Markdown
  , routes = require('./routes')
  , hash = require('./pass').hash
  , utils = require('./utils');


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
app.use(function(req, res, next){
  var err = req.session.error
    , msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

mongoose.connect('mongodb://localhost/svbtle');



// passport.use(new TwitterStrategy({
//     consumerKey: 'JRLlr3yF7mV9WjQlIyDgIg',
//     consumerSecret: '90VpCLJVb2oONLXucvjMi0PVyZCSAvVOZFXIMWjT8Q',
//     callbackURL: "http://local.host:3000/auth/twitter/callback"
//   },
//   function(token, tokenSecret, profile, done) {
//     models.User.findOne({'source.id': profile.id, 'source.provider': profile.provider}, function(err, foundUser) {
//       if(!err && foundUser) {
//         foundUser.source = profile;
//         foundUser.save();
//         done(null, foundUser);
//       } else if(!err) {
//         var newUser = new models.User();
//         newUser.displayName = profile.displayName;
//         newUser.source = profile;
//         newUser.createdAt = new Date;
//         newUser.save();
//         done(null, newUser);
//       } else {
//         console.log("Something happened!! ==>>", err);
//         done(err, null)
//       }
//     });
//   }
// ));




// App Routes
app.get('/', routes.index);

app.get('/admin', utils.restrict, function (req, res) {
  // models.Post.find({'status': {$in: [false, true]}}, function(err, posts){
  //    // render support
  //   res.render('admin/index', {
  //     ideas: posts.filter(function(post){ return post.status == false}),
  //     publications: posts.filter(function(post){ return post.status == true})
  //   });
  // }).sort({'createdAt': 1});
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


// Passport routes
// dummy database

var users = {
  tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('foobar', function(err, salt, hash){
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});


// Authenticate using our plain-object database of doom!
function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  })
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/');
  }
}


app.get('/restricted', restrict, function(req, res){
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
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
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



app.listen(3000);

