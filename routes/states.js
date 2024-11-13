const express = require("express");
const router = express.Router();
const db = require("../database/db");

var fs = require('fs');
var data = fs.readFileSync('./static_data/state.json', 'utf8');
var results = JSON.parse(data);

function getAll() {
  return results;
}

function getById(id) {
  return results.find(i => i.id == id);
}

// GET ALL State
router.get("/", async (req, res) => {
  // debugger
  res.json({
    data: getAll()
  });
});

// GET ALL state
router.get("/get-one", async (req, res) => {
  const { id } = req.query;
  res.json({
    data: getById(id)
  });
}); 


module.exports = router;
