var co = require('co');
var q = require('../helpers/postgres-queries.js');
var get = require('lodash/object/get');
var eq = require('../helpers/eq.js');
var savePost = require('./save-post.js');
var serverURLs = require('../helpers/server-urls.js');

if (!global.tentversion) {
  global.tentversion = process.env.tentversion || process.env.npm_package_config_tentversion || '0.3';
}

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
    let meta;
    let savemode;
    let goodFirstServer = false;

    if (posts[0] && get(posts[0], 'json.content.servers')) {
      if (eq(posts[0].json.content.servers[0].urls, urls)) goodFirstServer = true;
      if (posts[0].json.content.servers[0].version !== global.tentversion) goodFirstServer = false;
      if (posts[0].json.content.servers[0].preference !== 0) goodFirstServer = false;
    }

    if (posts[0] && !goodFirstServer) {
      savemode = 'new_version';
      if (typeof posts[0].json === 'string') meta = JSON.parse(posts[0].json);
      else if (posts[0].json) meta = posts[0].json;
      else throw Error('Post did not have json field');
    } else if (!posts[0]) {
      savemode = 'new_post';
      meta = {
        type: 'https://tent.io/types/meta/v0',
        content: {
          //servers: [ goodserver ]
        },
        permissions: {
          'public': true
        }
      };
      meta.content.servers = [{preference: 0, urls: {bad: 'no good'}, version: '0.2'}];
    }
    //meta.content.servers = [goodserver];
    //meta.content.servers = [{preference:0,urls: {bad:'no good'}, version: '0,2'}];
    console.log('savemode: ' + savemode);
    console.log('\nmeta: ');
    console.log(JSON.stringify(meta, null, '  '));
    if (meta) yield savePost(user.id, meta, savemode, user.entity);
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
