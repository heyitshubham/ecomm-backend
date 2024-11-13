const express = require('express');
const router = express.Router();
const taxController = require("../controllers/taxController");
const db = require("../database/db");

router.get("/", taxController.get_all_taxes);
router.get("/:id", taxController.get_tax_by_id);
router.post("/create", taxController.create_tax);
router.put("/update/:id", taxController.update_tax);
router.get("/delete/:id", taxController.delete_tax);

module.exports = router