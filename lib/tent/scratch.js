/*global knex*/
var co = require('co');

global.knex = require('knex')({
  client: 'pg',
  connection: require('./helpers/pgconnection.js')
});


co(function*(){
  'use strict';
  try{
    var r = yield knex('posts').insert({
      json: JSON.stringify({foo: 1, bar: 2}),
      //entity: 'https://brooks.cupcake.is',
      version_id: 'dummy478rwhfs9a',
      type: 'sometype'
    });
  } catch(e){
    console.log(e.code);
  }
  try{
    let userid = 15;
    let v = 'fakepost2';
    //v = 'sha512t256-c66683480c36a4afc50907a0a46162acf07dcde9fcdadc0b50daba83742ba3fa';
    let q = `UPDATE posts SET users = users || ${userid} WHERE "version_id" = '${v}' AND NOT (${userid} = ANY (users))`;
    var g = yield global.knex.raw(q);
    console.log('\nq: ');
    console.log(g);
  } catch(e) {
    console.log('err here');
    console.log(e);
  }
  console.log(r);

  console.log(`let's insert a text array`);
  let rslt = yield knex('entities').insert({
    url: 'dummyURL',
    previous_entities: ['hello', 'world']
  });
  console.log('rslt is: ');
  console.log(rslt);
  knex.destroy();
  return;
});

//SELECT posts.json, json_object_agg(test_mentions.entity, test_mentions.mentions_post) as mentions FROM posts, test_mentions WHERE test_mentions.post = posts.version_id GROUP BY posts.json LIMIT 11
//WHERE json -> 'refs' @> '[{"type":"https://tent.io/types/appa/v0#"}]'
//WHERE json -> 'entity' @> '"https://indy24.cupcake.is"'
//WHERE json -> 'mentions' @> '[{"entity":"https://brooks.tent.is"}]'
//WHERE json -> 'entity' ?| array['https://brooks.cupcake.is']
//SELECT previous_entities FROM entities WHERE "url" = 'https://brooks.cupcake.is' LIMIT 1
