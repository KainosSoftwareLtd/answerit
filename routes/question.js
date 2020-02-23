'use strict';
const logger = require('../winstonLogger')(module);

const express = require('express');
const security = require('../utils/security');
const passport = require('passport');
const sanitizer = require('sanitize-html');
const moment = require('moment');

const router = express.Router();

const question = require('../dao/question');
const answer = require('../dao/answer');
const qaLink = require('../dao/question_answer_link');
const answersHelper = require('../utils/answersHelper');

/* List questions */
router.get('/list', security.isAuthenticated, function (req, res, next) {
    question.getAllByAlphabet()
        .then(results => res.render('list-questions', {questions: results}))
        .catch(error => handleQuestionError(res,error));
});

/* List questions, sort by latest answer date */
router.get('/list/answeredRecently', security.isAuthenticated, function (req, res, next) {
    question.getAllByLatestAnswerTime()
        .then(results => {
            results.forEach(function (question) {
                question.latest_answer_date = moment(question.latest_answer_date).fromNow();
            });
            res.render('list-questions', {questions: results});
        })
        .catch(error => handleQuestionError(res,error));
});

/* List questions */
router.get('/show/:questionId', security.isAuthenticated, function (req, res, next) {
    const questionId = sanitizer(req.params.questionId);

    question.getById(questionId)
        .then(question => {
            return answer.getForQuestionId((questionId));
        })
        .then(answers => {
            answers = answersHelper.attachIsEditableFlags(req.user, answers);
            res.render('show-question', {question: question, answers: answers});
        })
        .catch(error => handleQuestionError(res,error));
});

/* Add a question */
router.get('/add', security.canEdit, function (req, res, next) {
    res.render('add-question');
});

/* Add a question */
router.get('/addanswer/:questionId', security.canEdit, function (req, res, next) {
    const questionId = sanitizer(req.params.questionId);
    question.getById(questionId)
        .then(question => res.render('add-second-answer', {question: question}))
        .catch(error => handleQuestionError(res,error));
});


/* Delete an answer */
router.post('/deleteanswer', security.canEdit, function (req, res, next) {
    const questionId = sanitizer(req.body.question);
    const answerId = sanitizer(req.body.answer);

    answer.delete(answerId)
        .then(result => res.redirect('/question/show/' + questionId))
        .catch(error => handleQuestionError(res,error));
});

/* Delete a question */
router.post('/delete', security.canEdit, function (req, res, next) {
    const questionId = sanitizer(req.body.question);

    console.log("deleting question ${questionId}");
    question.delete(questionId)
        .then(result => {
            console.log(result);
            res.redirect('/')
        })
        .catch(error => handleQuestionError(res,error));
});

/* Add a question */
router.post('/add', security.canEdit, function (req, res, next) {

    const questionText = sanitizer(req.body.question);
    const answerText = sanitizer(req.body.answer);
    const userId = req.user.id;

    question.add(questionText, userId)
        .then(questionId => {
            if (null === questionId) {
                res.redirect("/error")
            } else {
                answer.add(answerText, userId)
                    .then(answerId => {
                        if (null == answerId) {
                            res.redirect("/error")
                        } else {
                            qaLink.add(questionId, answerId)
                                .then(linkId=>res.redirect("/question/show/" + questionId))
                                .catch(error=>res.redirect('/error'));
                        }
                    })
                    .catch(error => handleQuestionError(res,error));
            }
        })
        .catch(error => handleQuestionError(res,error));
});


function handleQuestionError(res,error){
    logger.info(error);
    res.redirect('/error');
}

module.exports = router;
