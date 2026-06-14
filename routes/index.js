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

module.exports = router;
