const mongoose = require("mongoose");

const { Schema } = mongoose;

const testResultSchema = new Schema({
  totalMarks: {
    type: Number,
    min: 0,
    max: 100,
  },
  score: {
    type: Number,
    required: true,
    min: -1,
    max: 100,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  fileId: {
    type: String, // Add this field to store the Google Drive file ID
    required: true,
  }
});

const performanceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    className : {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    
    tests: [testResultSchema],
  },
  { timestamps: true }
);

performanceSchema.index({ student: 1, subject: 1, className: 1 }, { unique: true });

module.exports = mongoose.model("Test", performanceSchema);