var miner = function(data){
  var query = null;
  var value = null;
  var mine = data;
  var properties = [];
  var firstprop = true;
  var counter = 0;

  while (typeof mine === 'object') {
    if (counter++ > 10) break;
    firstprop = true;
    for (var prop in mine){
      if (firstprop === true) {
        firstprop = false;
        properties.push(prop);
      }
      if (typeof mine[prop] === 'string' || typeof mine[prop] === 'number') {
        value = mine[prop];
      }
      mine = mine[prop];
    }
  }
  if (value !== null && properties.length > 0) {
    query = {field: '{'+properties.join(',')+'}', value: value};
  }
  return query;
};

var JSONb = function(column){
  this.column = column;
  this.where = [];
};

JSONb.prototype.col = function(column){
  this.column = column;
  return this;
};

JSONb.prototype.has = function(json){
  if (typeof json === 'object') this.where.push({condition:'has', field:JSON.stringify(json)});
  return this;
};

JSONb.prototype.greater = function(data){
  var mine = miner(data);
  if (mine !== null) {
    mine.condition = 'greater';
    this.where.push(mine);
  }
  return this;
};


JSONb.prototype.less = function(data){
  var mine = miner(data);
  if (mine !== null) {
    mine.condition = 'less';
    this.where.push(mine);
  }
  return this;
};

JSONb.prototype.combine = function(){
  var query = '';
  for (var parameter of this.where) {
    switch (parameter.condition) {
      case 'less':
        query += `${this.column} #> '${parameter.field}' < '${parameter.value}'`;
        break;
      case 'greater':
        query += `${this.column} #> '${parameter.field}' > '${parameter.value}'`;
        break;
      case 'equal':
        query += `${this.column} #> '${parameter.field}' = ${parameter.value}`;
        break;
      case 'has':
        query += `${this.column} @> '${parameter.field}'`;
        break;
    }
    query += ' ';
  }
  return query;
};

JSONb.prototype.c = function(){
  return this.combine();
};

JSONb.prototype.toString = function(){
  return this.combine();
};

module.exports = function(column){
  return new JSONb(column);
};
