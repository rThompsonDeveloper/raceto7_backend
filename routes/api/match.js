const express = require("express");
const router = express.Router();

// Server-side form validation
const { check, validationResult } = require("express-validator");

// Authentication
const auth = require("../../middleware/auth");

// Models
const Match = require("../../models/Match");
const Profile = require("../../models/Profile");

// @route   Post api/match
// @desc    Creates or Updates a match
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("location.state", "State is required!").not().isEmpty(),
      check("location.city", "City is required!").not().isEmpty(),
      check("price.min", "Min price is required!").not().isEmpty(),
      check("price.max", "Max price is required!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      user,
      description,
      price: { min, max },
      location: { city, state },
      id,
    } = req.body;

    const fields = {
      user: user,
      description: description,
      price: {
        min: min,
        max: max,
      },
      location: {
        city: city,
        state: state,
      },
    };

    try {
      // user is updating a match
      if (id) {
        const newMatch = await Match.findByIdAndUpdate(
          id,
          { $set: fields },
          { safe: true, multi: true, new: true }
        );
        res.json(newMatch);
      } else {
        // user is creating a new match
        const newMatch = new Match(fields);

        const matchData = await newMatch.save();

        await Profile.findByIdAndUpdate(
          profile,
          { $push: { matches: matchData._id } },
          { safe: true, upsert: true }
        );

        res.json(matchData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/match
// @desc    deletes a selected match
// @access  Prvate
router.delete("/:id", async (req, res) => {
  try {
    const match = await Match.findOne({ user: req.params.id });
    await match.remove();
    res.json({ msg: "match has been removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
