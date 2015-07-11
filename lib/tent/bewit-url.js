var url = require('url');
var genID = require('../helpers/gen-id.js');
var Hawk = require('hawk');

var bewitURL = function(userid, uri, credentials, seconds){
  var time = seconds || 40000;
  var u = url.parse(uri);
  if (!u.protocol) throw Error('The uri was badly formed.');
  var fullurl = u.href;
  fullurl += u.query ? '&' : '?';
  fullurl += 'bewit=';
  if (!credentials || !credentials.id || !credentials.key || !credentials.algorithm) {
    credentials = {
      id: genID(),
      key: genID(20),
      algorithm: 'sha256',
      user_id: userid
    };
  }
  var bewit = Hawk.uri.getBewit(fullurl, {
    credentials: credentials,
    ttlSec: time
  });
  fullurl += bewit;
  return new Promise(function(resolve, reject){
    global.knex('hawk_keys').insert(credentials).then(function(result){
      resolve({
        url: fullurl,
        credentials: credentials
      });
    }).catch(function(err){
      reject(err);
    });
  });
};

module.exports = bewitURL;
