const express = require("express");
const { checkAvailability } = require("../controllers/availabilityController");

const router = express.Router();

router.post("/check", checkAvailability);

module.exports = router;
