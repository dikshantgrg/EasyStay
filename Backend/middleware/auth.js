var jwt = require("jsonwebtoken");

const checkAuthorization = (req, res, next) => {
  let token = req.headers.authorization?.replace("Bearer ", "");
  let isloggedIn = false;

  try {
    var decoded = jwt.verify(token, "shhhhh");
    req.user = decoded;
    //   console.log(req.user);

    isloggedIn = true;
  } catch {}

  if (isloggedIn) {
    next();
  } else {
    res.status(401).send({
      msg: "Unauthorized",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).send({
      msg: "Forbidden",
    });
  }
};

const isHost = (req, res, next) => {
  if (req.user.role === "host") {
    next();
  } else {
    res.status(403).send({
      msg: "Only hosts can access this route",
    });
  }
};

const isUser = (req, res, next) => {
  if (req.user.role === "user") {
    next();
  } else {
    res.status(403).send({
      msg: "Only users can access this route",
    });
  }
};
module.exports = {
  checkAuthorization,
  isAdmin,
  isHost, 
  isUser,
};
