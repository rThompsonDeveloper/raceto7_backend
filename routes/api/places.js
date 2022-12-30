const express = require("express");
const router = express.Router();

// Authentication
const auth = require("../../middleware/auth");

// Models
const Places = require("../../models/Places");

// @route   POST /api/places
// @desc    Adds new places as they come
// @access  Private
router.post("/", auth, async (req, res) => {
  const { name, location } = req.body;

  try {
    const placeFound = await Places.findOne({ location: location });

    if (!placeFound) {
      const newPlace = new Places({ name: name, location, location });
      newPlace.save();
    }

    res.send("successful");
  } catch (err) {
    console.error(err);
  }
});

// @route   GET /api/places
// @desc    Search for places as you type
// @access  Private
router.get("/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const places = await Places.find({
      name: { $regex: `.*${name}.*`, $options: "i" },
    });

    res.send(places);
  } catch (err) {
    if (err) console.error(err);
  }
});

module.exports = router;
