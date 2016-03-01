var isObject = function(object){
  return Object.prototype.toString.call(object) === '[object Object]';
};
var eq = function(a, b, constrain){
  'use strict';
  if (Object.is(a, b)) return true;
  for (var key in a) {
    if (!isObject(a[key]) && !Array.isArray(a[key])) {
      if (a[key] !== b[key]) return false;
    } else {
      if (constrain === true && Object.keys(a).length !== Object.keys(b).length) return false;
      if (eq(a[key], b[key]) === false) return false;
    }
  }
  return true;
};

module.exports.firstContainsSecond = function(a, b){
  return eq(a, b, false);
};
module.exports.firstMatchesSecond = function(a, b){
  return eq(a, b, true);
};
