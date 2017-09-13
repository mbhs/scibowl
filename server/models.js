const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;

const game = require('./game');


// Users
const userSchema = new Schema({
  _id: Types.ObjectId,
  username: { type: Types.String, required: true },
  password: { type: Types.String, required: true },
  firstName: { type: Types.String, required: true },
  lastName: { type: Types.String, required: true },
  email: { type: Types.String, required: true },
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);


// Questions
const questionSchema = new Schema({
  _id: Types.ObjectId,
  author: { type: Types.ObjectId, ref: 'User' },
  text: { type: Types.String, required: true },
  subject: { type: Types.String, enum: game.SUBJECTS, required: true },
  bonus: { type: Types.ObjectId, ref: 'Question' },
  difficulty: Types.Number,
  published: { type: Types.Boolean, default: false }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);

const multipleChoiceSchema = new Schema({
  choices: { type: [{ type: Types.String }], validate: arr => arr.length === game.MC_CHOICES.length, required: true },
  answer: { type: Types.String, enum: game.MC_CHOICES, required: true }
});
const MultipleChoiceQuestion = Question.discriminator('MultipleChoice', multipleChoiceSchema);

const shortAnswerSchema = new Schema({
  answer: { type: Types.String, required: true }
});
const ShortAnswerQuestion = Question.discriminator('ShortAnswer', shortAnswerSchema);


// Rounds
const roundSchema = new Schema({
  owner: { type: Types.ObjectId, ref: 'User' },
  questions: [{ type: Types.ObjectId, ref: 'Question', required: true }],
  published: { type: Types.Boolean, default: false }
});
const Round = mongoose.model('Round', roundSchema);


// Tracking
const viewSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  question: { type: Types.ObjectId, ref: 'Question', required: true },
  answer: {
    correct: { type: Types.Boolean, required: true },
    interrupt: { type: Types.Boolean, required: true }
  },
  time: { type: Types.Date, default: Types.Date.now }
});
const View = mongoose.model('View', viewSchema);


module.exports = {
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round
};
