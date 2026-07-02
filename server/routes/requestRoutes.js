const express = require("express");
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(createRequest).get(getRequests);

router
  .route("/:id")
  .get(getRequestById)
  .delete(protect, authorizeRoles("admin"), deleteRequest);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "manager"),
  updateRequestStatus,
);

module.exports = router;
