var co = require('co');
var pgconnection = require('./pgconnection.js');
var dance = require('./discovery-dance.js');
var knex = require('knex')({
  client: 'pg',
  connection: pgconnection
});

var Knex = knex;
var replace = co.wrap(function*(post){

  var urls = new Set();
  if (post.entity) urls.add(post.entity);
  if (post.mentions) {
    for (var m of post.mentions) urls.add(m.entity);
  }
  if (post.refs) {
    for (var r of post.refs) urls.add(r.entity);
  }
  if (post.permissions) {
    for (var p of post.permissions) urls.add(p.entity);
  }
  if (post.versions) {
    for (var index in v) {
      if (v[index].entity) urls.add(v[index].entity);
    }
  }
  var u = [];
  urls.forEach(function(x){
    u.push(x);
  });
  u.push('https://tjreo.cupcake.is');
  u.push('https://indy24.cupcake.is');
  u.push('https://arturovm.cupcake.is');
  u.push('https://tenkabuto.cupcake.is');
  u.push('https://jonathan.cupcake.is');
  console.log(u);

  var indices;
  try {
    indices = yield Knex('entities').whereIn('url', u).select('id', 'url')
  } catch(e){ return; }
  console.log('indices: ');
  console.log(indices);
  var missing = [];
  var has = [];
  indices.map(function(x){
    has.push(x.url);
  });
  for (var i in u) {
    if (has.indexOf(u[i]) < 0) missing.push(u[i]);
  }
  console.log(missing);
  var discoveries = missing.map(dance);
  var addendum;
  try{
    var complete
    if (has.length > 0) complete = yield Promise.all(discoveries)
    if (complete && complete.length > 0) {
      var insertions = complete.map(function(x){
        return {url:x.entity};
      });
    }
    var results = yield Knex('entities').insert(insertions).returning('id','url');
    addendum = results.map(function(x){
      return {id:x}
    });
    for (var i in insertions){
      addendum[i].url = insertions[i].url;
    }
    console.log('addendum: ');
    console.log(addendum);
  } catch(e) { console.log(e); }
  var urlmap;
  if (addendum && addendum.length > 0) {
    urlmap = indices.concat(addendum);
  } else {
    urlmap = indices;
  }
  var id = function(entity){
    for (var i in urlmap) {
      if (urlmap[i].entity === entity) return urlmap[i].id;
    }
    return;
  };
  if (post.entity) post.entity = id(post.entity);
  if (post.mentions) {
    for (var i in post.mentions){
      post.mentions[i].entity = id(post.mentions[i].entity);
    }
  }
  if (post.refs) {
    for (var i in post.refs){
      post.refs[i].entity = id(post.refs[i].entity);
    }
  }
  if (post.permissions) {
    for (var i in post.permissions){
      post.permissions[i].entity = id(post.permissions[i].entity);
    }
  }
  return;
});

module.exports = replace;
