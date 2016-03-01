var routes = require('../endpoints/routes.js');
var url = require('url');
console.log('BASEURL IS:  ' + global.baseurl);
var serverURLs = function(userid) {
  'use strict';
  var urls = {};
  eachroute: for (let route of routes) {
    if (urls[route.endpoint]) continue eachroute;
    var u = url.resolve(global.baseurl, route.path);
    u = u.replace(':entity', '{entity}');
    u = u.replace(':postid', '{post}');
    u = u.replace(':userid', userid);
    urls[route.endpoint] = u;
    //if (!urls[route.endpoint]) urls[route.endpoint] = u;
  }
  return urls;
};

module.exports = serverURLs;
