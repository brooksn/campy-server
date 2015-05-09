var dance = require('./discovery-dance.js');
var co = require('co');
var profile = dance('https://brooks.cupcake.is').then(function(profile){
  console.log(profile);
});
