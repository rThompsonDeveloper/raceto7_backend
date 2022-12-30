const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  inbox: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
  ],
});

module.exports = User = mongoose.model("user", UserSchema);
