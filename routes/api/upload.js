const express = require("express");
const router = express.Router();
const config = require("config");
const id = config.get("awsId");
const secret = config.get("awsSecret");
const path = require("path");
// aws
const fs = require("fs");
const AWS = require("aws-sdk");
// multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const s3 = new AWS.S3({
  accessKeyId: id,
  secretAccessKey: secret,
});

// Middleware
const auth = require("../../middleware/auth");

// Models
const Profile = require("../../models/Profile");

// @route   POST api/upload
// @desc    uploads a users profile picture
// @access  Private
router.post("/", [auth, upload.single("profileImage")], async (req, res) => {
  try {
    const id = req.body.id;

    const fileContent = fs.readFileSync(
      path.join(__dirname + "../../../uploads/" + req.file.filename)
    );

    const params = {
      Bucket: "raceto7images/user",
      Key: id + path.extname(req.file.originalname),
      Body: fileContent,
    };

    s3.upload(params, async (err, data) => {
      if (err) throw err;
      const profile = await Profile.findOneAndUpdate(
        { _id: id },
        { $set: { photo: data.Location } },
        { new: true }
      );

      res.json(profile.photo);
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
