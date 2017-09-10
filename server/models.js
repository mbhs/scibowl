const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const game = require('./game');

// Users
const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
});
const User = mongoose.model('User', userSchema);

// Questions
const questionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: Schema.Types.String, required: true },
  subject: { type: Schema.Types.String, enum: game.SUBJECTS, required: true },
  bonus: { type: Schema.Types.ObjectId, ref: 'Question' },
  difficulty: Schema.Types.Number,
  published: { type: Schema.Types.Boolean, default: false }
}, { discriminatorKey: 'kind' });
const Question = mongoose.model('Question', questionSchema);

const multipleChoiceSchema = new Schema({
  choices: { type: [{ type: Schema.Types.String }], validate: arr => arr.length === game.MC_CHOICES.length, required: true },
  answer: { type: Schema.Types.String, enum: game.MC_CHOICES, required: true }
});
const MultipleChoiceQuestion = Question.discriminator('MultipleChoice', multipleChoiceSchema);

const shortAnswerSchema = new Schema({
  answer: { type: Schema.Types.String, required: true }
});
const ShortAnswerQuestion = Question.discriminator('ShortAnswer', shortAnswerSchema);

// Rounds
const roundSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
  published: { type: Schema.Types.Boolean, default: false }
});
const Round = mongoose.model('Round', roundSchema);

// Tracking
const viewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  answer: {
    correct: { type: Schema.Types.Boolean, required: true },
    interrupt: { type: Schema.Types.Boolean, required: true }
  },
  time: { type: Schema.Types.Date, default: Schema.Types.Date.now }
});
const View = mongoose.model('View', viewSchema);

module.exports = {
  User: User,
  Question: Question,
  MultipleChoiceQuestion: MultipleChoiceQuestion,
  ShortAnswerQuestion: ShortAnswerQuestion,
  Round: Round,
  View: View
};
