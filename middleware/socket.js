const io = require("socket.io")();

module.exports = io
  .use(function (socket, next) {
    // execute some code
    next();
  })
  .on("connection", function (socket) {
    // Connection now authenticated to receive further events

    socket.on("message", function (message) {
      io.emit("message", message);
    });
  });
