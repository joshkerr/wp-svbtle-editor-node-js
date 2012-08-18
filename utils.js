exports.restrict = function(req, res, next){
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/');
  }
};

exports.session_middleware = function(req, res, next){
  var err = req.session.error
    , msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = err;
  if (msg) res.locals.message = msg;
  // res.env == app.configure
  // res.locals.env = app.configure.env
  // console.log(app.configure.env);
  next();
};
