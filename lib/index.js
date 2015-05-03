var port = process.env.PORT|| process.env.port || process.env.npm_package_config_port || 3000;
var koa = require('koa');
var mount = require('koa-mount');
var tentServer = require('./tent-server.js');

var app = koa();
app.use(mount(tentServer));

app.listen(port);
console.log('Server started on port ' + port);
