'use strict';

var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');

var router = express.Router();

var question = require('../dao/question');
var answer = require('../dao/answer');
var qalink = require('../dao/question_answer_link');
var answersHelper = require('../utils/answersHelper');


/* Add another answer to an existing question */
router.post('/add', security.canEdit, function (req, res, next) {

    var questionId = sanitizer(req.body.questionid);
    var answerText = sanitizer(req.body.answer);
    var userId = req.user.id;


    answer.add(answerText, userId, function (answerId, aerror) {
            if (null == answerId) {
                res.redirect("/error");
                return;
            }
            qalink.add(questionId, answerId, function (linkId, lerror) {
                res.redirect("/question/show/" + questionId)
                return;
            })
        });
});

/* Display a form that allows to update an answer */
router.get('/edit/:answerId', security.canEdit, function (req, res, next) {
    var answerId = sanitizer(req.params.answerId);
    answer.getById(answerId, function (thisAnswer) {
        if (!failWhenUserNotPermittedToEdit(thisAnswer[0], req.user, next)) {
            question.getById(thisAnswer.question_id, function(thisQuestion){
                res.render('update-answer', {answer: thisAnswer[0], question: thisQuestion});
            });
        }
    });
});

/* Update an answer if its owner requested it */
router.post('/edit/:answerId', security.canEdit, function (req, res, next) {

    var answerText = sanitizer(req.body.answer);
    var userId = req.user.id;
    var answerId = sanitizer(req.params.answerId);

    answer.getById(answerId, function(results, error){
        if(error || results.length == 0){
            res.redirect("/error");
            return;
        }     
        var answerFromDB = results[0];
        if(!failWhenUserNotPermittedToEdit(answerFromDB, req.user, next)) {
            answer.update(answerText, answerId, function (isSuccess, aerror) {
                res.redirect("/question/show/" + answerFromDB.question_id + "#answer" + answerId);
                return;
            });
        }
    });
});

/**
 * Throws an error (using express middleware) if user was not permitted to edit an answer
 * @param answer Answer object returned by answer DAO
 * @param user User object attached to the request
 * @param next Call to invoke next middleware in the stack
 * @returns {boolean} true if an error was thrown, false if nothing happened
 */
function failWhenUserNotPermittedToEdit(answer, user, next) {
    answer = answersHelper.attachIsEditableFlag(user, answer);
    if(!answer.isEditable) {
        var error = new Error("Only admins can edit answers that don't belong to them.");
        error.status = 403;
        next(error);
        return true;
    }
    return false;
}

module.exports = router;
