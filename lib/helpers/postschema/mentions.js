module.exports = {
  id: 'mentions',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      post: {
        type: 'string'
      },
      entity: {
        type: 'string',
        format: 'uri'
      },
      version: {
        type: 'string'
      },
      public: {
        type: 'boolean'
      },
      type: {
        type: 'string',
        format: 'uri'
      },
      original_entity: {
        type: 'string',
        format: 'uri'
      }
    }
  }
};
