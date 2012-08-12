
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// New

var mongoose = require('mongoose');
var mongodb = require('mongodb');
mongoose.connect('mongodb://ricardorauch/svbtle');

var passport = require('passport'), TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: 'JRLlr3yF7mV9WjQlIyDgIg',
    consumerSecret: '90VpCLJVb2oONLXucvjMi0PVyZCSAvVOZFXIMWjT8Q',
    callbackURL: "http://local.host:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

// Routes

app.get('/', routes.index);
app.get('/admin', routes.admin_index);
app.get('/admin/edit', routes.admin_edit);
app.get('/admin/settings', routes.admin_settings);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));




app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
