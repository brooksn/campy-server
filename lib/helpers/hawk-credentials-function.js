var JSONb = require('jsonb-query-composer');

module.exports = function(id, callback){
  var credentials = null;

  var typestr = 'https://tent.io/types/credentials/v0#https://tent.io/types/app-auth/v0';
  var typeq = JSONb('json').has({type:typestr});
  var idq = JSONb('json').has({id:id});
  global.__knex('posts').limit(1).whereRaw(typeq).whereRaw(idq).then(function(postresults){
    if (Array.isArray(postresults) && postresults.length > 0) {
      credentials = {
        key: postresults[0].json.content.hawk_key,
        algorithm: postresults[0].json.content.hawk_algorithm,
        user: postresults[0].users[0],
        json: postresults[0].json,
        source: 'posts'
      };
      //console.log(JSON.stringify(credentials, null, '  '));
      callback(null, credentials);
    } else {
      console.log('else.');
      global.__knex('hawk_keys').limit(1).where('id', id).then(function(hawkresults){
        console.log(JSON.stringify(hawkresults, null, '  '));
        if (Array.isArray(hawkresults) && hawkresults.length > 0) {
            credentials = {
            key:hawkresults[0].key,
            algorithm: hawkresults[0].algorithm,
            user: hawkresults[0].user_id,
            source: 'hawk_keys'
          };
        }
        callback(null, credentials);
      });
    }
  });
};
