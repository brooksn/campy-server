var koa = require('koa');
var route = require('koa-route');
var JSONb = require('./jsonb-where.js');
var knex = require('koa-knex')({
  client: 'pg',
  connection: {
    host: 'localhost'
  }
});
var kickstartKnex = knex().next();
var app = koa();
app.name = 'app-server';
app.use(knex);

var routes = require('./app-routes.js');
app.use(route.get('/post/:user', routes.postGET));

module.exports = app;
