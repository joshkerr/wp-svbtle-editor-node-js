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

exports.wpErrorChecks = function(err, fn) {
  if(err && err.code === 'ENOTFOUND') return fn("Bad host provided.");
  if(err && err.code === 'ECONNRESET') return fn("Couldnt stablish a connection to the provided host.");
  if(err && err.code === 'ECONNREFUSED') return fn("Couldnt stablish a connection to the provided host.");
  if(err && err.code === 403) return fn("Bad credentials. Try again!");
  if(err && err.code === 405) return fn("You need to enable XML-RPC in Your Blog Admin > Settings > Writing > Remote Publishing and check the checkbox.");
  if(err) return fn(err);
  return fn(null);
};