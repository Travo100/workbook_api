const router = require("express").Router();
const lessonsController = require("../../controllers/lessonsController");

// Matches with "/api/lessons"
router.route("/")
  .get(lessonsController.findAll)
  .post(lessonsController.create);

// Matches with "/api/lessons/:id"
router
  .route("/:id")
  .get(lessonsController.findById)
  .put(lessonsController.update)
  .delete(lessonsController.remove);

// Matches with "/api/lessons/language/:language"
router
  .route("/language/:language")
  .get(lessonsController.findByLanguageAndOrderByLessonNumber);

router
  .route("/single/:language/:lessonNumber")
  .get(lessonsController.findOneLessonByLanguageAndLessonNumber);

module.exports = router;