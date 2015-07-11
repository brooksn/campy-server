module.exports = {
  id: 'new_post',
  type: 'object',
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
      format: 'uri'
    },
    content: {
      additionalProperties: true,
      type: 'object'
    },
    version: {
      '$ref': 'version'
    },
    refs: {
      '$ref': 'refs'
    },
    mentions: {
      '$ref': 'mentions'
    },
    permissions: {
      '$ref': 'permissions'
    }
  },
  require: [ 'type' ]
};
