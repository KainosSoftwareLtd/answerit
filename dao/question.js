'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Question = function () {
};

/**
 * Add a new question
 * @param Question text to add
 * @param done Function to call when complete
 */
Question.add = function (question, done) {

    var sql = "INSERT INTO question (text,ti) values ( $1 , to_tsvector('english',$1)) returning id";
    var params = [question];

    dbhelper.insert(sql, params,
        function (result) {
            done(result.rows[0].id, null);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

/**
 * Get a question using its ID
 * @param id ID of the question
 * @param done Function to call with the results
 */
Question.getById = function (id, done) {
    var sql = "SELECT * from question where id=$1";

    var params = [id];
    dbhelper.query(sql, params,
        function (results) {
            if (results.length != 1) {
                done(null);
            } else {
                done(results[0]);
            }
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

/**
 * Get all the questions
 * @param done function to call with the results
 */
Question.getAll = function (done) {
    dbhelper.getAllFromTable("question", done);
}

/**
 * Perform a full text search using the supplied terms
 * @param terms
 * @param done
 */
Question.search = function (terms, done) {
    var sql = "SELECT id,text from question where ti @@ to_tsquery($1)";

    var params = [terms];
    dbhelper.query(sql, params,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

/**
 * Perform a full text search using the supplied terms
 * @param terms
 * @param done
 */
Question.fullQASearch = function (terms, done) {
    var sql = "select  q.id, q.text as question, count(a.id) as answer " +
                "from answer a " +
                "inner join question_answer_link qal on qal.answer_id=a.id " +
                "inner join question q on qal.question_id=q.id " +
                "where a.ti @@ to_tsquery($1) or q.ti @@ to_tsquery($1) " +
                "group by q.id, q.text " +
                "order by answer desc";

    var params = [terms];
    dbhelper.query(sql, params,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

/**
 * Delete a question
 * @param answerId
 * @param done
 */
Question.delete = function( questionId, done) {
    var params = [questionId];

    var sql = "DELETE FROM question WHERE id = $1";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(false, error);
        });
}

module.exports = Question;