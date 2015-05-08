var koa = require('koa');
var bodyParser = require('koa-body-parser');
var fs = require('fs');
var permissions = require('./hawk-permissions.js');
var route = require('koa-route');
var hawk = require('koa-hawk');
var pgconnection = require('./helpers/pgconnection.js');
var knex = require('koa-knex')({
  client: 'pg',
  connection: pgconnection
});
var kickstartKnex = knex().next();
try{
  fs.mkdirSync('./attachments');
} catch(e){}

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
app.use(bodyParser());
var hawkGetCredentialsWithID = require('./helpers/hawk-credentials-function.js');

app.use(hawk(hawkGetCredentialsWithID));
app.use(permissions());

app.use(function*(next){
  yield next;
});

var routes = require('./tent-routes.js');
app.use(route.get('/post/:userid', routes.GET.post));
app.use(route.post('/new_post/:userid', routes.POST.new_post));
app.use(route.get('/hello', routes.GET.hello));

module.exports = app;
