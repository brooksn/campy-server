var koa = require('koa');
global.tenturl = 'http://localhost:3000/tent';
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
} catch(e){
  if (e.code !== 'EEXIST') throw Error(e);
}

var app = koa();
app.use(function*(next){
  var start = Date.now();
  yield next;
  var delta = Math.ceil(Date.now() - start);
  console.log('∆: ' + delta);
  this.set('X-Response-Time', delta + 'ms');
});
app.name = 'tent-server';
app.use(knex);
app.use(bodyParser());
var hawkGetCredentialsWithID = require('./helpers/hawk-credentials-function.js');

app.use(hawk(hawkGetCredentialsWithID));
app.use(permissions());

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

app.use(function*(next){
  yield next;
  if (this.hawk.authorized) return;
  var url = this.request.href;
  if (url.substr(-1) === '/') url = url.substr(0, url.length-1);
  var ent = require('./helpers/postgres-queries.js').whereEntity;
  var users = yield this.knex.select('*').from('users').where('entity', url).limit(1);
  if (users.length === 0) return;
  var posts = yield this.knex.select('json').from('posts')
  .where('type', 'https://tent.io/types/meta/v0')
  .whereRaw(ent(url)).limit(1).orderBy('received_at', 'DESC');
  if (posts.length === 0) return;
  var link = '</tent/post/' + users[0].id + '/';
  link +=encodeURIComponent(url) + '/';
  link += posts[0].json.id;
  link +='>; rel="https://tent.io/rels/meta-post"';
  this.response.set('Link', link);
});

var repair = require('./helpers/repair-all-user-meta-posts.js');
repair();

app.use(route.get('/testrel/:userid/:target', function*(userid, target, next){
  yield next;
  var r = require('./establish-relationship.js')
  try {
    if (typeof userid !== 'number') userid = Number.parseInt(userid);
    console.log('target is: ' + target);
    var result = yield r(userid, target);
    console.log(result);
  } catch(e){
    console.log(e);
  }
}));

//todo: check tombstones
//todo: check delivery failures

module.exports = app;
