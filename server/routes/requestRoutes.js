const express = require("express");
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.get("/", getRequests);
router.post("/", createRequest);
router.get("/:id", getRequestById);
router.patch("/:id/status", updateRequestStatus);
router.delete("/:id", deleteRequest);

module.exports = router;
