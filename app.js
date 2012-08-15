
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , mongoose = exports.mongoose = require('mongoose')
  , models = exports.models = require('./models')
  , md = exports.md = require("node-markdown").Markdown
  , routes = require('./routes')
  , utils = require('./utils');


var app = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(passport.initialize());
  app.use(passport.session()); 
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

mongoose.connect('mongodb://localhost/svbtle');

// Passport setting up with twitter
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: 'JRLlr3yF7mV9WjQlIyDgIg',
    consumerSecret: '90VpCLJVb2oONLXucvjMi0PVyZCSAvVOZFXIMWjT8Q',
    callbackURL: "http://local.host:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    models.User.findOne({'source.id': profile.id, 'source.provider': profile.provider}, function(err, foundUser) {
      if(!err && foundUser) {
        foundUser.source = profile;
        foundUser.save();
        done(null, foundUser);
      } else if(!err) {
        var newUser = new models.User();
        newUser.displayName = profile.displayName;
        newUser.source = profile;
        newUser.createdAt = new Date;
        newUser.save();
        done(null, newUser);
      } else {
        console.log("Something happened!! ==>>", err);
        done(err, null)
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


// App Routes
app.get('/', routes.index);

app.get('/admin', utils.restrict, function (req, res) {
  models.Post.find({'status': {$in: [false, true]}}, function(err, posts){
     // render support
    res.render('admin/index', {
      ideas: posts.filter(function(post){ return post.status == false}),
      publications: posts.filter(function(post){ return post.status == true})
    });
  }).sort({'createdAt': 1});
});

app.get('/admin/new', utils.restrict, routes.admin_edit);

app.post('/admin/edit', utils.restrict, routes.admin_edit);
app.get('/admin/edit/:id', utils.restrict, routes.admin_edit);
app.get('/admin/delete/:id', utils.restrict, routes.admin_delete);

app.get('/admin/settings', function (req, res) {
    res.render('admin/settings', {
      user: req.user
    });
});
app.post('/admin/settings', function(req, res) {


    models.User.findOne({'_id': req.user._id}, function(err, foundUser) {
        var submit_post = req.body.settings;

        foundUser.displayName = submit_post.displayName;
        foundUser.blogName = submit_post.blogName;
        foundUser.url = submit_post.url;
        foundUser.blogUrl = submit_post.blogUrl;
        foundUser.smallBio = submit_post.smallBio;
        foundUser.typeKit = submit_post.typeKit;
        foundUser.googleAnalytics = submit_post.googleAnalytics;
        foundUser.save();

        // Should update session values 
    });

    res.redirect('/admin/settings')
});


// Passport routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/admin', failureRedirect: '/login' }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Themes
app.get('/themes/solar', function (req, res) {
    res.render('themes/solar/index', {
      user: req.user
    });
});


app.listen(3000);

