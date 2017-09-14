const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const permissions = require('./permissions');
const game = require('./game');
const validate = require('./validate');

let permissionNames = [];
for (let name of Object.keys(permissions))
  if (permissions.hasOwnProperty(name))
    permissionNames.push(permissions[name]);


/** A simple permissions container.
 *
 * Provides several useful methods for adding, checking, and removing
 * permissions from users. A new permissions object is created when
 * a user is instantiated.
 */
const permissionsSchema = new Schema({
  names   : { type: [Types.String], validate: array => array.every(s => permissionNames.indexOf(s) > -1) },
  all     : { type: Types.Boolean, default: false },
});

/** Check if a permissions object has a permission by name. */
permissionsSchema.methods.has = function(...names) {
  if (this.all) return true;
  for (let name of names) { if (this.names.indexOf(name) === -1) return false }
  return true;
};

/** Add a permission. */
permissionsSchema.methods.add = function(name) {
  if (!this.has(name)) this.names.push(name);
};

/** Remove a permission. */
permissionsSchema.methods.remove = function(name) {
  if (this.has(name)) this.names.pop(this.names.indexOf(name));
};

const Permissions = mongoose.model('Permissions', permissionsSchema);


/** Defines a user class for use throughout the site.
 *
 * Note that Permissions should refer to the string dictionary in the
 * permission file.
 */
const userSchema = new Schema({
  username      : { type: Types.String, required: true },
  password      : { type: Types.String, required: true },
  name          : {
    first       : { type: Types.String, required: true },
    last        : { type: Types.String, required: true }, },
  email         : { type: Types.String, required: true },
  permissions   : { type: Types.ObjectId, ref: 'Permissions', default: () => new Permissions() },
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
  author      : { type: Types.ObjectId, ref: 'User' },
  text        : { type: Types.String, required: true },
  subject     : { type: Types.String, enum: game.SUBJECTS, required: true },
  bonus       : { type: Types.ObjectId, ref: 'Question' },
  difficulty  : { type: Types.Number },
  visibility  : { type: Types.Number, enum: game.VISIBILITY, required: true, default: 1 }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);


/** Model defining multiple choice questions.
 *
 * The choices field must contain a list of anonymous models each with
 * a choice and text attribute. The choice corresponds to one of the
 * four letter options, and the text corresponds to the actual
 * response.
 */
const multipleChoiceQuestionSchema = new Schema({
  choices   : { type: [{ choice   : { type: Types.String, enum: game.CHOICES, required: true },
                         text     : { type: Types.String, required: true } }],
                required: true, validate: array => array.length === game.CHOICES.length },
  answer    : { type: Types.String, enum: game.CHOICES, required: true }
});

/** Update a multiple choice question from response data. */
multipleChoiceQuestionSchema.methods.update = function(data) {
  this.subject = data['subject'] || this.subject;
  this.text = data['text'] || this.text;
  this.choices = data['choices'] || this.choices;  // Todo: actually implement error checking
  this.answer = data['answer'] || this.answer;
};

const MultipleChoiceQuestion = Question.discriminator('MultipleChoiceQuestion', multipleChoiceQuestionSchema);


/** Short answer question model.
 *
 * The only extra part to a short answer question model is the open
 * ended answer field, which accepts any string.
 */
const shortAnswerQuestionSchema = new Schema({
  answer  : { type: Types.String, required: true }
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
  owner       : { type: Types.ObjectId, ref: 'User' },
  questions   : [{ type: Types.ObjectId, ref: 'Question', required: true }],
  permission  : { type: Types.Number, enum: game.PERMISSIONS, required: true, default: 1 }
}, { discriminatorKey: 'kind '});
const Round = mongoose.model('Round', roundSchema);


// Tracking
const viewSchema = new Schema({
  user          : { type: Types.ObjectId, ref: 'User', required: true },
  question      : { type: Types.ObjectId, ref: 'Question', required: true },
  answer        : {
    correct     : { type: Types.Boolean, required: true },
    interrupt   : { type: Types.Boolean, required: true }, },
  time          : { type: Types.Date, default: Types.Date.now }
});
const View = mongoose.model('View', viewSchema);


const tryoutSchema = new Schema({
  questions     : { type: [{
    question    : { type: Schema.Types.ObjectId, ref: 'MultipleChoiceQuestion', required: true },
    time        : { type: Schema.Types.Number }, }] }
});
const TryoutRound = Round.discriminator('TryoutRound', tryoutSchema);


module.exports = {
  Permissions: Permissions,
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round,
  TryoutRound: TryoutRound
};
