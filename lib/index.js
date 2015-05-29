var port = process.env.PORT|| process.env.port || process.env.npm_package_config_port || 3000;
var pgconnection = require('./helpers/pgconnection.js');
var knex = require('koa-knex')({
  client: 'pg',
  connection: pgconnection
});
var kickstartKnex = knex().next();
var pgcreate = require('./create-postgres-tables.js');
var koa = require('koa');
var mount = require('koa-mount');
var tentServer = require('./tent-server.js');

var app = koa();

pgcreate().then(function(){
  app.use(mount(tentServer));
  app.listen(port);
  console.log('Server started on port ' + port);
});
