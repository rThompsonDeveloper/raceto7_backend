const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile",
    },
  ],
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "profile" }],
  messages: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "profile" },
      message: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = Conversation = mongoose.model(
  "conversation",
  ConversationSchema
);
