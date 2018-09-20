const router = require('express').Router();
const lessonsRoutes = require('./lessons');
const codeRoutes = require('./code');
const fileRoutes = require('./file');

// Book routes
router.use('/lessons', lessonsRoutes);
router.use('/code', codeRoutes);
router.use('/files', fileRoutes);

module.exports = router;
