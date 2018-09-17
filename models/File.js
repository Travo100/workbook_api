const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FileSchema = new Schema({
  lessonNumber: {
    type: Number,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  complete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('File', FileSchema);