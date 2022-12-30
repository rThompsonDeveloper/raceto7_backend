const express = require("express");
const connectDB = require("./config/db");

const app = express();

var http = require("http").createServer(app);
var io = require("socket.io")(http);

// Connect DB
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("api running"));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/tournaments", require("./routes/api/tournaments"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/follow", require("./routes/api/follow"));
app.use("/api/match", require("./routes/api/match"));
app.use("/api/message", require("./routes/api/message"));
app.use("/api/newsFeed", require("./routes/api/newsFeed"));
app.use("/api/upload", require("./routes/api/upload"));
app.use("/api/places", require("./routes/api/places"));

http.listen(PORT, () => {
  var host = http.address().address;
  var port = http.address().port;
  console.log("App listening at http://%s:%s", host, port);
});

let onlineUsers = [];

io.on("connection", function (socket) {
  socket.on("disconnect", () => {
    // find index of user and remove user from online users list
    const onlineUser = onlineUsers.find((user) => user.socket == socket.id);
    if (onlineUser) {
      sendToFollowers("follower offline", onlineUser.userId);
      onlineUsers.filter((user) => user.socket !== socket.id);
    }
  });

  const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId == userId);
  };

  socket.on("chat message", (msgData) => {
    const { receiver } = msgData;
    const user = getUser(receiver);
    if (user) io.to(user.socket).emit("message received", msgData);
  });

  const sendToFollowers = (msg, data) => {
    // find user data from socket array
    const user = onlineUsers.find((user) => user.socket === socket.id);
    user.followedBy.forEach((follower) => {
      const onlineUser = getUser(follower);
      if (onlineUser) io.to(onlineUser.socket).emit(msg, data);
    });
  };

  socket.on("send notification", (notification) => {
    sendToFollowers("add notification", notification);
  });

  socket.on("set socket id", (userData) => {
    const { id, name, photo } = userData;

    // parse following data
    const followData = JSON.parse(userData.followData);

    // destructure followingdata
    const { following = [], followedBy = [] } = followData;

    const onlineUser = {
      socket: socket.id,
      userId: id,
      name: name,
      photo: photo,
      followedBy: followedBy,
    };

    onlineUsers.push(onlineUser);

    // create a variable to contain all followers that are online
    const followersOnline = [];

    // loop through each follower and determine which ones are online and return the final list to the user
    following.forEach((follower) => {
      const followerOnline = getUser(follower);
      if (followerOnline) followersOnline.push(followerOnline);
    });

    // Loop through everyone following you and tell them that you are online
    sendToFollowers("follower online", onlineUser);

    io.to(socket.id).emit("online users fetched", followersOnline);
  });
});
