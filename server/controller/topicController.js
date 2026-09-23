const Topic = require("../models/Topic");

const getTopicCovered = async (req, res) => {
  const { classId, date } = req.query;
  const targetDate = date
    ? (typeof date === "string" && date.includes("T") ? date.split("T")[0] : date)
    : new Date().toISOString().split("T")[0];

  try {
    const topicsCovered = await Topic.find({
      classId,
      date: {
        $gte: new Date(targetDate),
        $lt: new Date(targetDate + "T23:59:59.999Z"),
      },
    });

    res.status(200).json({ topicsCovered });
  } catch (error) {
    console.error("Error fetching topics covered:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getTopicCovered,
};

