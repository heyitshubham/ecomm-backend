const express = require('express');
const router = express.Router();
const variationController = require("../controllers/variationController");
const db = require("../database/db");

router.get("/", variationController.get_all_variations);
router.get("/:id", variationController.get_variation_by_id);
router.post("/create", variationController.create_variation);
router.put("/update/:id", variationController.update_variation);
router.delete("/delete/:id", variationController.delete_variation);

module.exports = router;