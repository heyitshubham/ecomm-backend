const express = require('express');
const router = express.Router();
const tagController = require("../controllers/tagController");
const db = require("../database/db");

router.get("/", tagController.get_all_tags);

router.post("/create", tagController.create_tag);

router.get("/read/:id", tagController.get_tag_by_id);

router.get("/delete/:id", tagController.delete_tag);

module.exports = router;