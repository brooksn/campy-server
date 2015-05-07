var canonicalPostJSON = function(originalpost){
  var post = originalpost;
  
  if (post.original_entity) post.entity = post.original_entity;
  delete post.original_entity;
  delete post.permissions;
  if (post.app) delete post.app.id;
  delete post.received_at;
  if (post.version) {
    delete post.version.received_at;
    delete post.version.id;
  }
  
  //var canonical = JSON.parse(JSON.stringify(post));
  
  
  var isObject = function(object){
    return Object.prototype.toString.call(object) === '[object Object]';
  };
  
  var canonical = {};
  
  var keySort = function(object){
    if (!isObject(object) && !Array.isArray(object)) return;
    if (object == null) return;
    var freshObject;
    if (isObject(object)) freshObject = {};
    if (Array.isArray(object)) freshObject = [];

    var keys = Object.keys(object).sort();

    for (var i=0; i<keys.length; i++){
      if (object[keys[i]] == null) {}
      else if (object[keys[i]] == undefined || typeof object[keys[i]] == 'undefined') {}
      else if (!object[keys[i]] && object[keys[i]] !== false) {}
      else if (typeof object[keys[i]] === 'number' && Number.isInteger(object[keys[i]])) {
        freshObject[keys[i]] = object[keys[i]];
      } else if (isObject(object[keys[i]])) {
        var child = keySort(object[keys[i]]);
        if (isObject(child)) freshObject[keys[i]] = child;
      } else if (typeof object[keys[i]] === 'string') {
        freshObject[keys[i]] = object[keys[i]];
      } else if(Array.isArray(object[keys[i]])) {
        var child = keySort(object[keys[i]]);
        if (Array.isArray(child)) freshObject[keys[i]] = child;
      }
    }
    
    var hasFreshKeys = false;
    for (var k in freshObject) hasFreshKeys = true;
    if (Array.isArray(freshObject)){
      freshObject.sort();
      for(var i = freshObject.length-1; i>=0; i--) {
        if (freshObject[i] == null) freshObject.pop();
      }
    }
    if (hasFreshKeys === true) return freshObject;
    return;
  };
  canonical = keySort(post);
  return canonical;
};
module.exports = canonicalPostJSON;
