var postType = require('../helpers/post-type.js');
var co = require('co');
var get = require('lodash/object/get');
var queries = require('../helpers/postgres-queries.js');
//var JSONb = require('jsonb-query-composer');

var getPostReferences = co.wrap(function*(refs, max){
  'use strict';
  //TODO: this. looks important.
  return [];
});

var posts_feed = function(method){
  'use strict';
  //TODO: public column on posts table
  var gen = function*(userid, next){
    this.userid = Number.parseInt(userid);
    console.log(this.userid +" + " + userid);
    yield next;
    if (!this.hawk.user || this.hawk.user != this.userid) this.authorized = false;
    var postsquery = global.knex.select('json').from('posts').whereRaw(this.userid + ' = ANY(users)');
    if (this.authorized) {
      this.userEntity = yield queries.entityUrlFromUserID(this.userid);
      postsquery.whereRaw(' json @> \'{"permissions":{"public":true}}\' AND json @> \'{"entity":"' + this.userEntity + '"}\' ');
    }
    var limit = 10;
    var max_refs = 0;
    var direction = 'ASC';
    var postgresdirection = 'ASC';
    var orderby = "json->>'entity'";
    orderby = 'received_at';
    var where = {};
    var conditions = {
      refs: 0
    };
    //max_refs
    if (this.query.max_refs && Number.isInteger(this.query.max_refs) && this.query.max_refs > 0) max_refs = this.query.max_refs;

    //sort_by
    if (this.query.since && this.query.until) throw Error(`The request may contain both "since" and "until" parameters.`);

    var sort_by = 'received_at';
    var since = Number.parseInt(this.query.since);
    var until = Number.parseInt(this.query.until);
    if (this.query.since && typeof Number.isInteger(since)) var sinceunixts = this.query.since;
    if (this.query.until && typeof Number.isInteger(until)) var untilunixts = this.query.until;
    var sinceraw = false;
    var untilraw = false;
    switch (this.query.sort_by) {
      case 'received_at':
        sort_by = this.query.sort_by;
        if (sinceunixts) sinceraw = ` received_at > '${new Date(sinceunixts).toISOString()}'`;
        if (untilunixts) untilraw = ` received_at > '${new Date(untilunixts).toISOString()}'`;
        break;
      case 'published_at':
        sort_by = this.query.sort_by;
        if (sinceunixts) sinceraw = ` json #> '{version}' > '${sinceunixts}'`;
        if (untilunixts) untilraw = ` json #> '{version}' > '${untilunixts}'`;
        break;
      case 'version.received_at':
        sort_by = this.query.sort_by;
        if (sinceunixts) sinceraw = ` json #> '{version,received_at}' > '${sinceunixts}'`;
        if (untilunixts) untilraw = ` json #> '{version,received_at}' < '${untilunixts}'`;
        break;
      case 'version.published_at':
        sort_by = this.query.sort_by;
        postsquery.orderByRaw(` json #> '{version,published_at}' > '${sinceunixts}'`);
        //if (sinceunixts) sinceraw = ` json #> '{version,published_at}' > '${sinceunixts}'`;
        if (sinceunixts) postsquery.andWhereRaw(` json #> '{version,published_at}' > '${sinceunixts}'`);
        else if (untilunixts) untilraw = ` json #> '{version,published_at}' > '${untilunixts}'`;
        break;
      default:
        sort_by = 'received_at';
    }
    
    //since
    if (this.query.since && Number.isInteger(this.query.since)) {
      postgresdirection = 'ASC';
      postsquery.orderByRaw(` ${sort_by} ${postgresdirection}`);
      if (sinceraw !== false) postsquery.whereRaw(sinceraw);
    }
    //until
    else if (this.query.until && Number.isInteger(this.query.until) ) {
      postsquery.orderByRaw(` ${sort_by} ${postgresdirection}`);
      if (untilraw !== false) postsquery.whereRaw(untilraw);
    }
    else {
      postsquery.orderByRaw(` ${sort_by} ${postgresdirection}`);
    }

    //feed posts limit
    if (this.query.limit && Number.isInteger(this.query.limit)) limit = this.query.limit;

    //feed post types
    if (this.query.types) {
      let types = [];
      if (Array.isArray(this.query.types)) types = this.query.types;
      else if (typeof this.query.types === 'string') types.push(this.query.types);
      for (let i of types) {
        let t = postType(types[i]);
        if (this.can.read(t.url) !== true) throw Error('This app is not authorized to read posts of type ' + t.url);
        if (t.url && t.fragment) {
          if (i === 0) postsquery.whereRaw(` (type='${t.url}' AND fragment='${t.fragment}')`);
          else postsquery.orWhereRaw(` (type='${t.url}' AND fragment='${t.fragment}')`);
        }
        else if (t.url) {
          if (i === 0) postsquery.whereRaw(` (type='${t.url}')`);
          else postsquery.orWhereRaw(` (type='${t.url}')`);
        }
      }
    }
    
    //feed entities
    if (this.query.entities) {
      if (this.authorized !== true) throw Error(`Only the public feed of ${this.userEntity} is available to unauthorized apps. Other entities may not be requested.`);
      if (typeof this.query.entites === 'string') postsquery.where('entity', this.query.entities);
      else if (Array.isArray(this.query.entities)) postsquery.whereIn('entity', this.query.entities);
    }

    //feed posts mention
    if (this.query.mentions) {
      //
    }
/*
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
*/
    postsquery.orderByRaw(orderby + ' ' + direction);
    var responseEnvelope = {};
    var sql = postsquery.toSQL();
    console.log(sql);
    responseEnvelope.posts = yield postsquery.map(function(result){ return result.json; });
    //posts from the sql postsquery may be sorted for search convenience
    //but must be delivered new-on-top
    responseEnvelope.posts.sort(function(a, b){ return get(a, sort_by) - get(b, sort_by); });
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
