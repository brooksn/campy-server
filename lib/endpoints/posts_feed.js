var postType = require('../helpers/post-type.js');
var co = require('co');

//var queries = require('../helpers/postgres-queries.js');
//var JSONb = require('jsonb-query-composer');

var getPostReferences = co.wrap(function*(refs, max){
  'use strict';
  var queries = [];
  var posts = [];
  if (max-- > 0) {
    for (let index in refs) {
      queries.push(queries.getPost(refs[index]));
    }
    posts = yield Promise.all(queries);
    for (let index in posts) {
      var childrefs = yield better(posts[index].refs, max);
      posts = posts.concat(childrefs);
    }
  }
  return posts;
});

var posts_feed = function(method){
  var gen = function*(userid, next){
    this.userid = Number.parseInt(userid);
    console.log(this.userid +" + " + userid);
    yield next;

    var query = global.knex.select('json').from('posts').whereRaw(this.userid + ' = ANY(users)');
    if (this.hawk.authorized !== true || this.hawk.user != this.userid) {
      this.userEntity = yield queries.entityUrlFromUserID(this.userid);
      query.whereRaw(' json @> \'{"permissions":{"public":true}}\' AND json @> \'{"entity":"' + this.userEntity + '"}\' ');
    }
    var limit = 10;
    var direction = 'ASC';
    var orderby = "json->>'entity'";
    var where = {};
    var conditions = {
      refs: 0
    };
    for (var key in this.query) {
      switch(key) {
        case 'limit':
          //limit == this.query[key];
          break;
        case 'max_refs':
          conditions.refs = this.query[key];
          break;
        case 'sort_by':
          break;
        case 'since':
          break;
        case 'until':
          break;
        case 'before':
          break;
        case 'entities':
          if (typeof this.query[key] === 'string') where[key] = this.query[key].split(',');
          else where[key] = this.query[key];
          break;
        case 'types':
          var types;
          if (typeof this.query[key] === 'string') types = this.query[key].split(',');
          else types = this.query[key];
          where[key] = [];
          for (var t in types){
            //where[key].push(postType)
          }
          break;
        case 'mentions':
          //mentions=https://example.tent.is postid, https://example.com
        case 'profiles':
          if (this.query[key] === true) conditions.profiles = true;
          break;
      }
    }
    query.orderByRaw(orderby + ' ' + direction);
    var responseEnvelope = {};
    var sql = query.toSQL();
    console.log(sql);
    responseEnvelope.posts = yield query.map(function(result){ return result.json; });
    if (conditions.refs > 0){
      responseEnvelope.refs = yield getPostReferences(posts, conditions.refs);
    }
    //always new-old unless otherwise specified
    //pages are sent most-to-least recent
    //"since" parameter reverses the paging, such that the oldest page is returned first. Oldest is still bottom post.
    //var posts = yield global.knex('posts').select('json').where(where).orderBy(orderby, direction).limit(limit);
    this.response.body = JSON.stringify(responseEnvelope);
  };
  return gen;
};

module.exports.GET = posts_feed('GET');

module.exports.HEAD = posts_feed('HEAD');
