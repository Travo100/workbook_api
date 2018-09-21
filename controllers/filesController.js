const db = require("../models");
// Defining methods for the filesController
module.exports = {
  findAll: (req, res) => {
    db.File
      .find(req.query)
      .sort({ date: -1 })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findById: (req, res) => {
    db.File
      .findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: (req, res) => {
    db.File
      .create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  update: (req, res)=> {
    db.File
      .findByIdAndUpdate(req.params.id, req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  updateByFileUrl: (fileUrl, content)=> {
    db.File
      .findOneAndUpdate({fileUrl: fileUrl}, {content: content}, {new: true})
      .then(dbModel => console.log(dbModel))
      .catch(err => console.log(err));
  },
  findOneFileByUrl: (req, res) => {
    db.File
      .findOne({fileUrl: req.body.fileUrl})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  remove: (req, res) => {
    db.File
      .findById({ _id: req.params.id })
      .then(dbModel => dbModel.remove())
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  }
};