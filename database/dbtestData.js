/**
 * This is a stand-alone application that inserts base data into the database
 * 
 * It assumes that the database has already been dreated
 */

// Load in the environment variables
require('dotenv').config({path:'process.env'});

var pg = require('pg');
var async = require('async');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();


var hpassword = require('crypto').createHash('sha256').update('letmein').digest('base64');

var statements = [

    "INSERT INTO users (username , password , displayName , role ) VALUES ('user1' , '" + hpassword + "' , 'User One', 0) ",
    "INSERT INTO users (username , password , displayName , role ) VALUES ('user2' , '" + hpassword + "' , 'User Two', 0) ",
    "INSERT INTO users (username , password , displayName , role ) VALUES ('user3' , '" + hpassword + "' , 'User Three', 0) ",
    "INSERT INTO users (username , password , displayName , role ) VALUES ('user4' , '" + hpassword + "' , 'User Four', 1) "

];

function doQuery(item, callback) {
    console.log("Query:" + item);
    client.query(item, function (err, result) {
        callback(err);
    })
}

async.eachSeries(statements, doQuery, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.log("All Done");
        client.end();
    }

});
