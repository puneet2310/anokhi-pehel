const express = require("express");
const Topic = require("../models/Topic");
const { getTopicCovered } = require("../controller/topicController");
const router = express.Router();


// Endpoint to add a topic covered
router.post("/topicCovered", async (req, res) => {
  try {
    const { classId, date, mentorId, topic, subject } = req.body;
    // Validate input data (you may want to add more robust validation)
    if (!classId || !date || !mentorId || !topic || !subject) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Check if a topic with the same date and class already exists
    const existingTopic = await Topic.findOne({ classId, date });
    if (existingTopic) {
      // If it exists, update the topic details
      existingTopic.subject = subject;
      existingTopic.mentorId = mentorId;
      existingTopic.topic = topic;

      await existingTopic.save();

      return res.json("Updated");
    } else {
      // If it doesn't exist, create a new topic object and add it to the list
      const newTopic = new Topic({
        classId,
        date,
        subject,
        mentorId,
        topic,
      });

      await newTopic.save();

      return res.json("Added");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/topics", async (req, res) => {
  try {
    const { classId, subject } = req.query;

    const topics = await Topic.find({ classId, subject });

    res.json({ topics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/topicCovered", getTopicCovered);

module.exports = router;
