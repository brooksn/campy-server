var koa = require('koa');
var bodyParser = require('koa-body-parser');
var fs = require('fs');
var permissions = require('./tent/hawk-permissions.js');
var route = require('koa-route');
var hawk = require('koa-hawk');
var discoverable = require('./tent/discoverable.js');

if (!global.knex) global.knex = require('knex')({
  client: 'pg',
  connection: require('./helpers/pgconnection.js')
});

try{
  fs.mkdirSync('./attachments');
} catch(e){
  if (e.code !== 'EEXIST') throw Error(e);
}

var app = koa();
app.name = 'tent-server';
app.use(function*(next){
  var start = Date.now();
  yield next;
  var delta = Math.ceil(Date.now() - start);
  console.log('∆: ' + delta);
  this.set('X-Response-Time', delta + 'ms');
});
app.use(bodyParser());
var hawkGetCredentialsWithID = require('./helpers/hawk-credentials-function.js');

app.use(hawk(hawkGetCredentialsWithID));
app.use(permissions());
app.use(discoverable);

var routes = require('./endpoints/routes.js');

for (var r of routes) {
  switch(r.method) {
    case 'GET':
      app.use(route.get(r.path, r.use));
      break;
    case 'POST':
      app.use(route.post(r.path, r.use));
      break;
    case 'HEAD':
      app.use(route.head(r.path, r.use));
      break;
  }
}
app.use(route.get('hello', function*(next){
  console.log('hello!!!');
  this.response.body = 'Hello world!';
  yield next;
}));

app.use(route.get('/testrel/:userid/:target', function*(userid, target, next){
  yield next;
  var estrel = require('./tent/establish-relationship.js');
  try {
    if (typeof userid !== 'number') userid = Number.parseInt(userid);
    var result = yield estrel(userid, target);
    console.log('h.');
    console.log(result);
  } catch(e){
    console.log(e);
  }
}));

//todo: check tombstones
//todo: check delivery failures

module.exports = app;
