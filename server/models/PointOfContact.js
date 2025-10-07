const mongoose = require("mongoose");
const { Schema } = mongoose;

const POCSchema = new Schema({
  nameOfPoc: {
    type: String,
    required: false,
  },
  contact: {
    type: String,
    required: false,
  },
  school: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(), // auto-set current year
  },
});

module.exports = mongoose.model("POC", POCSchema);
