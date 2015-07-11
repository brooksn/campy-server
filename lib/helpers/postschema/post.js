module.exports = {
  id: 'post',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      format: 'uri'
    },
    content: {
      type: 'object'
    },
    version: {
      '$ref': 'version'
    },
    refs: {
      '$ref': 'ref'
    },
    mentions: {
      '$ref': 'mention'
    },
    received_at: {
      type: 'integer',
      format: 'utc-millisec'
    },
    published_at: {
      type: 'integer',
      format: 'utc-millisec'
    }
  }
};
