var routes = require('../endpoints/routes.js');
var serverURLs = function(userid) {
  'use strict';
  var urls = {};
  for (let route of routes) {
    var u = route.path.replace(':entity', '{entity}');
    u = u.replace(':postid', '{post}');
    u = u.replace(':userid', userid);
    if (!urls[route.endpoint]) urls[route.endpoint] = u;
  }
  return urls;
};

module.exports = serverURLs;
