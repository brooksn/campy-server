module.exports = {
  id: 'permissions',
  type: 'object',
  properties: {
    public: {
      type: 'boolean'
    },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          post: {
            type: 'string',
            required: true
          }
        }
      }
    },
    entities: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri'
      }
    }
  }
};
