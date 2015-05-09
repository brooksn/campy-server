var routes = {POST:{},PUT:{},HEAD:{},GET:{},DELETE:{}};
var canonical = require('./helpers/tent-canonical-post-json.js');
var postType = require('./helpers/post-type.js');
var postFitsSchema = require('./helpers/post-fits-schema.js');
var versionID = require('./helpers/version-id.js');
var queries = require('./helpers/postgres-queries.js');
var genID = require('./helpers/generate-post-id.js');
var discover = require('./helpers/discovery-dance.js');
var strangerlimit = 20000;

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
  var post = this.request.body;
  if (!post.type) throw Error('No "type" field in the post');
  var type = postType(post);
  
  if (type.url === 'https://tent.io/types/app/v0') {
    if (this.hawk.authorized !== true){
      var danger = global.strangerdanger;
      global.strangerdanger = Date.now();
      if (typeof danger === 'number' && Date.now()-danger <= strangerlimit) throw Error('Calm down');
    }
  } else if (this.hawk.authorized !== true || this.hawk.user != this.userid) {
    global.strangerdanger = Date.now();
    throw Error('Bad mac :(');
  }
  
  var entity = yield queries.userEntity(this.userid);
  post.entity = entity;
  post.id = genID();
  var canonicalpost = canonical(post);
  var hash = versionID(canonicalpost);

  var fits = postFitsSchema(post, 'new_post');
  if (fits.errors.length > 0) throw Error(JSON.stringify(fits.errors));
  
  if (!post.version) post.version = {};
  post.version.id = hash;
  post.received_at = Date.now();
  post.version.received_at = post.received_at;
  var prettypost = JSON.stringify(post);
  var result = yield this.knex('posts').insert({
    json:prettypost,
    version_id:hash,
    users:[Number.parseInt(userid)],
    type:type.url,
    fragment:type.fragment
  });
  this.response.body = prettypost;
};

routes.GET.discover = function*(userid, next){
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

routes.GET.hello = function*(next){
  this.response.body = "hello!\n";
};

module.exports = routes;
