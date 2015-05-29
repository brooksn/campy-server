var Validator = require('jsonschema').Validator;

module.exports = function(post, schema){
  var v = new Validator();
  var newpost = {
    id: '/new_post',
    type: 'object',
    received_at: 'number',
    properties: {
      type: {
        type: 'string'
      },
      required: ['type']
    }
  };

  v.addSchema(newpost, '/new_post');
  return v.validate(post, schema);
};
