'use strict';

const database = require('../utils/dbConnection');


const QALink = function () {
};

/**
 * Add a new question->Answer link
 * @param questionId
 * @param AnswerId
 */
QALink.add = function (questionId, AnswerId) {

    const sql = `INSERT INTO question_answer_link( question_id, answer_id ) values ( $1, $2 ) returning id`;

    return database.insertOrUpdate(sql, [questionId, AnswerId]);
};


module.exports = QALink;