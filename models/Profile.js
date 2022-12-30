const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: true,
    },
  },
  birthDate: {
    type: Date,
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
  },
  skillLevel: {
    type: String,
  },
  photo: {
    type: String,
  },
  rank: {
    totalRankings: {
      type: Number,
      default: 0,
    },
    totalRanks: {
      type: Number,
      default: 0,
    },
    users: [{ user: { type: String }, ranking: { type: Number } }],
  },
  stiffs: {
    totalStiffs: {
      type: Number,
      default: 0,
    },
    users: [{ type: String }],
  },
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "tournament" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "match" }],
  rating: {
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalStars: {
      type: Number,
      default: 0,
    },
    users: [{ user: { type: String }, rating: { type: Number } }],
  },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
