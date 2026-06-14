const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  authId: String,
  isUUIDAuth: {
    type: Boolean,
    default: false,
  },
  pluginData: Object,
});

module.exports = mongoose.model("userdata", userSchema);