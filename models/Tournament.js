const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile",
  },
  name: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    required: true,
  },
  hasCalcutta: {
    type: Boolean,
    required: true,
  },
  photo: {
    type: String,
  },
  isHandicapped: {
    type: Boolean,
    required: true,
  },
  entryFee: {
    type: Number,
    required: true,
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
  },
  dateOf: {
    type: Date,
    required: true,
  },
  occurs: {
    type: String,
    default: "once",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  place: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  phoneAlternative: {
    type: String,
  },
  tournamentStyle: {
    type: String,
    required: true,
  },
  elimination: {
    type: String,
    required: true,
  },
  benefitFor: {
    type: String,
  },
  moneyAdded: {
    type: Number,
  },
  description: {
    type: String,
  },
  postpone: {
    to: { type: Date },
    from: { type: Date },
  },
  active: {
    type: Boolean,
    default: true,
  },
  rsvpList: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      name: { type: String },
    },
  ],
});

module.exports = Tournament = mongoose.model("tournament", TournamentSchema);
