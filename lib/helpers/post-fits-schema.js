var Validator = require('jsonschema').Validator;
var postschema = require('./postschema/post.js');
var newpost = require('./postschema/new-post.js');
var mentions = require('./postschema/mentions.js');
var refs = require('./postschema/refs.js');
var version = require('./postschema/version.js');
var permissions = require('./postschema/permissions.js');
var typeschemas = {};
typeschemas['https://tent.io/types/status/v0'] = require('./postschema/status.content.v0.js');

module.exports = function(post, mode){
  var v = new Validator();
  var validatewith;
  
  switch (mode) {
    case 'new_post':
      validatewith = newpost;
      v.addSchema(newpost, '/new_post');
      break;
    default:
      break;
  }
  
  if (typeschemas[post.type]) {
    v.addSchema(typeschemas[post.type], post.type);
    validatewith.properties.content = {'$ref': post.type};
  } else {
    validatewith.properties.content = { additionalProperties: true, type: 'object' };
  }
  
  v.addSchema(mentions, '/mentions');
  v.addSchema(refs, '/refs');
  v.addSchema(permissions, '/permissions');
  v.addSchema(version, '/version');
  v.addSchema(postschema, '/post');
  

  if (!validatewith) return true;
  var result = v.validate(post, validatewith);
  if (!result.errors || !result.errors[0]) return true;
  return result;
};
