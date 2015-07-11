var createTables = require('./lib/create-tables.js');

createTables()
.then(function(){
  if(global.knex) global.knex.destroy();
})
.catch(function(){
  if (global.knex) global.knex.destroy();
});
