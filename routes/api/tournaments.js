const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

// multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Models
const Tournament = require("../../models/Tournament");
const Profile = require("../../models/Profile");

const imageUpload = require("../../imageUpload");

// @route   POST api/tournaments
// @desc    Create / Edit a tournament
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("entryFee", "Entry fee is a required field").not().isEmpty(),
      check("dateOf", "Date of tournament is required").not().isEmpty(),
      check("gameType", "Game type is required").not().isEmpty(),
      check("name", "Tournament Name is required").not().isEmpty(),
      check("startTime", "Start Time of tournament is required")
        .not()
        .isEmpty(),
      check("place", "place is required"),
      check("phone", "A phone number is required").not().isEmpty(),
      check("elimination", "Elimination type is required").not().isEmpty(),
      check("city", "City is required").not().isEmpty(),
      check("state", "state is required").not().isEmpty(),
      check("zip", "Zipcode is required").not().isEmpty(),
      check("street", "Street is required").not().isEmpty(),
      check("occurs", "Occurance is required").not().isEmpty(),
      check("isHandicapped", "Handicap data is required").not().isEmpty(),
      check("hasCalcutta", "Calcutta data is required").not().isEmpty(),
    ],
    upload.single("photo"),
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // desctructure body
    const {
      city,
      state,
      zip,
      street,
      profile,
      name,
      place,
      dateOf,
      startTime,
      occurs,
      gameType,
      isHandicapped,
      entryFee,
      hasCalcutta,
      tournamentStyle,
      elimination,
      benefitFor,
      phone,
      phoneAlternative,
      moneyAdded,
      description,
      id,
    } = req.body;

    try {
      // create fields for tournament
      const fields = {};
      fields.location = {
        city,
        state,
        zip,
        street,
      };
      fields.profile = profile;
      fields.name = name;
      fields.place = place;
      fields.dateOf = dateOf;
      fields.startTime = startTime;
      fields.occurs = occurs;
      fields.gameType = gameType;
      fields.isHandicapped = isHandicapped === "true" ? true : false;
      fields.entryFee = parseInt(entryFee);
      fields.hasCalcutta = hasCalcutta === "true" ? true : false;
      fields.tournamentStyle = tournamentStyle;
      fields.elimination = elimination;
      if (benefitFor !== "") fields.benefitFor = benefitFor;
      fields.phone = phone;
      if (phoneAlternative !== "") fields.phoneAlternative = phoneAlternative;
      if (moneyAdded !== "") fields.moneyAdded = parseInt(moneyAdded);
      if (description !== "") fields.description = description;

      // if tournament exists then were updating
      if (id !== "undefined") {
        console.log(`updating tournament ${id}`);
        // check if image is an object or a string -> if image has been changed or not
        if (typeof req.file === "object") {
          const photo = await imageUpload(
            "tournaments",
            id,
            req.file.originalname,
            req.file.filename
          );
          fields.photo = photo;
        } else {
          fields.photo = req.file;
        }

        const updatedTournament = await Tournament.findByIdAndUpdate(
          id,
          { $set: fields },
          { safe: true, multi: true, new: true }
        );

        res.json(updatedTournament);
      } else {
        console.log("adding new tournament");
        // create new tournament
        const tournament = new Tournament(fields);
        const tournamentData = await tournament.save();

        let photoLocation = "";

        if (typeof req.file === "object") {
          photoLocation = await imageUpload(
            "tournaments",
            tournamentData._id,
            req.file.originalname,
            req.file.filename
          );
        }

        const updatedTournament = await Tournament.findByIdAndUpdate(
          tournamentData._id,
          { $set: { photo: photoLocation } },
          { new: true }
        );

        await Profile.findByIdAndUpdate(
          profile,
          { $push: { tournaments: tournamentData._id } },
          { safe: true, upsert: true }
        );

        res.json(updatedTournament);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  }
);

// @route   GET api/tournaments
// @desc    Gets all based on query params
// @access  Public

router.get("/", async (req, res) => {
  try {
    const dayRange = 30;

    const queryParams = req.query;

    // Sets the date parameters to only pull tournaments starting in the next 30 days
    queryParams.dateOf = {
      $gte: new Date(Date.now()),
      $lt: new Date(new Date().getTime() + dayRange * 24 * 60 * 60 * 1000),
    };

    queryParams.active = true;

    const tournaments = await Tournament.find(queryParams)
      .lean()
      .populate("profile", "name photo rating")
      .sort("dateOf")
      .sort("startTime");

    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/tournaments/:id
// @desc    Gets a single tournament by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/tournaments/me
// @desc    Gets all users tournaments
// @access  Private

router.post("/me", async (req, res) => {
  try {
    const { id } = req.body;
    const tournaments = await Tournament.find({ profile: id })
      .lean()
      .populate("user", "name profilePhoto");
    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/tournaments/:id
// @desc    Delete a tournament
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    await tournament.remove();
    res.json({ msg: "tournament has been removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/tournaments/active
// @desc    activates or deactivates a tournament
// @access  Private
router.post("/active", auth, async (req, res) => {
  const { id, active } = req.body;

  try {
    const tournament = await Tournament.findByIdAndUpdate(
      id,
      { $set: { active: !active } },
      { safe: true, multi: true, new: true }
    );

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/tournaments/postpone/resume
// @desc    resumes a tournament
// @access  Private
router.get("/postpone/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      {
        $set: { active: true },
        $unset: { postpone: "" },
      },
      { safe: true, multi: true, new: true }
    );

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/tournaments/postpone
// @desc    postpones a tournament
// @access  Private
router.post(
  "/postpone",
  [
    auth,
    check("from", "date postpone starts is required").not().isEmpty(),
    check("to", "Date the postpone is over is required").not().isEmpty(),
  ],
  async (req, res) => {
    const { id, to, from } = req.body;

    try {
      const tournament = await Tournament.findByIdAndUpdate(
        id,
        { $set: { "postpone.to": to, "postpone.from": from } },
        { safe: true, multi: true, new: true }
      );

      res.json(tournament);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/tournaments/rsvp
// @desc    rsvp's to a tournament
// @access  Private
router.post("/rsvp", auth, async (req, res) => {
  const { id, name, tournamentId } = req.body;

  try {
    // Check if user is already rsvp'd to the tournament
    const rsvpStatus = await Tournament.findById(tournamentId);

    // If the list doesnt exist we need to create one
    if (!rsvpStatus.rsvpList) rsvpStatus.rsvpList = [];

    // Checks the list of RSVP clients
    const isRsvp = () => {
      const index = rsvpStatus.rsvpList.findIndex((x) => {
        return x.user == id;
      });
      return index;
    };

    if (isRsvp() !== -1) {
      rsvpStatus.rsvpList = rsvpStatus.rsvpList.filter(
        (rsvpItem) => rsvpItem.user != id
      );
      rsvpStatus.save();
      res.send(rsvpStatus.rsvpList);
    } else {
      rsvpStatus.rsvpList.push({ user: id, name: name });
      await rsvpStatus.save();
      res.send(rsvpStatus.rsvpList);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/tournaments/rsvp
// @desc    checks if the user is RSVP'd to the tournament or not
// @access  Private
router.get("/rsvp/:id", auth, async (req, res) => {
  const { id } = req.params.id;
  const tournament = await Tournament.findByID(id);
  // Checks the list of RSVP clients
  const isRsvp = () => {
    const index = tournament.rsvpList.findIndex((x) => {
      return x.user === id;
    });
    return index;
  };
  res.json(isRsvp !== -1);
});

module.exports = router;
