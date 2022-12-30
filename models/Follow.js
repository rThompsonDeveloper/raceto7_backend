const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "profile", unique: true },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "profile" }],
  followedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "profile" }],
});

module.exports = Follow = mongoose.model("follow", FollowSchema);
