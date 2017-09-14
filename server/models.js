const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const permissions = require('./permissions');
const game = require('./game');

let permissionNames = [];
for (let name of Object.keys(permissions))
  if (permissions.hasOwnProperty(name))
    permissionNames.push(permissions[name]);


/* A simple permissions container.
 *
 * Provides several useful methods for adding, checking, and removing
 * permissions from users. A new permissions object is created when
 * a user is instantiated.
 */
const permissionsSchema = new Schema({
  names   : { type: [Types.String], validate: array => array.every(s => permissionNames.indexOf(s) > -1) }
});

// Check if a permissions object has a permission by name
permissionsSchema.methods.has = function(...names) {
  for (let name of names) { if (this.names.indexOf(name) === -1) return false }
  return true;
};

// Add a permission
permissionsSchema.methods.add = function(name) {
  if (!this.has(name)) this.names.push(name);
};

// Remove a permission
permissionsSchema.methods.remove = function(name) {
  if (this.has(name)) this.names.pop(this.names.indexOf(name));
};

const Permissions = mongoose.model('Permissions', permissionsSchema);


/* Defines a user class for use throughout the site.
 *
 * Note that Permissions should refer to the string dictionary in the
 * permission file. Additionally, note that if the staff field is set
 * to true, querying the user's privileges will always return true.
 */
const userSchema = new Schema({
  username      : { type: Types.String, required: true },
  password      : { type: Types.String, required: true },
  name          : {
    first       : { type: Types.String, required: true },
    last        : { type: Types.String, required: true }, },
  email         : { type: Types.String, required: true },
  staff         : { type: Types.Boolean, default: false },
  permissions   : { type: Types.ObjectId, ref: 'Permissions', default: () => new Permissions() },
});

// Connect to the passport
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);


// Questions
const questionSchema = new Schema({
  author      : { type: Types.ObjectId, ref: 'User' },
  text        : { type: Types.String, required: true },
  subject     : { type: Types.String, enum: game.SUBJECTS, required: true },
  bonus       : { type: Types.ObjectId, ref: 'Question' },
  difficulty  : { type: Types.Number },
  visibility  : { type: Types.Number, enum: game.VISIBILITY, required: true, default: 1 }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);


const multipleChoiceSchema = new Schema({
  choices       : { type:
    [{ choice   : { type: Types.String },
       text     : { type: Types.String } }], required: true, validate: arr => arr.length === game.CHOICES.length },
  answer        : { type: Types.String, enum: game.CHOICES, required: true }
});

multipleChoiceSchema.methods.update = function(data) {
  console.log(2);
};

const MultipleChoiceQuestion = Question.discriminator('MultipleChoiceQuestion', multipleChoiceSchema);


const shortAnswerSchema = new Schema({
  answer  : { type: Types.String, required: true }
});

shortAnswerSchema.methods.update = function(data) {
  console.log(3);
};

const ShortAnswerQuestion = Question.discriminator('ShortAnswerQuestion', shortAnswerSchema);


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
