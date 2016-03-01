var co = require('co');
var q = require('../helpers/postgres-queries.js');
var get = require('lodash/object/get');
var eq = require('../helpers/eq.js');
var savePost = require('./save-post.js');
var serverURLs = require('../helpers/server-urls.js');

var port = process.env.PORT|| process.env.port || process.env.npm_package_config_port || global.port || 3000;
global.baseurl = global.baseurl || process.env.baseurl || process.env.npm_package_config_baseurl || 'http://localhost:'+port;
global.tentversion = global.tentversion || process.env.tentversion || process.env.npm_package_config_tentversion || '0.3';

if (!global.knex) global.knex = require('knex')({
  client: 'pg',
  connection: require('../helpers/pgconnection.js')
});



var repairAllUserMetaPosts = co.wrap(function*(destroyknex){
  'use strict';
  var users = yield global.knex('users').select('*');
  console.log('users: ');
  console.log(users);
  for (let user of users){
    console.log('user: ' + user.username);
    let urls = serverURLs(user.id);
    console.log('routes: ');
    console.log(JSON.stringify(urls, null, '  '));
    var posts = yield global.knex('posts').select('json')
    .where('type', 'https://tent.io/types/meta/v0')
    .whereRaw(q.whereEntity(user.entity)).limit(1).orderBy('received_at', 'DESC');
    console.log('\nposts: \n');
    console.log(JSON.stringify(posts, null, '  '));
    let savemode = 'new_post';
    let goodfirstserver = false;
    let goodserver = {
      urls: urls,
      preference: 0,
      version: global.tentversion
    };

    let post = {type: 'https://tent.io/types/meta/v0', content: {servers: []}};
    console.log('POSTS: ');
    console.log(JSON.stringify(posts));

    if (posts[0]) {
      savemode = 'new_version';
      post = posts[0].json;
    }

    if (post.content && post.content.servers && post.content.servers[0]) {
      if (eq.firstMatchesSecond(post.content.servers[0], goodserver)) goodfirstserver = true;
    }
    console.log('savemode: ' + savemode + ' goodfirstserver: ' + goodfirstserver);
    if (goodfirstserver !== true) yield savePost(user.id, post, savemode, user.entity);
  }
  console.log('made it to the end');
  if (destroyknex !== false) {
    global.knex.destroy();
  }
  return;
});

if (require.main === module){
  repairAllUserMetaPosts().catch(function(e){
    console.log(e);
  });
}

module.exports = repairAllUserMetaPosts;
