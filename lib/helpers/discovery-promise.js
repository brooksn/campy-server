var discover = require('tent-discover');
module.exports = function(entity){
  return new Promise(function(resolve, reject){
    discover(entity, function(err, profile){
      if (err) {
        reject(err);
      } else {
        resolve(profile);
      }
    });
  });
};
