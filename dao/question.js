'use strict';

const database = require('../utils/dbConnection');

const Question = function () {
};

/**
 * Add a new question
 * @param question
 * @param userId
 */
Question.add = function (question, userId) {

    const sql = `INSERT INTO question (text, userid, ti) values ( $1 , $2, to_tsvector('english',$1)) returning id`;
    const params = [question, userId];

    return database.insertOrUpdate(sql,params)
        .then(result=>{
            return result.rows[0].id;
        });
};

/**
 * Get a question using its ID
 * @param id ID of the question
 */
Question.getById = function (id) {
    const sql = `SELECT q.*, u.displayname, u.email from question q 
        LEFT OUTER JOIN users u on u.id=q.userid
        WHERE q.id=$1`;

    return database.query(sql,[id])
        .then(results=>{
            if (results.length !== 1) {
                return null;
            } else {
                return results[0];
            }
        });
};

/**
 * Get all the questions
 */
Question.getAll = function () {
    return database.getAllFromTable('question');
};

/**
 * Get all the questions sorted alphabetically (ignoring the letter case)
 */
Question.getAllByAlphabet = function () {
    const sql = `SELECT * FROM question ORDER by LOWER(text) ASC`;

    return database.query( sql, null);
};

/**
 * Get all the questions sorted by the time of the last answer (descending)
 */
Question.getAllByLatestAnswerTime = function () {
    const sql = `
        SELECT q.*, MAX(a.created) AS latest_answer_date FROM answer a
        INNER JOIN question_answer_link qal ON qal.answer_id=a.id 
        INNER JOIN question q ON qal.question_id=q.id 
        GROUP BY q.id
        ORDER BY latest_answer_date DESC`;

    return database.query( sql, null);
};

/**
 * Perform a full text search using the supplied terms
 * @param terms
 * @param done
 */
Question.search = function (terms, done) {
    const sql = `
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
    `;


    return database.query(sql, [terms]);
};

/**
 * Perform a full text search using the supplied terms
 * @param terms
 */
Question.fullQASearch = function (terms) {
    const sql = `
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

    return database.query(sql,[terms]);
};

/**
 * Delete a question
 * @param questionId
 */
Question.delete = function( questionId) {
    return database.deleteByIds('question', [questionId]);
};

module.exports = Question;