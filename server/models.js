const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const game = require('./game');


// Users
const userSchema = new Schema({
  username    : { type: Types.String, required: true },
  password    : { type: Types.String, required: true },
  name        : {
    first     : { type: Types.String, required: true },
    last      : { type: Types.String, required: true }, },
  email       : { type: Types.String, required: true },
  permission  : { type: Types.Number, enum: game.PERMISSIONS, required: true, default: 1 },
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);


// Questions
const questionSchema = new Schema({
  author      : { type: Types.ObjectId, ref: 'User' },
  text        : { type: Types.String, required: true },
  subject     : { type: Types.String, enum: game.SUBJECTS, required: true },
  bonus       : { type: Types.ObjectId, ref: 'Question' },
  difficulty  : { type: Types.Number },
  permission  : { type: Types.Number, enum: game.PERMISSIONS, required: true, default: 1 }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);


const multipleChoiceSchema = new Schema({
  choices       : { type:
    [{ choice   : { type: Types.String },
       text     : { type: Types.String } }], required: true, validate: arr => arr.length === game.CHOICES.length },
  answer        : { type: Types.String, enum: game.CHOICES, required: true }
});
const MultipleChoiceQuestion = Question.discriminator('MultipleChoiceQuestion', multipleChoiceSchema);


const shortAnswerSchema = new Schema({
  answer  : { type: Types.String, required: true }
});
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
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round,
  TryoutRound: TryoutRound
};
