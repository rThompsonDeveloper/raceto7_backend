const express = require("express");
const router = express.Router();

// Authentication
const auth = require("../../middleware/auth");

// Models
const Follow = require("../../models/Follow");
const Tournament = require("../../models/Tournament");

// Need to get list of users that are following
// need to search database for any tournaments by those users in the [array]
// Need to figure out how to push an array of possibilites into the mongoose.find

// @route   GET api/newsFeed
// @desc    gets list of people you are following
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const followList = await Follow.findOne({ user: id }).select("following");

    const feed = [];

    if (followList?.following) {
      // Also need to filter whether or not the tournament is ACTIVE
      const tournaments = await Tournament.find({
        profile: { $in: followList.following },
        active: true,
      })
        .lean()
        .populate("profile", "name photo rating")
        .sort("-dateOf")
        .sort("startTime");

      res.send(tournaments);
    } else {
      res.send([]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
