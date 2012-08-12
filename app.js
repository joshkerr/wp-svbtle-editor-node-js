
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , mongoose = require('mongoose')
  , utils = require('./utils');

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


// Passport setting up with twitter
passport.use(new TwitterStrategy({
    consumerKey: 'JRLlr3yF7mV9WjQlIyDgIg',
    consumerSecret: '90VpCLJVb2oONLXucvjMi0PVyZCSAvVOZFXIMWjT8Q',
    callbackURL: "http://local.host:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    done(null, profile)
    // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
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
app.get('/admin', utils.restrict, routes.admin_index);
app.get('/admin/edit', utils.restrict, routes.admin_edit);
app.get('/admin/settings', utils.restrict, routes.admin_settings);

// Passport routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/admin', failureRedirect: '/login' }));




app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
