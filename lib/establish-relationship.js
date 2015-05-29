var url = require('url');
var co = require('co');
var uriReplace = require('./helpers/uri-replace.js');
var queries = require('./helpers/postgres-queries.js');
var request = require('co-request');
var bewitURL = require('./bewit-url.js');
var genID = require('./helpers/gen-id.js');
var savePost = require('./save-post.js');
var discover = require('./helpers/discovery-dance.js');
var thunkify = require('thunkify');
var credsConstructor = require('./credentials-constructor.js');
var notifyFollowers = require('./notify-followers.js');

var pipeRequest = function (readable, requestThunk){
  return function(cb){
    readable.pipe(requestThunk(cb));
  };
};

var establishRelationship = function*(userid, target){
  var myentity;
  if (typeof userid === 'number' || userid.length < 4) {
    myentity = yield queries.userEntity(userid);
  } else {
    myentity = userid;
  }
  console.log('myentity: ' + myentity);
  
  // 1. The initiating server performs discovery on the target entity, and selects a server.
  
  var profile = yield discover(target);
  console.log('profile');
  console.log(profile);
  
  // 2. The initiating server creates a new, private, relationship post that
  //    mentions the target entity. The notification for this post
  //    is not delivered yet.
  
  var reldraft = {
    entity: myentity,
    mentions: [ { entity: target } ],
    permissions: {
      entities: [ target ],
      public: false
    },
    type: 'https://tent.io/types/relationship/v0#initial'
  };
  console.log('\nreldraft:\n');
  console.log(reldraft);
  var relpost = yield savePost(userid, reldraft, 'new_post');
  console.log('\nrelpost');
  console.log(relpost);
  
  // 3. The initiating server creates a new credentials post that mentions the
  //    relationship post created in the previous step and contains credentials
  //    that the target server will use to communicate with the initiator.
  
  var credsdraft = credsConstructor();
  credsdraft.entity = myentity;
  credsdraft.mentions = [{
    entity: relpost.entity,
    post: relpost.id,
    type: relpost.type,
    version: relpost.version.id
  }];
  credsdraft.permissions = {
    entities: [ target ],
    public: false
  };
  var credspost = yield savePost(userid, credsdraft, 'new_post');
  console.log('\ncredspost\n');
  console.log(credspost);
  
  // 4. The initiating server sends the relationship post via the post endpoint on the target server.
  //    Include a Link header containing a one-time use signed link to the previously created credentials post
  //    with a rel of https://tent.io/rels/credentials.
  
  var baseurl = global.tenturl + '/post/' + encodeURIComponent(myentity) + '/' + credspost.id;
  var bewit = yield bewitURL(userid, baseurl);
  console.log('\nBewit:\n');
  console.log(bewit);
  //var postendpt = uriReplace(profile.content.servers[0].urls.post, {});
  var postendpt = profile.content.servers[0].urls.new_post;
  postendpt = profile.content.servers[0].urls.post;
  postendpt = postendpt.replace('{entity}', encodeURIComponent(myentity));
  postendpt = postendpt.replace('{post}', relpost.id);
  //postendpt = profile.content.servers[0].urls.new_post;
  //delete relpost.version;
  console.log('postendpt: ' + postendpt);
  //return;
  var relresponse = yield request({
    uri: postendpt,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/vnd.tent.post.v0+json; type="'+relpost.type+'"',
      'Link': bewit.url
    },
    body: JSON.stringify(relpost)
  });
  console.log('\nrelresponse\n');
  console.log(relresponse.statusCode);
  var fs = require('fs');
  console.log(JSON.stringify(relresponse));
  fs.writeFileSync('../relresponse.json', JSON.stringify(relresponse));
  
  // 5.  The target server performs discovery, and must match the 'post' endpoint with the bewit url.
  // 6.  The target server retrieves the credentials post from my bewit Link and imports it into its post feed.
  // 7.  The target server, armed with its permanent credentials, retrieves the referenced relationship post.
  // 8.  The target server creates a relationship post mentioning my relationship post.
  // 9.  The target server creates a credentials post mentioning its new relationsip post.
  // 10. The target server returns a 200 OK response with a Link header bewit link to that new credentials post.
  
  if (relresponse.statusCode !== 200) throw Error('Target server should return a 200 OK response.');
  if (!relresponse.Link) throw Error('Targer server response should include Link header.');
  
  // 11. The initiating server retrieves the provided credentials post and persists it to its feed.
  
  var link = url.parse(relresponse.Link);
  if (!link.protocol || !link.host)
  link = url.parse(profile.servers[0].urls.post).href + link.href;
  var credsresponse = yield request({
    uri: link
  });
  var mycredspost = yield savePost(credsresponse);
  
  // 12. The initiating server creates a new version of the relationship post that it published in step two
  //     that has a type of https://tent.io/types/relationship/v0#, mentions the relationship post created on the target server
  //     (this mention replaces the entity mention), and has the desired permissions.
  
  relpost.mentions = [{
    entity: target,
    post: credsresponse.id
  }];
  relpost.type = 'https://tent.io/types/relationship/v0#';
  var revisedrelpost = yield savePost(relpost);
  //notifyFollowers(revisedrelpost);
};

module.exports = co.wrap(establishRelationship);
