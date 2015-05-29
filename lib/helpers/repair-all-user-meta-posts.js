var co = require('co');
var q = require('./postgres-queries.js');
var get = require('lodash/object/get');
var savePost = require('../save-post.js');
var routes = require('../endpoints/routes.js');
var eq = function(a,b){
  for (var key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};


var repairAllUserMetaPosts = co.wrap(function*(){
  'use strict';
  var users = yield global.__knex.select('*').from('users');
  for (let user of users){
    let urls = {};
    for (let route of routes) {
      var u = route.path.replace(':entity', '{entity}');
      u = u.replace(':postid', '{post}');
      u = u.replace(':userid', user.id);
      if (!urls[route.endpoint]) urls[route.endpoint] = u;
    }
    var posts = yield global.__knex.select('json').from('posts')
    .where('type', 'https://tent.io/types/meta/v0')
    .whereRaw(q.whereEntity(user.entity)).limit(1).orderBy('received_at', 'DESC');
    let meta;
    let savemode;
    let equality = false;
    if (posts[0] && get(posts[0], 'json.content.servers')) {
      for (let list of posts[0].json.content.servers) {
        if (eq(list.urls, urls)) equality = true;
      }
    }
    if (posts[0] && !equality) {
      savemode = 'new_version';
      if (typeof posts[0].json === 'string') meta = JSON.parse(posts[0].json);
      else if (posts[0].json) meta = posts[0].json;
      else throw Error('Post did not have json field');
    } else if (!posts[0]) {
      savemode = 'new_post';
      meta = {
        entity: user.entity,
        type: 'https://tent.io/types/meta/v0',
        content: {},
        permissions: {
          'public': true
        }
      };
    }
    meta.content.servers = [{
      preference: 0,
      urls: urls,
      version: '0.3'
    }];
    if (meta) yield savePost(user.id, meta, savemode);
  }
  return;
});

module.exports = repairAllUserMetaPosts;
