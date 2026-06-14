const jwt = require('jsonwebtoken');

function checkJWT(req, res, next) {
  const token = req.headers['authorization'] || (req.cookies['token'] && req.cookies['token'].replace("token=", ""));

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  console.log(token)

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = checkJWT;