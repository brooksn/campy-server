var koa = require('koa');
var permissions = require('./hawk-permissions.js');
var route = require('koa-route');
var hawk = require('koa-hawk');
var JSONb = require('./jsonb-where.js');
var pgconnection = require('./helpers/pgconnection.js');
var knex = require('koa-knex')({
  client: 'pg',
  connection: pgconnection
});
var kickstartKnex = knex().next();
var app = koa();
app.use(function*(next){
  var start = Date.now();
  yield next;
  var delta = Math.ceil(Date.now() - start);
  console.log('DELTA: ' + delta);
  this.set('X-Response-Time', delta + 'ms');
});
app.name = 'tent-server';
app.use(knex);

var hawkGetCredentialsWithID = function(id, callback){
  var credentials = null;

  var typestr = 'https://tent.io/types/credentials/v0#https://tent.io/types/app-auth/v0';
  var typeq = JSONb('json').has({type:typestr});
  var idq = JSONb('json').has({id:id});
  global.__knex('posts').limit(1).whereRaw(typeq).whereRaw(idq).then(function(postresults){
    if (Array.isArray(postresults) && postresults.length > 0) {
      console.log('if');
      console.log(JSON.stringify(postresults, null, '  '));
      credentials = {
        key: postresults[0].json.content.hawk_key,
        algorithm: postresults[0].json.content.hawk_algorithm,
        user: postresults[0].users[0],
        json: postresults[0].json,
        source: 'posts'
      };
      callback(null, credentials);
    } else {
      console.log('else.');
      global.__knex('hawk_keys').limit(1).where('id', id).then(function(hawkresults){
        console.log(JSON.stringify(hawkresults, null, '  '));
        if (Array.isArray(hawkresults) && hawkresults.length > 0) {
            credentials = {
            key:hawkresults[0].key,
            algorithm: hawkresults[0].algorithm,
            user: hawkresults[0].user_id,
            source: 'hawk_keys'
          }
        }
        callback(null, credentials);
      });
    }
  });
};

app.use(hawk(hawkGetCredentialsWithID));
app.use(permissions());

app.use(function*(next){
  yield next;
});

var routes = require('./tent-routes.js');
app.use(route.get('/post/:userid', routes.postGET));

module.exports = app;
