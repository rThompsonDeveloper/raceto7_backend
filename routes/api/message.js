const express = require("express");
const router = express.Router();

// Authentication
const auth = require("../../middleware/auth");

// Models
const User = require("../../models/User");
const Conversation = require("../../models/Conversation");
const Profile = require("../../models/Profile");

// @route   POST api/messages
// @desc    Sends a message to a user
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    // We need to find the userID of the sender
    const authSender = await User.findOne({ profile: sender }).select("_id");
    const authReceiver = await User.findOne({ profile: receiver }).select(
      "_id"
    );

    // Check to see if the user has a conversation started already with the receiver
    const conversationExists = await Conversation.findOne({
      users: { $all: [sender, receiver] },
    });

    if (conversationExists) {
      // Update current conversation with new message
      conversationExists.messages.push({ user: sender, message: message });
      // Change seen status to only sender
      conversationExists.seenBy = [sender];
      const data = await conversationExists.save();
      res.json(data);
    } else {
      // Create new conversation and store in database
      const newConversation = await new Conversation({
        users: [sender, receiver],
        messages: [{ user: sender, message: message }],
        seenBy: [sender],
      });

      // Save to Database
      const data = await newConversation.save();

      // Update both users collection of conversations with the new conversation ID
      await User.findByIdAndUpdate(authSender, {
        $push: { inbox: newConversation._id },
      });
      await User.findByIdAndUpdate(authReceiver, {
        $push: { inbox: newConversation._id },
      });

      res.json(data);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/messages/read
// @desc    Change the read status of a message
// @access  Private
router.post("/seen", auth, async (req, res) => {
  try {
    const { conversationId, seenBy } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation.seenBy.includes(seenBy)) {
      conversation.seenBy.push(seenBy);
      conversation.save();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/messages
// @desc    Get conversations for the user
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const conversations = await User.findById(req.params.id)
      .select("inbox")
      .populate({
        path: "inbox",
        populate: {
          path: "users",
          model: "profile",
          select: "name photo",
        },
      });
    const { inbox } = conversations;
    res.send(inbox);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/messages/profileInfo
// @desc    Get profile info like name and photo
// @access  Private
router.get("/profileInfo/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).select(
      "_id name photo"
    );
    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
