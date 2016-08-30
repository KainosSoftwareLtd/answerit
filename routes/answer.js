var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');

var router = express.Router();

var question = require('../dao/question');
var answer = require('../dao/answer');
var qalink = require('../dao/question_answer_link');


/* Add another answer to an existing existing */
router.post('/add', security.canEdit, function (req, res, next) {

    var questionId = sanitizer(req.body.questionid);
    var answerText = sanitizer(req.body.answer);


    answer.add(answerText, function (answerId, aerror) {
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

module.exports = router;
