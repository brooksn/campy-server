module.exports = function(uri, replace){
  var url = uri;
  for (var key in replace){
    url = url.replace('{'+key+'}', replace[key]);
  }
  return url;
};
