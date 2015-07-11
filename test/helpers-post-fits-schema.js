var test = require('tape');
var fits = require('../lib/helpers/post-fits-schema.js');


test('post-fits-schema new_post', function(a){
  var status = require('./posts/status-post.js');
  a.plan(4);

  a.notEqual(fits(status, 'new_post'), true);
  
  delete status.entity
  a.equal(fits(status, 'new_post'), true);
  
  status.content.extraneous = 'hey';
  a.notEqual(fits(status, 'new_post'), true)
  
  delete status.content.extraneous;
  status.type = 'status';
  a.notEqual(fits(status, 'new_post'), true);
  
  a.end();
});

test('post-fits-schema update_post', {skip: true}, function(b){
  var status = require('./posts/status-post.js');
  b.plan(2);
  
  b.notEqual(fits(status, 'update_post'), true);
  
  delete status.entity
  b.notEqual(fits(status, 'new_post'), true);
  
  b.end();
});
