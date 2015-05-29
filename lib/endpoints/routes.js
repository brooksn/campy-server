var b = '/tent';
var routes = [{
  endpoint:'new_post',
  path: b+'/new_post/:userid',
  method: 'POST',
  use: require('./new_post.js').POST
},
{
  endpoint:'posts_feed',
  path: b+'/posts_feed/:userid',
  method: 'GET',
  use: require('./posts_feed.js').GET
},
{
  endpoint:'posts_feed',
  path: b+'/posts_feed/:userid',
  method: 'HEAD',
  use: require('./posts_feed.js').HEAD
},
{
  endpoint:'post',
  path: b+'/post/:userid/:entity/:postid',
  method: 'GET',
  use: require('./post.js').GET
},
{
  endpoint:'discover',
  path: b+'/discover/:userid',
  method:'GET',
  use: require('./discover.js').GET
}];

module.exports = routes;
