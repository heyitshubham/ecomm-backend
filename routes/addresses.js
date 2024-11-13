const express = require("express");
const router = express.Router();
const db = require("../database/db");
const addressController = require("../controllers/addressController");


// GET ALL Addresses
router.get("/", async (req, res) => {
  // This query won't work in MariaDB if you are using XAMPP default setting (MariaDB is auto-configured instead of MySQL)
  let query = `select * from addresses`;

  db.query(
    query,
    (err, results) => {
      if (err) console.log(err);
      else{
        
        res.json({
          data: results
        });
      } 
    }
  );
});

// GET SINGLE BY ID
router.get("/get-by-userid", addressController.get_single_address_by_userId);
router.get("/:id", addressController.get_address_by_id);
router.post("/create", addressController.create_address);
router.post("/update", addressController.update_address);
router.post("/delete", addressController.delete_address);

module.exports = router;
