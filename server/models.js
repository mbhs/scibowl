const mongoose = require('mongoose');
mongoose.set('debug', true);
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const game = require('./game');
const validate = require('./validate');

const roles = { public: 0, student: 1, member: 2, captain: 3 };


/** Defines a user class for use throughout the site.
 *
 * Note that Permissions should refer to the string dictionary in the
 * permission file.
 */
const userSchema = new Schema({
  username  : { type: Types.String, required: true },
  password  : { type: Types.String, required: true },
  name      : {
    first   : { type: Types.String, required: true },
    last    : { type: Types.String, required: true },
  },
  email     : { type: Types.String, required: true },
  role      : { type: Types.Number, required: true, enum: roles, default: roles.public },
  year      : { type: Types.Number, required: true }
});

/** Connect to the passport. */
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);


/** Shared characteristics of all Science Bowl questions.
 *
 * This is the base class for the multiple choice and short answer
 * questions.
 */
const questionSchema = new Schema({
  author       : { type: Types.ObjectId, ref: 'User' },
  text         : { type: Types.String, required: true },
  subject      : { type: Types.String, enum: game.SUBJECTS, required: true },
  bonus        : { type: Types.ObjectId, ref: 'Question' },
  difficulty   : { type: Types.Number },
  circulation  : { type: Types.Number, enum: roles, required: true, default: roles.captain },
  time         : { type: Types.Number, default: 5 }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);


/** Model defining multiple choice questions.
 *
 * The choices field must contain a list of anonymous models each with
 * a choice and text attribute. The choice corresponds to one of the
 * four letter options, and the text corresponds to the actual
 * response.
 */
const choiceSchema = new Schema({
  choice:   { type: Types.String, enum: game.CHOICES, required: true },
  text:     { type: Types.String, required: true }
});

const multipleChoiceQuestionSchema = new Schema({
  choices   : { type: [ choiceSchema ], required: true },
  answer    : { type: Types.String, enum: game.CHOICES, required: true }
});

/** Update a multiple choice question from response data. */
multipleChoiceQuestionSchema.methods.update = function(data) {
  this.subject = data['subject'] || this.subject;
  this.text = data['text'] || this.text;
  this.choices = data['choices'] || this.choices;  // TODO: actually implement error checking
  this.answer = data['answer'] || this.answer;
};

/** Construct a dictionary corresponding to a question's choices. */
multipleChoiceQuestionSchema.methods.choicesMap = function() {
  const choicesMap = {};
  for (let choicePair of this.choices) { choicesMap[choicePair.choice] = choicePair.text; }
  return choicesMap;
};

const MultipleChoiceQuestion = Question.discriminator('MultipleChoiceQuestion', multipleChoiceQuestionSchema);


/** Short answer question model.
 *
 * The only extra part to a short answer question model is the open
 * ended answer field, which accepts any string.
 */
const shortAnswerQuestionSchema = new Schema({
  answer   : { type: Types.String, required: true }
});

/** Update a short answer question from response data. */
shortAnswerQuestionSchema.methods.update = function(data) {
  this.subject = data['subject'] || this.subject;
  this.text = data['text'] || this.text;
  this.answer = data['answer'] || this.answer;
};
const ShortAnswerQuestion = Question.discriminator('ShortAnswerQuestion', shortAnswerQuestionSchema);


// Rounds
const roundSchema = new Schema({
  owner        : { type: Types.ObjectId, ref: 'User' },
  source       : { type: Types.String },
  questions    : [{ type: Types.ObjectId, ref: 'Question', required: true }],
  visibility   : { type: Types.Number, enum: game.VISIBILITY, required: true, default: 1 }
}, { discriminatorKey: 'kind '});
const Round = mongoose.model('Round', roundSchema);

const tryoutSchema = new Schema({
  start       : { type: Types.Date, required: true },
  end         : { type: Types.Date, required: true },
  code        : { type: Types.String },
  correct     : { type: Types.Number, default: 1.0 },
  incorrect   : { type: Types.Number, default: -0.75 }
});
const TryoutRound = Round.discriminator('TryoutRound', tryoutSchema);

const questionStatus = ['released', 'correct', 'incorrect', 'skipped'];
const roundResultSchema = new Schema({
  round       : { type: Types.ObjectId, ref: 'Round' },
  updates     : [{
    entity    : { type: Types.Number, default: 0 },
    question  : { type: Types.ObjectId, ref: 'Question', required: true },
    status    : { type: Types.String, enum: questionStatus, required: true },
    time      : { type: Types.Date, required: true }
  }],
  entities    : [{ type: Types.ObjectId, ref: 'User', required: true }]
});
const RoundResult = mongoose.model('RoundResult', roundResultSchema);


module.exports = {
  roles: roles,
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round,
  TryoutRound: TryoutRound,
  RoundResult: RoundResult
};
