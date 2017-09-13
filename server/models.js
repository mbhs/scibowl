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
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: Schema.Types.String, required: true },
  subject: { type: Schema.Types.String, enum: game.SUBJECTS, required: true },
  difficulty: Schema.Types.Number
}, { discriminatorKey: 'type' });
const Question = mongoose.model('Question', questionSchema);

const multipleChoiceSchema = new Schema({
  choices: { type: [{
    choice: { type: Schema.Types.String },
    text: { type: Schema.Types.String }
  }], required: true },
  answer: { type: Schema.Types.String, enum: game.MC_CHOICES, required: true }
});
const MultipleChoiceQuestion = Question.discriminator('MultipleChoiceQuestion', multipleChoiceSchema);

const shortAnswerSchema = new Schema({
  answer: { type: Schema.Types.String, required: true }
});
const ShortAnswerQuestion = Question.discriminator('ShortAnswerQuestion', shortAnswerSchema);

// Rounds
const roundSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  questions: [{
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true }
  }]
}, { discriminatorKey: 'kind '});
const Round = mongoose.model('Round', roundSchema);

const tryoutSchema = new Schema({
  questions: [{
    question: { type: Schema.Types.ObjectId, ref: 'MultipleChoiceQuestion', required: true },
    time: { type: Schema.Types.Number }
  }]
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
