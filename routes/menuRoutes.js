const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().lean();
    res.render("menu", { title: "Menu", foods });
  } catch (error) {
    res.render("menu", { title: "Menu", error: "Server error" });
  }
});

module.exports = router;