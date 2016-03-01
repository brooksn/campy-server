/*global knex*/
var test = require('tape');
var repair = require('../lib/tent/repair-all-user-meta-posts.js');
var wait = require('./utilities/wait.js');
var sortServers = require('../lib/helpers/sort-servers.js');
var discover = require('../lib/helpers/discovery-promise');
var request = require('request-promise').defaults({resolveWithFullResponse: true, simple: false});
var coTape = require('co-tape');
var clear = require('./utilities/clear-db.js');
var canonicalJSON = require('canonical-tent-json');

var server = require('../lib/server.js');
const port = 3000;
const username = 'testuser';
const entity = 'http://localhost:' + port + '/' + username;
global.baseurl = 'http://localhost:' + port;

test('retrieve a public posts feed', {skip: false}, coTape(function*(a){
  if (!global.knex) global.knex = require('knex')({
    client: 'pg',
    connection: require('../lib/helpers/pgconnection.js')
  });
  a.plan(1);
  yield clear(); //truncate all tables
  yield knex.insert({url: entity}).into('entities');
  var insertedusers = yield knex.insert({username: username, entity: entity}).into('users').returning('id');
  var inserts = [];
  var now = Date.now();
  for (var i = 0; i<22; i++) {
    var j = {
      entity: entity,
      type: 'https://tent.io/types/status/v0',
      content: { text: 'status text ' + i },
      received_at: now-400000+(i*10000)
    };
    var versionid = canonicalJSON(j).versionID();
    j.version = {id:versionid, received_at: j.received_at};
    inserts.push({
      json: j,
      received_at: new Date(j.received_at).toISOString(),
      entity: j.entity,
      type: j.type,
      version_id: versionid,
      users: insertedusers
    });
  }
  var posts = inserts.map(function(x){ return x.json });

  yield knex.insert(inserts).into('posts');
  yield repair(false);
  yield server.start(port);
  var profile = yield discover(entity);
  sortServers(profile.content.servers);
  var feedurl = profile.content.servers[0].urls.posts_feed;
  a.comment('public-feed-urls: ' + feedurl);
  var feedresponse = yield request(feedurl);
  var feed = JSON.parse(feedresponse.body);
  a.comment(JSON.stringify(feed.posts[0]));
  yield server.stop();
  yield global.knex.destroy();
  a.equal(true, true);
  a.end();
}));
