var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var fs = require('fs');
var path = require('path');

exports.up = function(db, callback) {
  var filePath = path.join(__dirname + '/sqls/20160816094824-full-text-search-up.sql');
  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (err) return console.log(err);
    db.runSql(data, function(err) {
      if (err) return console.log(err);
      callback();
    });
  });
};

exports.down = function(db, callback) {
  var filePath = path.join(__dirname + '/sqls/20160816094824-full-text-search-down.sql');
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (err) return console.log(err);
    db.runSql(data, function (err) {
      if (err) return console.log(err);
      callback();
    });
  });
};