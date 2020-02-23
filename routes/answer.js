'use strict';
const logger = require('./winstonLogger')(module);

const express = require('express');
const security = require('../utils/security');
const sanitizer = require('sanitize-html');

const router = express.Router();

const question = require('../dao/question');
const answer = require('../dao/answer');
const qaLink = require('../dao/question_answer_link');

const answersHelper = require('../utils/answersHelper');


/* Add another answer to an existing question */
router.post('/add', security.canEdit, function (req, res, next) {

    const questionId = sanitizer(req.body.questionid);
    const answerText = sanitizer(req.body.answer);
    const userId = req.user.id;

    answer.add(answerText, userId)
        .then(answerId => {
            if (null == answerId) {
                res.redirect("/error");
            } else {
                qaLink.add(questionId, answerId)
                    .then(linkId => res.redirect("/question/show/" + questionId))
                    .catch(error => handleAnswerError(res, error));
            }
        });
});

/* Display a form that allows to update an answer */
router.get('/edit/:answerId', security.canEdit, function (req, res, next) {
    const answerId = sanitizer(req.params.answerId);
    answer.getById(answerId)
        .then(thisAnswer => {
            if (!failWhenUserNotPermittedToEdit(thisAnswer[0], req.user, next)) {
                question.getById(thisAnswer.question_id)
                    .then(thisQuestion => {
                        res.render('update-answer', {answer: thisAnswer[0], question: thisQuestion});
                    })
                    .catch(error => handleAnswerError(res, error));
            }
        })
        .catch(error => handleAnswerError(res, error));
});

/* Update an answer if its owner requested it */
router.post('/edit/:answerId', security.canEdit, function (req, res, next) {

    const answerText = sanitizer(req.body.answer);
    const userId = req.user.id;
    const answerId = sanitizer(req.params.answerId);

    answer.getById(answerId)
        .then(results => {
            if (results.length === 0) {
                res.redirect("/error");
            } else {
                const answerFromDB = results[0];
                if (!failWhenUserNotPermittedToEdit(answerFromDB, req.user, next)) {
                    answer.update(answerText, answerId)
                        .then(isSuccess => res.redirect("/question/show/" + answerFromDB.question_id + "#answer" + answerId))
                        .catch(error => handleAnswerError(res, error));
                }
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
    if (!answer.isEditable) {
        const error = new Error("Only admins can edit answers that don't belong to them.");
        error.status = 403;
        next(error);
        return true;
    }
    return false;
}

function handleAnswerError(res,error){
    logger.info(error);
    res.redirect('/error');
}

module.exports = router;
