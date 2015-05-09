module.exports = function(){
  var a = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_1234567890';
  var m = a.length;
  var r = '';
  for (var i=0; i<10; i++) r+= a[Math.floor(Math.random() * m)];
  return r;
};
