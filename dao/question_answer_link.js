var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var QALink = function () {
};

/**
 * Add a new question->Answer link
 * @param QuestionId
 * @param AnswerId
 * @param done Function to call when complete
 */
QALink.add = function (questionId, AnswerId, done) {

    var sql = "INSERT INTO question_answer_link( question_id, answer_id ) values ( $1, $2 ) returning id";
    var params = [questionId, AnswerId];

    dbhelper.insert(sql, params,
        function (result) {
            done(result.rows[0].id, null);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};


module.exports = QALink;