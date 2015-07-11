module.exports = {
  id: 'refs',
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
