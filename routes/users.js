const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");

// Get all users
router.get("/", userController.get_all);

// Get all users
router.get("/get-user", userController.get_user_info);


router.put("/:userId", userController.update_user);
router.post("/add", userController.add_user);
router.post("/update", userController.update_user);
router.post("/delete", userController.delete_user);

module.exports = router;
