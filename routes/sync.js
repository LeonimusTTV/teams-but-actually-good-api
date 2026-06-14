const express = require('express');
const router = express.Router();
const checkJWT = require('../middleware/auth');
const userData = require('../models/userData');

router.post("/upload", checkJWT, async (req, res) => {
  let { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "Missing data parameter" });
  }

  try {
    JSON.parse(data);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }

  data = JSON.parse(data);

  try {
    const user = await userData.findOne({ authId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.pluginData = data;
    await user.save();

    res.json({ message: "Data uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/download", checkJWT, async (req, res) => {
  try {
    const user = await userData.findOne({ authId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: user.pluginData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
