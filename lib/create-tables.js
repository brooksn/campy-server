var fs = require('fs');
var co = require('co');
var postgresversion = process.env.postgresversion || process.env.npm_package_config_postgresversion || '9.5';
var duplicate_object_code = 42710;

if (!global.knex) global.knex = require('knex')({
  client: 'pg',
  connection: require('./helpers/pgconnection.js')
});

var maketypes = fs.readFileSync(__dirname + '/../createpgtypes', 'utf8');
var maketables = fs.readFileSync(__dirname + '/../createpgtables', 'utf8');

module.exports = co.wrap(function*(){
  var vres = yield global.knex.raw('SELECT version()');
  var m = vres.rows[0].version.match('PostgreSQL ' + postgresversion);
  if (!m) throw Error('PostgreSQL ' + postgresversion + ' is required.');

  try {
    yield global.knex.raw(maketypes);
  } catch(e){
    if (e.code != duplicate_object_code) {
      console.log('failed to create types');
      throw Error(e);
    }
  }
  try {
    yield global.knex.raw(maketables);
    //global.knex.destroy();
  } catch(e) {
    //global.knex.destroy();
    console.log('failed to create tables');
    throw Error(e);
  }
});
