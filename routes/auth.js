const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const userData = require('../models/userData');

router.get('/discord', function (req, res, next) {
  res.redirect(`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&scope=identify`);
});

router.get("/discord/callback", async function (req, res, next) {
  const response = await fetch(`${process.env.DISCORD_API_ENDPOINT}/oauth2/token`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
    method: "POST",
  })

  if (!response.ok) {
    return res.status(500).json({ error: "Failed to exchange code for token" });
  }

  const tokens = await response.json();

  const userResponse = await fetch(`${process.env.DISCORD_API_ENDPOINT}/users/@me`, {
    headers: {
      "Authorization": `Bearer ${tokens.access_token}`
    }
  });

  if (!userResponse.ok) {
    return res.status(500).json({ error: "Failed to fetch user data" });
  }

  const discordUser = await userResponse.json();

  try {
    const user = await userData.findOne({ authId: discordUser.id });
    if (!user) {
      await userData.create({
        authId: discordUser.id,
        pluginData: {},
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  jwt.sign({ id: discordUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
    if (err) {
      console.error("JWT generation error:", err);
      return res.status(500).json({ error: "Failed to generate JWT" });
    }
    res.cookie('token', token, { httpOnly: true, sameSite: "none", secure: true });
    res.json({ message: "Authentication successful" });
  });
})

module.exports = router;
