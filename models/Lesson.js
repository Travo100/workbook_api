const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LessonSchema = new Schema({
  lessonNumber: {
    type: Number,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rawContent: {
    type: Object,
    required: true,
    minimize: false
  },
  answer: {
    type: String,
    required: false,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Lesson', LessonSchema);