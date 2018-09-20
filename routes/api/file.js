const router = require('express').Router();
const fileController = require('../../controllers/filesController');

router.route('/user')
  .post(fileController.findOneFileByUrl);

module.exports = router;