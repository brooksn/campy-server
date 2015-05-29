var postType = require('../helpers/post-type.js');
var savePost = require('../save-post.js');
var queries = require('../helpers/postgres-queries.js');
var notifyFollowers = require('../notify-followers.js');
var strangerlimit = 10000;


module.exports.POST = function*(userid, next){
  this.userid = Number.parseInt(userid);
  var apptype = 'https://tent.io/types/app/v0';
  if (!this.request.is('application/json')) throw Error('Content-Type must be "application/json"');
  yield next;

  var post = this.request.body;
  if (!post.type) throw Error('No "type" field in the post');
  var type = postType(post);

  if (type.url === apptype) {
    if (this.hawk.authorized !== true){
      var danger = global.strangerdanger;
      global.strangerdanger = Date.now();
      if (typeof danger === 'number' && Date.now()-danger <= strangerlimit) throw Error('Calm down');
    }
  } else if (this.hawk.authorized !== true || this.hawk.user != this.userid || !this.can.write(apptype)) {
    global.strangerdanger = Date.now();
    throw Error('Bad mac :(');
  }

  var entity = yield queries.userEntity(this.userid);
  post.entity = entity;
  var savedpost = yield savePost(this.userid, post, 'new_post');
  //notifyFollowers(savedpost);
  this.response.body = savedpost;
};
