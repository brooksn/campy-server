var isObject = function(object){
  return Object.prototype.toString.call(object) === '[object Object]';
};
var eq = function(a, b){
  if (Object.is(a, b)) return true;
  for (var key in a) {
    if (!isObject(a[key]) && !Array.isArray(a[key])) {
      if (a[key] !== b[key]) return false;
    } else if (eq(a[key], b[key]) === false) return false;
  }
  return true;
};

module.exports = eq;
