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

var statements = [
    "INSERT INTO users ( displayName , role, email ) VALUES ('User One', 0, 'user1@email.com') ",
    "INSERT INTO users ( displayName , role, email ) VALUES ('User Two', 0, 'user2@email.com') ",
    "INSERT INTO users ( displayName , role, email ) VALUES ('User Three', 0, 'user3@email.com') ",
    "INSERT INTO users ( displayName , role, email ) VALUES ('User Four', 1, 'user4@email.com') ",
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
