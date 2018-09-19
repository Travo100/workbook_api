const router = require('express').Router();
const codeController = require('../../controllers/codeController');

router.route('/submit')
  .post(codeController.submit);

router.route('/check')
  .post(codeController.check);

module.exports = router;