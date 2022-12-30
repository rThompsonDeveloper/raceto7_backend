const express = require("express");
const router = express.Router();

// Authentication
const auth = require("../../middleware/auth");

// Models
const Follow = require("../../models/Follow");

// @route   GET api/follow
// @desc    gets list of people you are following
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const follow = await Follow.findOne({ user: req.params.id })
      .select("following")
      .populate("following", "photo name");
    if (follow) {
      follow.following.map((follower) => {
        follower.online = false;
      });
      res.json(follow.following);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/follow/by/:id
// @desc    gets list of people you are followed by
// @access  Private
router.get("/by/:id", auth, async (req, res) => {
  try {
    const follow = await Follow.findOne({ user: req.params.id });
    res.json(follow);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/follow
// @desc    Follows or Unfollows a user
// @access  Private
router.post("/", auth, async (req, res) => {
  // Destructure json body
  const { authProfile, userProfile, following } = req.body;

  try {
    // Check if the authenticated user has a following list
    let authFollow = await Follow.findOne({ user: authProfile });

    // If a follow hasnt been created for the authenticated user then create it
    if (!authFollow)
      authFollow = new Follow({
        user: authProfile,
        following: [],
        followedBy: [],
      });

    // if a follow hasnt been created for the user were following then create it
    let userFollow = await Follow.findOne({ user: userProfile });

    // If a follow hasnt been created for the user then create it
    if (!userFollow)
      userFollow = new Follow({
        user: userProfile,
        following: [],
        followedBy: [],
      });

    if (following === true) {
      // Push the user into the auth users following list
      authFollow.following.push(userProfile);

      // Push the auth user into followed by list of user
      userFollow.followedBy.push(authProfile);
    } else {
      // delete the user from auth following collection
      let index = authFollow.following.indexOf({ user: userProfile });
      authFollow.following.splice(index, 1);

      // delete the authUser from the user followedBy collection
      index = userFollow.followedBy.indexOf({ user: authProfile });
      userFollow.followedBy.splice(index, 1);
    }

    // saves the collections
    await userFollow.save();
    await authFollow.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
