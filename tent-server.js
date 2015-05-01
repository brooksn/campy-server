var koa = require('koa');
var hawk = require('koa-hawk');

var app = koa();

app.use(hawk());

module.exports = app;
