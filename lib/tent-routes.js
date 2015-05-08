var routes = {POST:{},PUT:{},HEAD:{},GET:{},DELETE:{}};
var canonical = require('./helpers/tent-canonical-post-json.js');
var postType = require('./helpers/post-type.js');
var postFitsSchema = require('./helpers/post-fits-schema.js');
var versionID = require('./helpers/version-id.js');


routes.GET.post = function *(userid, next) {
  this.userid = Number.parseInt(userid);
  yield next;
  if (this.hawk.authorized === true && this.hawk.user === userid) {
    console.log('all OK.');
  }
  this.response.body = "This endpoint has not yet been implemented.";
};

routes.POST.new_post = function*(userid, next){
  this.userid = Number.parseInt(userid);
  if (!this.request.is('application/json')) throw Error('Content-Type must be "application/json"');
  yield next;
  var post = canonical(this.request.body);
  var type = postType(post);
  console.log(type);
  console.log('user: ' + this.hawk.user + ' vs. userid: ' + userid);
  console.log('authorized: ' + this.hawk.authorized);
  if (type.type !== 'https://tent.io/types/app/v0' && (this.hawk.authorized !== true || this.hawk.user != userid)) throw Error('Bad mac :(');
  var fits = postFitsSchema(post, 'new_post');
  if (fits.errors.length > 0) throw Error(JSON.stringify(fits.errors));
  
  var hash = versionID(post);
  if (!post.version) post.version = {};
  post.version.id = hash;
  var now = Date.now();
  post.version.received_at = now;
  post.version.published_at = now;
  post.received_at = now;
  post.published_at = now;
  var prettypost = JSON.stringify(post);
  //yield replaceEntitiesWithIDs(post);
  //yield this.Knex();
  this.response.body = prettypost;
};

routes.GET.hello = function*(next){
  this.response.body = "hello!\n";
};

module.exports = routes;
