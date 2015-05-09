var co = require('co');
var q = {};
var knex = global.__knex;

q.allEntities = co.wrap(function*(entity){
  var previous = yield knex.select('previous_entities').from('entities').where('url',entity).limit(1);
  var r = [entity];
  try {
    if (previous[0].previous_entities.length >= 1) r = r.concat(previous[0].previous_entities);
  } catch(e){}
  return r;
});

q.userEntity = co.wrap(function*(userid){
  var result = yield knex.select('entity').from('users').where('id',userid).limit(1);
  try {
    return result[0].entity;
  } catch(e) {
    return null;
  }
});

module.exports = q;
