var co = require('co');
var q = {};
var knex = global.knex;

q.allEntities = co.wrap(function*(entity){
  var previous = yield knex.select('previous_entities').from('entities').where('url', entity).limit(1);
  var r = [entity];
  try {
    if (previous[0].previous_entities.length >= 1) r = r.concat(previous[0].previous_entities);
  } catch(e){
    //there are no previous_entities
  }
  return r;
});

q.userEntity = co.wrap(function*(userid){
  var result = yield knex.select('entity').from('users').where('id', userid).limit(1);
  console.log('result: ');
  console.log(result);
  try {
    return result[0].entity;
  } catch(e) {
    return null;
  }
});

q.whereEntity = function(entity){ return `json @> '{"entity":"${entity}"}'`; };
q.whereID = function(id){ return `json @> '{"id":"${id}"}'`; };

q.getPost = co.wrap(function*(post, entity){
  var id;
  if (!entity && post.entity) entity = post.entity;
  if (typeof post === 'string') id = post;
  else if (post.id) id = post.id;
  if (!id || !entity) return;
  var where1 = `json @> '{"entity":"${entity}"}'`;
  var where2 = `json @> '{"id":"${id}"}'`;
  var results = yield knex.select('json').from('posts').whereRaw(where1).whereRaw(where2).limit(1);
  return JSON.parse(results[0].json);
});

q.entityUrlFromUserID = function(userid){
  return new Promise(function(resolve, reject){
    knex.select('entity').from('users').where('id', Number.parseInt(userid)).then(function(results){
      resolve(results[0].entity);
    }).catch(function(reason){
      reject(reason);
    });
  });
};

q.profilesCredentialsSubscribedToType = co.wrap(function*(posttype){
  /**
   * 1. get subscriptions
   * 2. get relationship
   * 3. get credentials
   * 4. get meta post
   */
  var subs = yield knex.select('json').from('posts').where({});
  var r = 'https://tent.io/types/relationship';
  var len = r.length;
  var relqueries = subs.map(function(sub){
    for (var i in sub.mentions){
      if (sub.mentions[i].type.substr(0, len) === r){
        return knex.select('json').from('posts').where({});
      }
    } return;
  });
  var relposts = yield Promise.all(relqueries);
  var result = {};
  for (var i in relposts) {
    result[relposts[i].entity] = {relationship: relposts[i]};
  }
  var metaqueries = relposts.map(function(rel){

  });
  var metaposts = yield Promise.all(metaqueries);
});

module.exports = q;
