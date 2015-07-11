var test = require('tape');
var eq = require('../lib/helpers/eq.js');
var aa = {};
var b = {};
var c = {b: 'foo', a: 'bar'};
var d = {a: 'bar', b: 'foo'};
var e = {a: [{x:[1,2,3]}], b: 14};
var f = {b: 7*2, a: [{x:[1,2,3]}]};
var g = {a: [{x:[1,2,3]}], b: 14};
var h = {b: 14, a: [{x:[3,2,1]}]};

test('eq helper', function(a){
  a.plan(4);
  a.ok(eq(aa, b), 'aa should equal b');
  a.ok(eq(c, d), 'c should equal d');
  a.ok(eq(e, f), 'e should equal f');
  a.notOk(eq(g, h), 'g should not equal h');
  a.end();
});
