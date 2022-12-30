const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("./auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route   POST api/users/update
// @desc    Updates a users information
// @access  Private
router.post(
  "/update",
  [auth, [check("email", "you must have a valid email address").isEmail()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { age, gender, city, state, skillLevel, email, id } = req.body;

    try {
      const fields = {};
      fields.location = {};

      if (age) fields.age = age;
      if (gender) fields.gender = gender;
      if (city) fields.location.city = city;
      if (state) fields.location.state = state;
      if (skillLevel) fields.skillLevel = skillLevel;
      if (email) fields.email = email;

      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: fields },
        {
          new: true,
        }
      );
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/users
// @desc    Create a user
// @access  Public
router.post(
  "/",
  [
    check("email", "please include a valid email address").isEmail(),
    check(
      "password",
      "Please enter a password with 8 or more characters"
    ).isLength({ min: 8 }),
    check("firstName", "name is required").not().isEmpty(),
    check("lastName", "name is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      birthDate,
      city,
      state,
      skillLevel,
    } = req.body;

    try {
      //Checks if user email already exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email address is already in use" }] });
      }

      // Create user object
      user = new User({
        email,
        password,
        following: [],
        followedBy: [],
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to collection
      await user.save();

      // Create profile object
      const profile = new Profile({
        name: { first: firstName, last: lastName },
        birthDate,
        location: { city, state },
        skillLevel,
      });

      // Save the new profile
      await profile.save();

      // save the new users profile id to databse
      user.profile = profile.id;

      await user.save();

      // Create object to store in jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Sign token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/users/find
// @desc    finds users that match search query
// @access  Public
router.post("/find", async (req, res) => {
  try {
    // destructure request
    const { name, state } = req.body;

    let users;

    if (state) {
      users = await Profile.find({
        "location.state": state,
        $or: [
          { "name.first": { $regex: `.*${name}.*`, $options: "i" } },
          { "name.last": { $regex: `.*${name}.*`, $options: "i" } },
        ],
      })
        .select("profilePhoto")
        .select("name");
    } else {
      users = await Profile.find({
        $or: [
          { "name.first": { $regex: `.*${name}.*`, $options: "i" } },
          { "name.last": { $regex: `.*${name}.*`, $options: "i" } },
        ],
      })
        .select("photo")
        .select("name");
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
