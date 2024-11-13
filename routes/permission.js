const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

router.get("/", permissionController.get_all_permissions);
router.post("/create", permissionController.create_permission);
router.get("/:id", permissionController.get_permission_by_id);
router.delete("/delete/:id", permissionController.delete_permission);
router.put("/update/:id", permissionController.update_permission);

module.exports = router;