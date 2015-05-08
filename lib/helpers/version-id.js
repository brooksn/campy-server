module.exports = function(thing){
  var crypto = require('crypto');
  var data;
  if (typeof thing === 'string') data = thing;
  if (typeof thing === 'object') data = JSON.stringify(thing);
  var shasum = crypto.createHash('sha512');
  shasum.update(data);
  return 'sha512t256-' + shasum.digest('hex').substr(0,64);
};
