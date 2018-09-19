const router = require('express').Router();
const lessonsRoutes = require('./lessons');
const codeRoutes = require('./code');

// Book routes
router.use('/lessons', lessonsRoutes);
router.use('/code', codeRoutes);

module.exports = router;
