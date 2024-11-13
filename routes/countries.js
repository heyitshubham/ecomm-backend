const express = require("express");
const router = express.Router();
const db = require("../database/db");
const countryHelper = require("../helpers/countryHelper");

// GET ALL Country
router.get("/", async (req, res) => {
  // debugger
  res.json({
    data: countryHelper.getAllCountry()
  });
});

// GET ALL Country
router.get("/get-one", async (req, res) => {
  const { id } = req.query;
  res.json({
    data: countryHelper.getAllCountry(id)
  });
}); 


module.exports = router;
