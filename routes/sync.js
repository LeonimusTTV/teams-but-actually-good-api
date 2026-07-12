const express = require('express');
const router = express.Router();
const checkJWT = require('../middleware/auth');
const userData = require('../models/userData');

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function stripDangerousKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripDangerousKeys);
  }

  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      clean[key] = stripDangerousKeys(val);
    }
    return clean;
  }

  return value;
}

router.post("/upload", checkJWT, async (req, res) => {
  console.log("sync upload request received");
  let { data } = req.body;

  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: "Missing data parameter" });
  }

  try {
    data = JSON.parse(data);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: "data must be a JSON object" });
  }

  data = stripDangerousKeys(data);

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
