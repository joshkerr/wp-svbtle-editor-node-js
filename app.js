
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , mongoose = exports.mongoose = require('mongoose')
  , models = require('./models')
  , utils = require('./utils')
  , md = require("node-markdown").Markdown;


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

app.get('/admin', function (req, res) {
  models.Post.find({'status': {$in: [false, true]}}, function(err, posts){
     // render support
    res.render('admin/index', {
      ideas: posts.filter(function(post){ return post.status == false}),
      publications: posts.filter(function(post){ return post.status == true})
    });
  });
});

app.get('/admin/edit', utils.restrict, routes.admin_edit);
app.post('/admin/edit', function(req, res) {

    var submit_post = req.body.post;

    var newPost = new models.Post();
    newPost.title = submit_post.title;
    newPost.contentHtml = md(submit_post.content);
    newPost.contentMarkdown = submit_post.content;
    newPost.status = submit_post.status;
    newPost.externalUrl = submit_post.external_url;
    newPost.save();


    res.redirect('admin/edit')
});

app.get('/admin/settings', utils.restrict, routes.admin_settings);

// Passport routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/admin', failureRedirect: '/login' }));




app.listen(3000);

