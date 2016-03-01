var http = require('http');
var server;
var start = function(opts){
  opts = opts || {};
  if (typeof opts === 'number') opts = {port: opts};
  var port = opts.port || process.env.PORT|| process.env.port || process.env.npm_package_config_port || global.port || 3000;
  global.baseurl = global.baseurl || opts.baseurl || process.env.baseurl || process.env.npm_package_config_baseurl || 'http://localhost:'+port;
  global.tentversion = process.env.tentversion || process.env.npm_package_config_tentversion || '0.3';
  var postgresversion = process.env.postgresversion || process.env.npm_package_config_postgresversion || '9.5';
  return new Promise(function(resolve, reject){
    if (!global.knex) global.knex = require('knex')({
      client: 'pg',
      connection: require('./helpers/pgconnection.js')
    });

    global.knex.raw('SELECT version()').then(function(result){
      var m = result.rows[0].version.match('PostgreSQL ' + postgresversion);
      if (!m) reject('PostgreSQL ' + postgresversion + ' is required. Installed version is:\n' + result.rows[0].version);
      var koa = require('koa');
      var mount = require('koa-mount');


      var app = koa();

      var tentServer = require('./tent-server.js');
      app.use(mount(tentServer));
      server = http.createServer(app.callback()).listen(port);
      resolve('Server started on port ' + port);
    });
  });
};

var stop = function(){
  return new Promise(function(resolve){
    server.setTimeout(0);
    console.log('stopping......');
    server.close(function(){
      global.knex.destroy(function(){
        resolve(true);
      });
    });
  });
};

module.exports.start = start;
module.exports.stop = stop;
