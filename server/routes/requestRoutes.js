const express = require("express");
const {
  createRequest,
  getRequests,
  updateRequestStatus,
} = require("../controllers/requestController");

const router = express.Router();

router.get("/", getRequests);
router.post("/", createRequest);
router.patch("/:id/status", updateRequestStatus);

module.exports = router;
