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

  
  
module.exports = {
  checkAuthorization,
};
