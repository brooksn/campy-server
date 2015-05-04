var JSONb = require('jsonb-query-composer');
var getPermissions = function *(next){
  var permissions = null;
  var apptype = 'https://tent.io/types/app-auth/v0#';
  var appid = null;
  var refs = null;
  try {
    refs = this.hawk.credentials.json.refs;
  } catch(e){}
  if (Array.isArray(refs)) {
    for (var index = (refs.length-1); index >= 0; index-- ) {
      if (refs[index].type.substr(0, apptype.length) === apptype) {
        appid = refs[index].post;
      }
    }
  }
  if (appid !== null) {
    var typeq = JSONb('json').has({type:apptype});
    var idq = JSONb('json').has({id:appid});
    var apps = yield this.knex('posts').whereRaw(typeq).whereRaw(idq);
    if (apps && Array.isArray(apps) && apps.length > 0 && apps[0].users[0] === this.hawk.user){
      permissions = apps[0].json.content.types;
      permissions.user = apps[0].users[0]
    }
  }
  this.tentPermissions = permissions;
  yield next;
};

module.exports = function(){
  return getPermissions;
};
