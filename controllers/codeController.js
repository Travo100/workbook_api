const db = require('../models');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const parse5 = require('parse5');
// Defining methods for the lessonsController
module.exports = {
  submit: (req, res) => {
    // when the user submits code
    // this will get it and put it into
    // an html file
    let fileData = `<!DOCTYPE html><html><head><style>${req.body.css}</style></head><body>${req.body.html}<script>${req.body.js}</script></body></html>`;
    let params = {
      Bucket: 'cdn-coding-buddy', /* required */
      Key: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`, /* required */
      Body: new Buffer(fileData),
      ContentType: 'text/html',
      ACL: 'public-read',
      CacheControl: 'max-age=0'
    };
    s3.putObject(params, (err, data) => {
      if (err)  {
        return res.status(400).json(err);
      } else {

        db.File
          .find({fileUrl: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`})
          .then(dbFile => {
            if(!dbFile.length) {
              db.File.create({
                lessonNumber: req.body.lessonNumber,
                language: req.body.language,
                fileUrl: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`
              })
              .then(dbFile => {
                return db.User.findByIdAndUpdate(req.body.userId, { $push: { files: dbFile._id } }, { new: true });
              })
              .then(() => {
                return res.json({
                  message: "File added to user",
                  s3Data: data,
                  fileUrl: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`
                });
              })
              .catch((err) => {
                return res.status(400).json(err);
              });
            } else {
              return res.json({
                message: "File updated to user",
                s3Data: data,
                fileUrl: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`
              });
            }
          });
      }
    });
  },
  check: (req, res) => {
    db.Lesson.findOne({
      language: req.body.language,
      lessonNumber: req.body.lessonNumber
    })
      .lean()
      .then(lessonDb => {
        const userAnswerCode = req.body.code.replace(/\s+/g, '').trim();
        const dataBaseAnswerCode = lessonDb.answer.replace(/\s+/g, '').trim();
        // console.log(userAnswerCode); // logs: "this is a test"
        // console.log(dataBaseAnswerCode);
        let comparisonType = "";


        if(dataBaseAnswerCode.includes("{*}")) {
          comparisonType = "tag-comparsion";
        } else {
          comparisonType = "exact-match";
        }

        switch(comparisonType) {
          case "tag-comparsion":
            let dataBaseDocument = parse5.parse(dataBaseAnswerCode);
            let dataBaseBody = dataBaseDocument.childNodes[1].childNodes[1];

            let userAnswerCodeDocument = parse5.parse(userAnswerCode);
            let userAnswerBody = userAnswerCodeDocument.childNodes[1].childNodes[1];
            _checkBodyTags(dataBaseBody.childNodes, userAnswerBody.childNodes, (boolean) => {
              if (boolean) {
                res.json(true);
              } else {
                res.status(404).json(false);
              }
            });
            break;
          case "exact-match":
            if (userAnswerCode.includes(dataBaseAnswerCode)) {
              res.json(true);
            } else {
              res.status(404).json(false);
            }
            break;
          default:
            res.status(404).send("No match given");
        }

    }).catch(err => {
      res.status(400).send(err);
    });
  }
};

function _checkBodyTags(dataBaseBodyTags, userAnswerBodyTags, cb) {
  for(let i = 0; i < dataBaseBodyTags.length; i++) {
    if(dataBaseBodyTags[i].tagName !== userAnswerBodyTags[i].tagName) {
      return cb(false);
    }
  }

  return cb(true);
}