const express = require("express");
const router = express.Router();

const {
  startInterview,
  addQuestionsToAttempt,
  submitAnswer,
  completeInterview,
  getMyAttempts,
  getSingleAttempt,
  getMyAnalytics,
  getAllAttempts,
} = require("../controllers/attemptController");

const { authentication, authorization } = require("../middlewares/auth");

// Admin
router.get("/all-attempts", authentication, authorization, getAllAttempts);

// User
router.post("/start-interview/:interviewId", authentication, startInterview);
router.post("/:attemptId/questions", authentication, addQuestionsToAttempt);
router.put(
  "/:attemptId/question/:questionId/answer",
  authentication,
  submitAnswer,
);
router.post("/:attemptId/complete", authentication, completeInterview);

router.get("/my-attempts", authentication, getMyAttempts);
router.get("/:attemptId", authentication, getSingleAttempt);
router.get("/analytics/my-analytics", authentication, getMyAnalytics);


module.exports = router;
