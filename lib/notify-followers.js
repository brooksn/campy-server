var co = require('co');
var typeHelper = require('./helpers/post-type.js');
var knex = global.__knex;

var notifyFollowers = function*(post){
  var type = typeHelper(post);
  var find = {
    type: type.url
  };
  if (type.fragment) find.fragment = type.fragment;
  var results = yield knex.select('json').from('posts').where(find);
  var relpostids = [];
  results.forEach(function(sub){
    relpostids.push(sub.mentions);
  });
};

module.exports = co.wrap(notifyFollowers);
