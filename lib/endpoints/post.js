var q = require('../helpers/postgres-queries.js');
module.exports.GET = function *(userid, entity, postid, next) {
  this.userid = Number.parseInt(userid);
  yield next;

  if (this.hawk.authorized === true && this.hawk.user === userid) {
    console.log('all OK.');
  }

  //this.response.body = "This endpoint has not yet been implemented.\n";
  var posts = yield this.knex.select('json').from('posts')
  .whereRaw(q.whereEntity(entity))
  .whereRaw(q.whereID(postid))
  .orderBy('received_at', 'DESC');
  this.response.set('Content-Type', 'application/json');
  console.log('\ngot posts: ');
  console.log(JSON.stringify(posts));
  this.response.body = JSON.stringify(posts[0].json || '');

  //if Link header, perform discovery and ensure this is the entity's 'post' endpoint.
  var link = this.request.get('Link');
  if (link) {
    var profile = yield discover(link);
    console.log('\ngot a Link from the post endpoint: ');
    console.log(JSON.stringify(profile, null, '  '));
  }
};
