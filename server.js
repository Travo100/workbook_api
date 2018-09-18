require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const mongoose = require('mongoose');
const morgan = require('morgan'); // used to see requests
const AWS = require('aws-sdk');
const app = express();
const db = require('./models');
const routes = require("./routes");
const PORT = process.env.PORT || 3001;

const s3 = new AWS.S3();

// Setting CORS so that any website can
// Access our API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

//log all requests to the console
app.use(morgan('dev'));

// Setting up bodyParser to use json and set it to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codingBuddyDB', { useNewUrlParser: true });

// Init the express-jwt middleware
const isAuthenticated = exjwt({
  secret: process.env.SECRET_KEY
});


// LOGIN ROUTE
app.post('/api/login', (req, res) => {
  db.User.findOne({
    email: req.body.email
  }).then(user => {
    user.verifyPassword(req.body.password, (err, isMatch) => {
      if(isMatch && !err) {
        let token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: 129600 }); // Sigining the token
        res.json({success: true, message: "Token Issued!", token: token, user: user});
      } else {
        res.status(401).json({success: false, message: "Authentication failed. Wrong password."});
      }
    });
  }).catch(err => res.status(404).json({success: false, message: "User not found", error: err}));
});

// SIGNUP ROUTE
app.post('/api/signup', (req, res) => {
  db.User.create(req.body)
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
});

// Any route with isAuthenticated is protected and you need a valid token
// to access
app.get('/api/user/:id', isAuthenticated, (req, res) => {
  db.User.findById(req.params.id).then(data => {
    if(data) {
      res.json(data);
    } else {
      res.status(404).send({success: false, message: 'No user found'});
    }
  }).catch(err => res.status(400).send(err));
});


app.post('/api/submit/code', (req, res) => {
  // when the user submits code
  // this will get it and put it into
  // an html file
  let fileData = `<!DOCTYPE html><html><head><style>${req.body.css}</style></head><body>${req.body.html}<script>${req.body.js}</script></body></html>`;
  let params = {
    Bucket: 'cdn-coding-buddy', /* required */
    Key: `${req.body.userId}/${req.body.language}/${req.body.lessonNumber}/index.html`, /* required */
    Body: new Buffer(fileData),
    ContentType: "text/html",
    ACL: 'public-read'
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
              .then(dbUser => {
                console.log(dbUser);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log("File already created");
          }
        });


      res.json({
        message: "File added to user",
        s3Data: data
      });
    }
  });
});

app.post('/api/check/code', (req, res) => {
  db.Lesson.findOne({
    language: req.body.language,
    lessonNumber: req.body.lessonNumber
  }).then(lessonDb => {
    if(req.body.code.includes(lessonDb.answer)){
      res.json(true);
    } else {
      res.status(404).json(false);
    }
  }).catch(err => {
    res.status(400).send(err);
  });
});

// Add routes, both API and view
app.use(routes);


app.get('/', isAuthenticated /* Using the express jwt MW here */, (req, res) => {
  res.send('You are authenticated'); //Sending some response when authenticated
});

// Error handling
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') { // Send the error rather than to show it on the console
    res.status(401).send(err);
  }
  else {
    next(err);
  }
});

// Send every request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
  res.status(404).send("404 not found")
});

app.listen(PORT, () => {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});
