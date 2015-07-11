/*global knex*/
var discoverable = function*(next){
  yield next;
  if (this.hawk.authorized) return;
  var url = this.request.href;
  if (url.substr(-1) === '/') url = url.substr(0, url.length-1);
  var ent = require('../helpers/postgres-queries.js').whereEntity;
  var users = yield knex.select('*').from('users').where('entity', url).limit(1);
  if (users.length === 0) return;
  var posts = yield knex.select('json').from('posts')
  .where('type', 'https://tent.io/types/meta/v0')
  .whereRaw(ent(url)).limit(1).orderBy('received_at', 'DESC');
  if (posts.length === 0) return;
  var link = '</tent/post/' + users[0].id + '/';
  link +=encodeURIComponent(url) + '/';
  link += posts[0].json.id;
  link +='>; rel="https://tent.io/rels/meta-post"';
  this.response.set('Link', link);
  if (!this.response.body) {
    this.response.body = `<html>
  <head>
    <link href="https://mytent.example.com/posts/aaf43" rel="https://tent.io/rels/meta-post"/>
  </head>
  <body>
    ${link}
  </body>
</html>`;
  }
};

module.exports = discoverable;
