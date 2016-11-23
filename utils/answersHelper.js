'use strict';

var AnswersHelper = function () {
};

/**
 * Checks whether answers can be edited by the user 
 * and attaches this information to each answer object
 * 
 * @param {Object} user User object containing his ID and admin flag
 * @param {Object[]} answers Answers returned by answer DAO
 * @returns answers passed as a parameter with added isEditable flag
 */
AnswersHelper.attachIsEditableFlags = function(user, answers){
    return answers.map(function(answer) {
        return AnswersHelper.attachIsEditableFlag(user, answer);
    });
}

/**
 * Checks whether answer can be edited by the user 
 * and attaches this information to the same object
 * 
 * @param {Object} user User object containing his ID and admin flag
 * @param {Object} answer Answer returned by answer DAO
 * @returns answer passed as a parameter with added isEditable flag
 */
AnswersHelper.attachIsEditableFlag = function(user, answer){
    answer.isEditable = (user.id == answer.userid || user.admin);
    return answer;
}

module.exports = AnswersHelper;
