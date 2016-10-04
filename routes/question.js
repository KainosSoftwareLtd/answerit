'use strict';

var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');

var router = express.Router();

var question = require('../dao/question');
var answer = require('../dao/answer');
var qalink = require('../dao/question_answer_link');

/* List questions */
router.get('/list', security.isAuthenticated, function (req, res, next) {
    question.getAll(function (results) {
        res.render('list-questions', {questions: results});
    })
});

/* List questions */
router.get('/show/:questionId', security.isAuthenticated, function (req, res, next) {
    var questionId = sanitizer(req.params.questionId);

    question.getById(questionId, function (question) {
        answer.getForQuestionId(questionId, function (answers) {
            res.render('show-question', {question: question, answers: answers});
        })

    })
});

/* Add a question */
router.get('/add', security.canEdit, function (req, res, next) {
    res.render('add-question');
});

/* Add a question */
router.get('/addanswer/:questionId', security.canEdit, function (req, res, next) {
    var questionId = sanitizer(req.params.questionId);
    question.getById(questionId, function (question) {
        res.render('add-second-answer', {question: question});
    });

});

/* Delete an answer */
router.post('/deleteanswer', security.canEdit, function (req, res, next) {
    var questionId = sanitizer(req.body.question);
    var answerId = sanitizer(req.body.answer);

    answer.delete(answerId, function (result) {
        res.redirect('/question/show/' + questionId);
        return;
    })

});

/* Delete a question */
router.post('/delete', security.canEdit, function (req, res, next) {
    var questionId = sanitizer(req.body.question);

    question.delete(questionId, function (result) {
        res.redirect('/');
        return;
    })

});

/* Add a question */
router.post('/add', security.canEdit, function (req, res, next) {

    var questionText = sanitizer(req.body.question);
    var answerText = sanitizer(req.body.answer);
    var userId = req.user.id;


    question.add(questionText, userId, function (questionId, qerror) {
        if (null == questionId) {
            res.redirect("/error")
            return;
        }
        answer.add(answerText, userId, function (answerId, aerror) {
            if (null == answerId) {
                res.redirect("/error")
                return;
            }
            qalink.add(questionId, answerId, function (linkId, lerror) {
                res.redirect("/question/show/" + questionId)
                return;
            })
        });
    });

});

module.exports = router;
