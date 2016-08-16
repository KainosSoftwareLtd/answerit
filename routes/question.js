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
        console.log(results);
        res.render('list-questions' , { questions : results} );
    })
});

/* List questions */
router.get('/show/:questionId', security.isAuthenticated, function (req, res, next) {
    var questionId = sanitizer(req.params.questionId);
    console.log(questionId);

    question.getById(questionId, function (question) {
        answer.getForQuestionId( questionId , function( answers ) {
            console.log(question);
            console.log(answers);
            res.render('show-question' , { question : question, answers: answers} );
        })

    })
});

/* Add a question */
router.get('/add', security.isAuthenticatedAdmin, function (req, res, next) {
    res.render('add-question');
});

/* Add a question */
router.post('/add', security.isAuthenticatedAdmin, function (req, res, next) {

    var questionText = sanitizer(req.body.question);
    var answerText = sanitizer(req.body.answer);

    question.add(questionText, function (questionId, qerror) {
        if (null == questionId) {
            res.redirect("/error")
            return;
        }
        answer.add(answerText, function (answerId, aerror) {
            if (null == answerId) {
                res.redirect("/error")
                return;
            }
            qalink.add(questionId, answerId, function (linkId, lerror) {
                res.redirect("/search")
                return;
            })
        });
    });

});

module.exports = router;
