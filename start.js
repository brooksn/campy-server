var server = require('./lib/server.js');
server.start().then(function(result){
  console.log(result);
}).catch(function(reason){
  console.error(reason);
});
