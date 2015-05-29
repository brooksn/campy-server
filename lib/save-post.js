var co = require('co');
var postType = require('./helpers/post-type.js');
var genID = require('./helpers/gen-id.js');
var postFitsSchema = require('./helpers/post-fits-schema.js');
var canonical = require('./helpers/tent-canonical-post-json.js');
var versionID = require('./helpers/version-id.js');

var savePost = function*(userid, post, mode){
  'use strict';
  var now = Date.now();
  var type = postType(post);
  if (mode === 'new_post') {
    post.id = genID();
    var fits = postFitsSchema(post, 'new_post');
    if (fits.errors.length > 0) throw Error(fits.errors);
    if (!post.version) post.version = {};
    post.received_at = now;
    post.version.received_at = now;
    if (!post.version.published_at) post.version.published_at = now;
    if (!post.published_at) post.published_at = now;
  }
  if (mode === 'new_version') {
    let oldversion = {};
    if (!post.version) post.version = {};
    if (!post.version.parents) post.version.parents = [];
    oldversion = { version: post.version.id };
    post.version.parents.unshift(oldversion);
  }
  if (!post.received_at) post.received_at = now;
  
  var canonicalpost = canonical(post);
  var hash = versionID(canonicalpost);
  if (mode === 'new_post' || mode === 'new_version' || mode !== false) post.version.id = hash;
  
  var prettypost = JSON.stringify(post);
  var result = yield global.__knex('posts').insert({
    json:prettypost,
    version_id: post.version.id,
    users:[userid],
    received_at: new Date().toISOString(),
    type:type.url,
    fragment:type.fragment
  });
  return post;
};

module.exports = co.wrap(savePost);
