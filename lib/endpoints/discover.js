var postType = require('../helpers/post-type.js');
var discover = require('../helpers/discovery-dance.js');

module.exports.GET = function*(userid, next){
  this.userid = Number.parseInt(userid);
  yield next;

  if (this.hawk.authorized !== true) throw Error ('Bad mac :(');
  var entity = this.query.entity;
  if (!entity) throw Error('entity query is required.');
  var profile = yield discover(entity);
  var metatype = 'https://tent.io/types/meta';
  if (profile.type.substr(0,metatype.length) !== metatype) {
    profile = {};
  } else {
    try{
      var type = postType(profile);
      yield this.knex('posts').insert({
        json: profile,
        version_id: profile.version.id,
        type: type.url,
        fragment: type.fragment
      });
    } catch(e) {}
  }
  this.response.body = JSON.stringify(profile);
};
