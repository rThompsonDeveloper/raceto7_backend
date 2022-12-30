const mongoose = require("mongoose");

const PlacesSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.String },
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
});

module.exports = Places = mongoose.model("places", PlacesSchema);
