var pgconnection = require('./helpers/pgconnection.js');
var k = {
  client: 'pg',
  connection: pgconnection
};

var knex = global.__knex || require('knex')(k);

var createEntities = function(){
  return new Promise(function(resolve, reject){
    return knex.schema.hasTable('entities').then(function(exists){
      if (!exists) {
        return knex.schema.createTable('entities', function(table){
          table.increments('id').primary();
          table.text('url');
          table.specificType('previous_entities', 'text[]');
          table.timestamps();
        }).then(function(result){
          setTimeout(function(){
            console.log('entities created');
            resolve();
          }, 100);
        });
      } else {
        setTimeout(function(){
          console.log('entities exists');
          resolve();
        }, 100);
      }
    });
  });
};

var createUsers = function(){
  return new Promise(function(resolve, reject){
    return knex.schema.hasTable('users').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('users', function (table) {
          table.increments('id').primary();
          table.text('username');
          table.text('password');
          table.integer('entity').references('id').inTable('entities').onDelete('Set NULL').onUpdate('CASCADE');
          table.timestamps();
        }).then(function(result){
          setTimeout(function(){
            console.log('users created');
            resolve();
          }, 100);
        });
      } else {
        setTimeout(function(){
          console.log('users exists');
          resolve();
        }, 100);
      }
    });
  });
};

var createHawkKeys = function(){
  return new Promise(function(resolve, reject){
    return knex.schema.hasTable('hawk_keys').then(function(exists){
      if (!exists) {
        return knex.schema.createTable('hawk_keys', function(table){
          table.text('id').primary();
          table.text('key');
          table.text('algorithm');
          table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
        }).then(function(result){
          setTimeout(function(){
            console.log('hawk_keys created');
            resolve();
          }, 100);
        });
      } else {
        setTimeout(function(){
          console.log('hawk_keys exists');
          resolve();
        }, 100);
      }
    });
  });
};

var createPosts = function(){
  return new Promise(function(resolve, reject){
    return knex.schema.hasTable('posts').then(function(exists){
      if (!exists) {
        return knex.schema.createTable('posts', function(table){
          table.text('index').primary();
          table.json('json', true);
          table.text('version_id').unique();
          table.specificType('users', 'integer[]');
        }).then(function(result){
          setTimeout(function(){
            console.log('posts created');
            resolve();
          }, 100);
        });
      } else {
        setTimeout(function(){
          console.log('posts exists');
          resolve();
        }, 100);
      }
    });
  });
};

var createAttachments = function(){
  return new Promise(function(resolve, reject){
    return knex.schema.hasTable('attachments').then(function(exists){
      if (!exists) {
        return knex.schema.createTable('attachments', function(table){
          table.text('index').primary();
          table.text('filename');
          table.text('data_type');
          table.specificType('data', 'blob');
          table.timestamps();
        }).then(function(result){
          setTimeout(function(){
            console.log('dummy created');
            resolve();
          }, 100);
        });
      } else {
        setTimeout(function(){
          console.log('dummy exists');
          resolve();
        }, 100);
      }
    });
  });
};

var run = function(){
  return new Promise(function(resolve, reject){
    createEntities()
    .then(createUsers)
    .then(createHawkKeys)
    .then(createPosts)
    //.then(createAttachments)
    .then(knex.destroy)
    .then(resolve);
  });
};

module.exports = run;
