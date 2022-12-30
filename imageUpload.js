const config = require("config");
const id = config.get("awsId");
const secret = config.get("awsSecret");
const path = require("path");

// aws
const fs = require("fs");
const AWS = require("aws-sdk");

// Initialize s3 Bucket connection
const s3 = new AWS.S3({
  accessKeyId: id,
  secretAccessKey: secret,
});

const imageUpload = async (folder, _id, originalName, fileName) => {
  const fileContent = fs.readFileSync(
    path.join(__dirname + "/uploads/" + fileName)
  );
  const params = {
    Bucket: `raceto7images/${folder}`,
    Key: _id + path.extname(originalName),
    Body: fileContent,
  };

  const data = await s3
    .upload(params, (err, data) => {
      if (err) throw err;
      console.log(data.Location);
    })
    .promise();

  const { Location } = data;

  return Location;
};

module.exports = imageUpload;
