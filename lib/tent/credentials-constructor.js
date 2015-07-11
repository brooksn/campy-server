var gen = require('../helpers/gen-id.js');
var credentialsConstructor = function(){
  var post = {};
  post.type = 'https://tent.io/types/credentials/v0';
  post.content = {};
  post.content.hawk_key = gen(18);
  post.content.hawk_algorithm = 'sha256';
  return post;
};
module.exports = credentialsConstructor;
