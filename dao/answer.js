'use strict';

const database = require('../utils/dbConnection')

const Answer = function () {
};

/**
 * Add a new answer
 * @param Answer text to add
 * @param done Function to call when complete
 */
Answer.add = function (answer, userId) {

    const sql = `INSERT INTO answer ( text, userId, ti ) values ( $1 , $2 , to_tsvector('english',$1) ) returning id`;

    return database.insertOrUpdate(sql, [answer,userId])
        .then(result=>{
            return result.rows[0].id;
        });
};

/**
 * Update an answer
 * 
 * @param {string} text - Text to update
 * @param {integer} answerId - ID of the answer to update
 */
Answer.update = function (text, answerId) {
    const sql = `UPDATE answer
        SET text=$1 , ti=to_tsvector('english',$1)         
        WHERE id=$2`;

    return database.insertOrUpdate(sql, [text,answerId]);
};

/**
 * Get an answer using its ID
 * the results also contain question_id of the corresponding question
 * @param {integer} id Identifier of the answer
 */
Answer.getById = function (id){
    const sql = `SELECT a.*, qal.question_id FROM answer AS a         
        JOIN question_answer_link qal ON qal.answer_id=a.id
        WHERE a.id=$1`;

    return database.query( sql, [id]);
};

/**
 * Get a question using its ID
 * @param id ID of the question
 */
Answer.getForQuestionId = function (id) {
    const sql = `select a.*, u.displayname, u.email from answer a 
        join question_answer_link qal on qal.answer_id=a.id 
        left outer join users u on u.id=a.userid 
        where qal.question_id=$1`;

    return database.query( sql, [id]);
};

/**
 * Perform a full text search using the supplied terms
 * @param terms
 */
Answer.search = function (terms) {
    const sql = "SELECT id,text from answer where ti @@ to_tsquery($1)";
    return database.query(sql, [terms]);
};

/**
 *
 * @param answerId
 */
Answer.delete = function( answerId) {

    return database.deleteByIds('answer', [answerId]);
};

module.exports = Answer;