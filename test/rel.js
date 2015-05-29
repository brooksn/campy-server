var rel = require('../lib/establish-relationship.js');
rel(3, '').then(function(x){
  console.log('then...');
  console.log(x);
}).catch(function(y){
  console.log('catch...');
  console.log(y);
});
