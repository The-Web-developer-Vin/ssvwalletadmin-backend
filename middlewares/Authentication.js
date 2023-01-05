const jwt = require("jsonwebtoken");

const config = process.env;

module.exports = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    let bearer = token.split(" ");
    let bearerToken = bearer[1];
    if (!bearerToken) {
      return res.status(403).send({
        code: 403,
        message: "Authentication failed, token required",
        data: null,
      });
    }
    const decoded = jwt.verify(bearerToken, config.JWT_TOKEN_KEY);
    req.userAuthId = decoded.authId;
    console.log(decoded,"decoded")
  } catch (err) {
    return res.status(401).send({ code: 401, message: "Unauthorized Token", status: false });
  }
  return next();
};