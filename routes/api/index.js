const router = require("express").Router();
const lessonsRoutes = require("./lessons");

// Book routes
router.use("/lessons", lessonsRoutes);

module.exports = router;
