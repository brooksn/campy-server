var util = require('util');
var koa = require('koa');
var route = require('koa-route');
var hawk = require('koa-hawk');
var JSONb = require('./jsonb-where.js');
var knex = require('koa-knex')({
	client: 'pg',
	connection: {
		host: 'localhost'
	}
});
var kickstartKnex = knex().next();
var app = koa();
app.name = 'tent-server';
app.use(knex);

var hawkGetCredentialsWithID = function(id, callback){
  var q = JSONb('post').has({id:id});
	global.__knex('json_data').whereRaw(q).then(function(results){
    var result = results;
    if (Array.isArray(results)){
      result = results[0];
    }
    callback(null, {
      key:result.hawk_key,
      algorithm: result.algorithm
    });
  });
};

app.use(hawk());

var routes = require('./tent-routes.js');
app.use(route.get('/post/:user', routes.postGET));

module.exports = app;
