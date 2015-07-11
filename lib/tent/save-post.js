/*global knex*/
var co = require('co');
var get = require('lodash/object/get');
var pgUniqueViolationCode = 23505;
var discover = require('../helpers/discovery-promise.js');
var postType = require('../helpers/post-type.js');
var genID = require('../helpers/gen-id.js');
var postFitsSchema = require('../helpers/post-fits-schema.js');
var canonical = require('canonical-tent-json');
var queries = require('../helpers/postgres-queries.js');
var modes = {
  new: 'new_post',
  update: 'new_version',
  notify: 'notification'
};

var verifyMetaPost = co.wrap(function*(post){
  //get the post. discover the entity. compare posts. reject mismatch or error.
  var profile = yield discover(post.entity);
  if (profile.entity !== post.entity) throw Error('Meta post could not be verified. Entities did not match.');
  if (profile.content.previous_entities !== post.content.previous_entities) throw Error('Meta post could not be verified. previous_entities did not match.');
  return profile;
});

var arrayHasEQ = function(array, ob){
  var eq = require('../helpers/eq.js');
  var match = false;
  for (var i in array){
    if (eq(array[i], ob)) match = true;
  }
  return match;
};

var arrayOfReferences = function(post){
  'use strict';
  var reftypes = {ref: 'ref', mention: 'mention', parent: 'parent', permission: 'permission'};
  let references = [];
  let urls = new Set();
  if (post.mentions && Array.isArray(post.mentions)) {
    for (let m in post.mentions) {
      if (post.mentions[m].entity) {
        urls.add(post.mentions[m].entity);
        let mention = {
          version_id: post.version.id,
          public: true,
          reftype: reftypes.mention,
          entity: post.mentions[m].entity
        };
        if (post.mentions[m].post) mention.mentions_post = post.mentions[m].post;
        if (post.mentions[m].version) mention.mentions_version_id = post.mentions[m].version;
        if (post.mentions[m].public === false) mention.public = false;
        if (!arrayHasEQ(references, mention)) references.push(mention);
      }
    }
  }
  if (post.references && Array.isArray(post.references)) {
    for (let r in post.refs) {
      if (post.refs[r].entity) {
        urls.add(post.refs[r].entity);
        let ref = {
          version_id: post.version.id,
          reftype: reftypes.ref,
          entity: post.refs[r].entity
        };
        if (post.refs[r].post) ref.mentions_post = post.refs[r].post;
        if (post.refs[r].version) ref.mentions_version_id = post.refs[r].version;
        if (!arrayHasEQ(references, ref)) references.push(ref);
      }
    }
  }
  if (post.version && post.version.parents && Array.isArray(post.version.parents)) {
    for (let p in post.version.parents) {
      if (post.version.parents[p].entity) {
        urls.add(post.version.parents[p].entity);
        let parent = {
          version_id: post.version.id,
          reftype: reftypes.parent,
          entity: post.version.parents[p].entity
        };
        if (post.version.parents[p].post) parent.post = post.version.parents[p].post;
        if (!arrayHasEQ(references, parent)) references.push(parent);
      }
    }
  }
  let urlarray = [];
  for (let u of urls) {
    urlarray.push(u);
  }
  return {rows: references, entities: urlarray};
};

var overwriteMetaPostServers = function(userid, post){
  'use strict';
  var serverURLs = require('../helpers/server-urls.js');
  var eq = require('../helpers/eq.js');
  var urls = serverURLs(userid);
  var goodserver = {
    urls: urls,
    preference: 0,
    version: global.tentversion
  };
  var indexOfGoodServer = -1;
  if (get(post, 'content.servers[0]')) {
    for (let i in post.content.servers) {
      console.log('\nfor i is ' + i + ':');
      console.log(JSON.stringify(post.content.servers[i], null, '  '));
      if (post.content.servers[i].urls && eq(post.content.servers[i], goodserver)) {
        indexOfGoodServer = i;
        console.log('good server has index: ' + i);
        break;
      } else { console.log('server was not good for i = ' + i); }
    }
    if (indexOfGoodServer === 0) {
      post.content.servers[0] = goodserver;
    } else if (indexOfGoodServer > 0) {
      post.content.servers.splice(indexOfGoodServer, 1);
      post.content.servers.unshift(goodserver);
    } else {
      post.content.servers.unshift(goodserver);
    }
  } else if(post.content) {
    post.content.servers = [ goodserver ];
  } else {
    post.content = {
      servers: [ goodserver ]
    };
  }
  return post;
};

var updateEntity = co.wrap(function*(post, from, profile){
  'use strict';
  if (!profile) profile = yield discover(post.entity);
  if (!profile.content && !profile.content.previous_entities) {
    throw Error(`Discovery was performed on ${post.entity} and the previous_entities field was not found.`);
  }
  let previousExists = false;
  for (var url of profile.content.previous_entities) {
    if (url === from) previousExists = true;
  }
  if (previousExists === true){
    //let's update the entity and append the old url.
    let existing = yield knex.select('previous_entities').from('entities').where('url', from);
    if (existing.length === 0) {
      yield knex('entities').insert({
        url: post.entity,
        previous_entities: [from]
      });
    } else {
      let previousStore = existing[0].previous_entities;
      if (previousStore.indexOf(from) < 0) previousStore.push(from);
      yield knex('entities').where('url', from).update({
        url: post.entity,
        previous_entities: previousStore
      });
    }
  }
});

var updateVersionParents = function(post){
  'use strict';
  let oldversion = {};
  if (!post.version) post.version = {};
  if (!post.version.parents) post.version.parents = [];
  oldversion = { version: post.version.id };
  post.version.parents.unshift(oldversion);
};

var savePost = function*(userid, post, mode, from, transaction){
  'use strict';
  if (typeof userid === 'object' && userid.userid) {
    post = post || userid.post;
    mode = mode || userid.mode;
    from = from || userid.from;
    transaction = transaction || userid.transaction;
    userid = userid.userid;
  }
  var now = Date.now();
  if (from && typeof from === 'number') {
    from = yield queries.userEntity(this.userid);
  }
  if (!from && post.entity && typeof post.entity === 'string') from = post.entity;
  if (!from) throw Error('Pass an entity URL or user id to save-post.js');
  var existingversionid;
  if (post.version && post.version.id) existingversionid = post.version.id;
  var type = postType(post);
  if (mode === modes.new) {
    post.id = genID();
    //var fits = postFitsSchema(post, modes.new);
    //if (fits !== true) throw Error(fits.errors);
    if (!post.version) post.version = {};
    post.received_at = now;
    post.version.received_at = now;
    if (!post.version.published_at) post.version.published_at = now;
    if (!post.published_at) post.published_at = now;
  }
  if (mode === modes.update) updateVersionParents(post);

  if (type.url === 'https://tent.io/types/meta/v0' && (mode === modes.update || mode === modes.new)) {
    overwriteMetaPostServers(userid, post);
  }

  if (!post.received_at) post.received_at = now;
  if (!post.entity) post.entity = from;
  var canonicalpost = canonical(post);
  var hash = canonicalpost.versionID();
  if (mode === modes.notify && existingversionid && existingversionid !== hash)
  throw Error(`The supplied version ID was ${existingversionid}, expected ${hash}`);
  post.version.id = hash;

  if (mode === modes.notify && post.type === 'https://tent.io/types/meta/v0') {
    var profile = yield verifyMetaPost(post);
    if (!profile) throw Error('Meta post could not be verified.');
  }
  if (mode === modes.notify && post.entity && post.entity !== from) {
    yield updateEntity(post, from, profile);
  } else {
    //something about entities and adding missing rows
    try{
      knex('entities').insert({url: from});
    } catch(e){
      //pgUniqueViolationCode
    }
  }
  let references = arrayOfReferences(post);
  let rows = references.rows;
  console.log('\nreferences:');
  console.log(JSON.stringify(references));

  for (var u in references.entities) {
    try {
      global.knex('entities').insert('url', references.entities[u]);
    } catch(e){
      console.log(e);
    }
  }

  var prettypost = JSON.stringify(post);
  var transactions = [];
  transactions.push(function(trx){
    var rawupsert = `insert into "posts" ("entity", "json", "users", "version_id", "received_at", "type", "fragment") values ('${post.entity}', '${prettypost}', '{"${userid}"}', '${post.version.id}', '${new Date().toISOString()}', '${type.url}', '${type.fragment}') ON CONFLICT ON CONSTRAINT "posts_version_id_key" DO UPDATE SET users = posts.users || ${userid} WHERE NOT (${userid} = ANY (posts.users))`;
    return global.knex.raw(rawupsert).transacting(trx);
  });
  if (rows && rows.length > 0) {
    transactions.push(function(trx){
      return global.knex('references').insert(rows).transacting(trx);
    });
  }

  if (transaction === true) {
    return transactions;
  } else {
    var p = Promise.resolve();
    global.knex.transaction(function(trx){
      for (var t in transactions) {
        p = p.then(transactions[t].bind(null, trx));
      }
      p = p.then(trx.commit).catch(trx.rollback);
    });
  }

  return post;
};

module.exports = co.wrap(savePost);
