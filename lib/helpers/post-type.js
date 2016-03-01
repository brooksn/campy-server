var postTypes = function(post){
  var typexplosion = post.type.split('#');
  var type = {type: post.type};
  type.url = typexplosion.shift();
  type.fragment = typexplosion.join('#');
  if (type.type.length <= 0) return null;
  return type;
};

module.exports = postTypes;
