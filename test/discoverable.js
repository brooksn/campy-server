/*global knex*/
var test = require('tape');
var repair = require('../lib/tent/repair-all-user-meta-posts.js');
var wait = require('./utilities/wait.js');
var discover = require('../lib/helpers/discovery-promise');
var request = require('request-promise').defaults({resolveWithFullResponse: true, simple: false});
var coTape = require('co-tape');
var clear = require('./utilities/clear-db.js');

if (!global.knex) global.knex = require('knex')({
  client: 'pg',
  connection: require('./helpers/pgconnection.js')
});

var server = require('../lib/server.js');

test('discovery', coTape(function*(a){
  yield clear(); //truncate all tables
  a.plan(1);
  const port = 3000;
  const username = 'testuser';
  const entity = 'http://localhost:' + port + '/' + username;
  yield knex.insert({url: entity}).into('entities');
  yield knex.insert({username: username, entity: entity}).into('users');
  yield repair(false);
  yield server.start(port);
  var profile = yield discover(entity);
  a.equal(profile.type, 'https://tent.io/types/meta/v0');

  return test('meta post', function(b){
    b.plan(1);
    var i = 'hello';
    b.equal('hello', i);
    server.stop();
  });

}));
