
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Svbtle' })
};


exports.admin_index = function(req, res){
  res.render('admin/index', { title: 'Admin', layout: 'layout'})
};

exports.admin_edit = function(req, res){
  res.render('admin/edit', { title: 'Express', layout: 'admin/layout'})
};

exports.admin_settings = function(req, res){
  res.render('admin/settings', { title: 'Settings', layout: 'admin/layout'})
};