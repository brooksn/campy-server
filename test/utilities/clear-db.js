/*global knex*/
var co = require('co');
if (!global.knex) global.knex = require('knex')({
  client: 'pg',
  connection: require('../../lib/helpers/pgconnection.js')
});
var createTables = require('../../lib/create-tables.js');

module.exports = co.wrap(function*(){
  yield createTables();
  try{
    yield knex.raw('truncate table "attachments" cascade');
    yield knex.raw('truncate table "references" cascade');
    yield knex.raw('truncate table "posts" cascade');
    yield knex.raw('truncate table "hawk_keys" cascade');
    yield knex.raw('truncate table "users" cascade');
    yield knex.raw('truncate table "entities" cascade');
    return true;
  } catch(e) {
    console.log(e);
    return e;
  }
});
