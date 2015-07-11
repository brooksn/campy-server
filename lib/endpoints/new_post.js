var postType = require('../helpers/post-type.js');
var savePost = require('../tent/save-post.js');
var queries = require('../helpers/postgres-queries.js');
//var notifyFollowers = require('../notify-followers.js');
var strangerlimit = 10000;


module.exports.POST = function*(userid, next){
  this.userid = Number.parseInt(userid);
  var apptype = 'https://tent.io/types/app/v0';
  if (!this.request.is('application/json')) throw Error('Content-Type must be "application/json"');
  yield next;
  console.log('new post. ' + userid);
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
  console.log('e: ');
  console.log(entity);
  if (!entity) {
    this.response.status = 404;
    this.response.body = 'User not found.';
    return;
  }

  console.log('user entity: ' + entity);
  //post.entity = entity;

  if (type.url === apptype) {
    var bewitURL = require('../tent/bewit-url.js');
    //Generate post of type https://tent.io/types/credentials/v0#https://tent.io/types/app/v0
    //which mentions savedpost
    //Set the Link header to a bewit URL for this post
    var credsdraft = require('./credentials-constructor.js')();
    credsdraft.entity = entity;
    credsdraft.permissions = {
      public: false
    };
    credsdraft.type = 'https://tent.io/types/credentials/v0#https://tent.io/types/app/v0';
    var credspost = yield savePost(userid, credsdraft, 'new_post');
    if (!post.mentions || !Array.isArray(post.mentions)) post.mentions = [];
    post.mentions.push({post: credspost.id, public: false, type: 'https://tent.io/types/credentials/v0#'});
    var baseurl = global.campyurl + '/post/' + encodeURIComponent(entity) + '/' + credspost.id;
    var bewit = yield bewitURL(userid, baseurl);
    this.response.set('Link', bewit.url);
  }

  try {
    var savedpost = yield savePost(this.userid, post, 'new_post', entity);
  } catch(e){
    if (credspost && credspost.id) {
      //delete credspost
    }
    throw e;
  }
  console.log('\nsavedpost: ' + typeof savedpost);
  console.log(savedpost);
  //notifyFollowers(savedpost);
  this.response.body = savedpost;
};
