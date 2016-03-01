module.exports = function(obj){
  var mess = require('mess');
  mess(obj);
  return obj.sort(function(a,b){
    return (a.preference+1) - (b.preference+1);
  });
};
