module.exports.read = function(t, p){
  var type = t.split('#')[0];
  if (!p) return false;
  if (!type) return false;
  if (p.read && p.read.indexOf(type) >= 0) {
    return true;
  } else {
    return false;
  }
};

module.exports.write = function(t, p){
  var type = t.split('#')[0];
  if (!p) return false;
  if (!type) return false;
  if (p.write && p.write.indexOf(type) >= 0) {
    return true;
  } else {
    return false;
  }
};
