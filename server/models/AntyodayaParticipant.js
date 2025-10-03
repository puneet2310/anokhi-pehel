const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  phone: { type: String, required: true },
  school: { type: String, required: true },
  address: { type: String, required: true },
  photo: { type: String, required: true }, // Assuming this stores the path or URL of the uploaded file
  poc: { type: mongoose.Schema.Types.ObjectId, ref: "PointOfContact" }, // Assuming POC is another model
  events: [{ type: String }],
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
});

const Participant = mongoose.model("Participant", ParticipantSchema);
module.exports = Participant;
