const express = require("express");
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");
const {
  protect,
  authorizeRoles,
  optionalProtect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getRequests).post(optionalProtect, createRequest);

router
  .route("/:id")
  .get(getRequestById)
  .delete(protect, authorizeRoles("admin"), deleteRequest);

router
  .route("/:id/status")
  .patch(protect, authorizeRoles("admin", "manager"), updateRequestStatus);

module.exports = router;
