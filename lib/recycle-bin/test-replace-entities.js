var replace = require('./replace-entities-with-ids.js');
var co = require('co');

//var ids = replace({type:'mytype', entity: 'https://brooks.cupcake.is'});
co(function*(){
  var start = Date.now();
  yield replace({type:'mytype', entity: 'https://brooks.cupcake.is'});
  var delta = Math.ceil(Date.now() - start);
  console.log('∆: ' + delta);
  return;
});
//console.log(ids);
