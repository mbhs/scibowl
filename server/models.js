const mongoose = require('mongoose');
mongoose.set('debug', true);
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const game = require('./game');
const validate = require('./validate');

const roles = { public: 0, student: 1, member: 2, captain: 3, deity: 4 };


/** Defines a user class for use throughout the site.
 *
 * Note that Permissions should refer to the string dictionary in the
 * permission file.
 */
const userSchema = new Schema({
  username  : { type: String, required: true },
  password  : { type: String, required: true },
  name      : {
    first   : { type: String, required: true },
    last    : { type: String, required: true },
  },
  email     : { type: String, required: true },
  role      : { type: Number, required: true, min: roles.public, max: roles.deity, default: roles.public },
  year      : { type: Number, required: true }
});

/** Connect to the passport. */
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

const schoolSchema = new Schema({
  name      : { type: String },
  students  : [{
    user    : { type: Types.ObjectId, ref: 'User' }
  }]
});
const School = mongoose.model('School', schoolSchema);


/** Shared characteristics of all Science Bowl questions.
 *
 * This is the base class for the multiple choice and short answer
 * questions.
 */
const questionSchema = new Schema({
  author       : { type: Types.ObjectId, ref: 'User' },
  text         : { type: String, required: true },
  subject      : { type: String, enum: game.SUBJECTS, required: true },
  bonus        : { type: Types.ObjectId, ref: 'Question' },
  difficulty   : { type: Number },
  circulation  : { type: Number, enum: roles, required: true, default: roles.captain },
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
  choice:   { type: String, enum: game.CHOICES, required: true },
  text:     { type: String, required: true }
});

const multipleChoiceQuestionSchema = new Schema({
  choices   : { type: [ choiceSchema ], required: true },
  answer    : { type: String, enum: game.CHOICES, required: true }
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
  answer   : { type: String, required: true }
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
  source       : { type: String },
  title        : { type: String },
  questions    : [{
    question   : { type: Types.ObjectId, ref: 'Question', required: true },
    time       : { type: Number, default: 5 }
  }]
}, { discriminatorKey: 'kind' });
const Round = mongoose.model('Round', roundSchema);

const tryoutSchema = new Schema({
  start       : { type: Date, required: true },
  end         : { type: Date, required: true },
  correct     : { type: Number, default: 1.0 },
  incorrect   : { type: Number, default: -0.75 }
});
const Tryout = Round.discriminator('Tryout', tryoutSchema);

const roundResultSchema = new Schema({
  round       : { type: Types.ObjectId, ref: 'Round' },
  updates     : [{
    entity    : { type: Number, default: 0 },
    question  : { type: Types.ObjectId, ref: 'Question', required: true },
    status    : { type: String, enum: game.STATUS, required: true },
    time      : { type: Date, required: true }
  }]
}, { discriminatorKey: 'kind' });
roundResultSchema.methods.questionsReleased = function() {
  let i = 0;
  for (let update of this.updates) {
    if (update.status === "released") i++;
  }
  return i;
};
roundResultSchema.methods.lastUpdate = function() {
  return this.updates[this.updates.length - 1];
};
const RoundResult = mongoose.model('RoundResult', roundResultSchema);

const tryoutResultSchema = new Schema({
  user    : { type: Types.ObjectId, ref: 'User' }
});
const TryoutResult = RoundResult.discriminator('TryoutResult', tryoutResultSchema);

const playedRoundSchema = new Schema({
  teams       : [[{ type: Types.ObjectId, ref: 'User', required: true }]]
});
const PlayedRound = RoundResult.discriminator('PlayedRound', playedRoundSchema);


module.exports = {
  roles: roles,
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round,
  Tryout: Tryout,
  RoundResult: RoundResult,
  TryoutResult: TryoutResult,
  PlayedRound: PlayedRound
};
