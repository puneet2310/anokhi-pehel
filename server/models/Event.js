const mongoose = require("mongoose");

const { Schema } = mongoose;

const EventSchema = new Schema({
    eventGroup:{
      type:String,
      required:true,
    },
  eventName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(), // auto-set current year
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  coordinator: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  regNumber: {
    type: String,
    required: true,
  },
  festName: {
    type: String,
    required: true,
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Participant" 
  }],
h6to8firstPlace:{
    type: String,
    required: false,
  },
  h6to8secondPlace:{
    type: String,
    required: false,
  },
  h6to8thirdPlace:{
    type: String,
    required: false,
  },
  h6to8fourthPlace:{
    type: String,
    required: false,
  },
  h9to12firstPlace:{
    type: String,
    required: false,
  },
  h9to12secondPlace:{
    type: String,
    required: false,
  },
  h9to12thirdPlace:{
    type: String,
    required: false,
  },
  h9to12fourthPlace:{
    type: String,
    required: false,
  },
  e6to8firstPlace:{
    type: String,
    required: false,
  },
  e6to8secondPlace:{
    type: String,
    required: false,
  },
  e6to8thirdPlace:{
    type: String,
    required: false,
  },
  e6to8fourthPlace:{
    type: String,
    required: false,
  },
  e9to12firstPlace:{
    type: String,
    required: false,
  },
  e9to12secondPlace:{
    type: String,
    required: false,
  },
  e9to12thirdPlace:{
    type: String,
    required: false,
  },
  e9to12fourthPlace:{
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Event", EventSchema);
