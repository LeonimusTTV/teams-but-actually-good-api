const express = require('express');
const router = express.Router();
const checkJWT = require('../middleware/auth');


router.get("/isLoggedIn", checkJWT, (req, res) => {
  if (req.user) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    // that should never happen because checkJWT will return 401 if the token is invalid or missing, but just in case
    res.json({ loggedIn: false });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Teams But Actually Good API (v1)! Check out the website https://teamsbutactuallygood.dev, the doc: https://docs.teamsbutactuallygood.dev/ and the GitHub: https://github.com/LeonimusTTV/teams-but-actually-good" });
})

module.exports = router;
