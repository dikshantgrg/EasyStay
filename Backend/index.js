const express = require("express");
const app = express();
const handleServerError = require("./middleware/handleServerError.js");
require("./config/database.js");
const authRoutes = require("./routes/auth.js");
const propertyRoutes = require("./routes/property.js");
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");
const reviewRoutes = require("./routes/Review.js");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { startStatusUpdateScheduler } = require("./controller/booking.js");

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static("uploads"));
app.use(express.static("uploads/properties"));
app.use(express.static("uploads/govt_ids"));
app.use(authRoutes);
app.use(propertyRoutes);
app.use(userRoutes);
app.use(bookingRoutes);
app.use(reviewRoutes);

startStatusUpdateScheduler();
// const bcrypt = require('bcrypt');
// const hash = bcrypt.hashSync("Admin123456", 10);
// console.log(hash);

app.use((req, res) => {
  try {
    res.status(404).send({ msg: "Resource not found" });
    console.log(res)
  } catch (error) {
    console.log(error);
  }
});
app.use(handleServerError);

app.listen(8000, () => {
  console.log("server started at 8000....");
});
