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
Question.add = function (question, userId, done) {

    var sql = "INSERT INTO question (text, userid, ti) values ( $1 , $2, to_tsvector('english',$1)) returning id";
    var params = [question, userId];

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
    var sql = "SELECT q.*, u.displayname, u.email from question q " + 
        "LEFT OUTER JOIN users u on u.id=q.userid " +
        "WHERE q.id=$1";

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
 * Get all the questions sorted alphabetically (ignoring the letter case)
 */
Question.getAllByAlphabet = function (done) {
    var sql = `
        SELECT * FROM question
        ORDER by LOWER(text) ASC`;
        
    dbhelper.query(sql, null,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
    });
}
/**
 * Get all the questions sorted by the time of the last answer (descending)
 * @param done function to call with the results
 */
Question.getAllByLatestAnswerTime = function (done) {
    var sql = `
        SELECT q.*, MAX(a.created) AS latest_answer_date FROM answer a
        INNER JOIN question_answer_link qal ON qal.answer_id=a.id 
        INNER JOIN question q ON qal.question_id=q.id 
        GROUP BY q.id
        ORDER BY latest_answer_date DESC`;
        
    dbhelper.query(sql, null,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
    });
};

/**
 * Perform a full text search using the supplied terms
 * @param terms
 * @param done
 */
Question.search = function (terms, done) {
    var sql = `
    WITH document AS (
        SELECT q.id AS ques_id, 
            q.text AS ques_text, 
            to_tsvector('english', q.text) || 
            to_tsvector(COALESCE(u.displayname, '')) AS question_search_results
            FROM question q
            LEFT OUTER JOIN users u ON u.id = q.userid
    ),
    ranked_results AS (
        SELECT ques_id, ques_text, document, 
            ts_rank(document.question_search_results, to_tsquery('english', $1))*100 AS rank 
            FROM document 
            ORDER BY rank DESC
    )
    SELECT ques_id, ques_text, round(rank::numeric, 2) as rank FROM ranked_results
    WHERE ranked_results.rank>0;
    `
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
    var sql = `
    WITH document AS (
        -- answer_search_results column uses question text + answer text + name of the author 
        SELECT q.id AS ques_id, 
            a.id AS ans_id, 
            q.text AS ques_text,
            to_tsvector('english', q.text) || 
            to_tsvector('english', a.text) || 
            to_tsvector(COALESCE(u.displayname, '')) AS answer_search_results
            FROM answer a
            INNER JOIN question_answer_link qal ON qal.answer_id=a.id 
            INNER JOIN question q ON qal.question_id=q.id 
            LEFT OUTER JOIN users u ON u.id = a.userid
        ),
        ranked_results AS (
            SELECT ans_id, ques_id, ques_text, document, 
                ts_rank(document.answer_search_results, to_tsquery('english', $1))*100 AS rank 
                FROM document 
                ORDER BY rank DESC
        )
    SELECT ans_id, ques_id, ques_text, round(rank::numeric, 2) AS rank
    FROM ranked_results
    WHERE ranked_results.rank>0;`;

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