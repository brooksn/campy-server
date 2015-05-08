var thunkify = require('thunkify-wrap');
var discover = thunkify(require('tent-discover'));
var co = require('co');
var dance = co.wrap(function*(entity){
  var profile = null;
  try {
    var result = yield discover(entity);
    var profile = result[0].post;
  } catch(e) {}
  return profile;
});

module.exports = dance;
