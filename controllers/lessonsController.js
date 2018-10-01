const db = require("../models");
// Defining methods for the lessonsController
module.exports = {
  findAll: (req, res) => {
    db.Lesson
      .find(req.query)
      .sort({ createdAt: -1 })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findById: (req, res) => {
    db.Lesson
      .findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findOneLessonByLanguageAndLessonNumber: (req, res) => {
    db.Lesson
      .findOne({lessonNumber: req.params.lessonNumber, language: req.params.language})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findByLanguageAndOrderByLessonNumber: (req, res) => {
    db.Lesson
      .find({language: req.params.language})
      .sort({lessonNumber: 1})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: (req, res) => {
    let lessonContent = req.body;
    if(!lessonContent.rawContent.entityMap || JSON.stringify(lessonContent.rawContent.entityMap === "{}")) {
      lessonContent.rawContent.entityMap = "";
    }
    db.Lesson
      .create(lessonContent)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  update: (req, res)=> {
    db.Lesson
      .findByIdAndUpdate(req.params.id, req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  remove: (req, res) => {
    db.Lesson
      .findById(req.params.id)
      .then(dbModel => dbModel.remove())
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  }
};