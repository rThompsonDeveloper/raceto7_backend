const express = require("express");
const router = express.Router();

// Middleware
const auth = require("../../middleware/auth");

// Models
const Profile = require("../../models/Profile");

// @route   GET api/profile
// @desc    finds a user
// @access  Private
router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const profile = await Profile.findById(id).populate("tournaments");
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile/rank
// @desc    Ranks a user
// @access  Private
router.post("/rank", auth, async (req, res) => {
  const { rankUser, authUser, rank } = req.body;

  try {
    const profile = await Profile.findById(rankUser);

    const newUser = {
      user: authUser,
      ranking: parseInt(rank),
    };

    // Check if the user has already ranked the profile
    const index = profile.rank.users.findIndex((x) => x.user === authUser);

    // if user has ranked the profile
    if (index !== -1) {
      // Get the old rank and subtract it from the array
      profile.rank.totalRankings -= profile.rank.users[index].ranking;
      // Add the new rank to total
      profile.rank.totalRankings += parseInt(rank);
      // Splice the old object from the array
      profile.rank.users.splice(index, 1);
    } else {
      profile.rank.totalRanks += 1;
      profile.rank.totalRankings += parseInt(rank);
    }

    // Push the new object to the array
    profile.rank.users.push(newUser);

    const newRank = await profile.save();

    res.json(newRank.rank);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile/rate
// @desc    Rates a user
// @access  Private
router.post("/rate", auth, async (req, res) => {
  const { rateUser, authUser, rating } = req.body;
  try {
    const profile = await Profile.findById(rateUser);

    // This will be the user we will store to users array
    const newUser = {
      user: authUser,
      rating: parseInt(rating),
    };

    // Check if the user has already rated this individual
    const index = profile.rating.users.findIndex((x) => x.user === authUser);

    // If we find a user ...
    if (index !== -1) {
      // Get the old rating and subtract it from the array
      profile.rating.totalStars -= profile.rating.users[index].rating;
      // Splice the old object from the array
      profile.rating.users.splice(index, 1);
    } else {
      profile.rating.totalRatings += 1;
    }

    // Add the new rating to total
    profile.rating.totalStars += parseInt(rating);

    // Push the newUser object to the array
    profile.rating.users.push(newUser);

    const newRating = await profile.save();

    res.json(newRating.rating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile/stiffs
// @desc    Reports user for stiffing them
// @access  Private
router.post("/stiffs", auth, async (req, res) => {
  const { stiffUser, authUser } = req.body;
  try {
    const profile = await Profile.findById(stiffUser);

    profile.stiffs.totalStiffs += 1;
    profile.stiffs.users.push(authUser);

    await profile.save();

    res.json(profile.stiffs.totalStiffs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
