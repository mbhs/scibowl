const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MC_CHOICES = ["W", "X", "Y", "Z"];
const SUBJECTS = ["Mathematics", "Earth and Space Science", "Chemistry", "Physics", "Biology", "Energy"];

const questionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  text: Schema.Types.String,
  subject: { type: Schema.Types.String, enum: SUBJECTS },
  bonus: { type: Schema.Types.ObjectId, ref: 'Question' },
  difficulty: Schema.Types.Number
});
const Question = mongoose.model('Question', questionSchema);

const multipleChoiceSchema = new Schema({
  answer: { type: Schema.Types.String, enum: MC_CHOICES }
});
const MultipleChoiceQuestion = Question.discriminator('MultipleChoice', multipleChoiceSchema);

const shortAnswerSchema = new Schema({
  answer: Schema.Types.String
});
const ShortAnswerQuestion = Question.discriminator('ShortAnswer', shortAnswerSchema);

const roundSchema = new Schema({
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = {
  Question: mongoose.model('Question', questionSchema),
  Round: mongoose.model('Round', roundSchema)
};
