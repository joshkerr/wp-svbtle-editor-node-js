
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Svbtle' })
};


exports.admin_index = function(req, res){
  res.render('admin/index', { title: 'Express', layout: 'admin/layout'})
};

exports.admin_edit = function(req, res){
  res.render('admin/edit', { title: 'Express', layout: 'admin/layout'})
};