module.exports = {
  id: 'version',
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    published_at: {
      type: 'integer',
      format: 'utc-millisec'
    },
    received_at: {
      type: 'integer',
      format: 'utc-millisec'
    },
    parents: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          version: {
            type: 'string',
            required: true
          },
          post: {
            type: 'string'
          },
          entity: {
            type: 'string',
            format: 'uri'
          },
          original_entity: {
            type: 'string',
            format: 'uri'
          }
        }
      }
    }
  }
};
