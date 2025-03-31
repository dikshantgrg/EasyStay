const handleServerError = (error, req, res, next) => {
  console.error(error); // Log the error for debugging

  // Handle Joi validation errors
  if (error.isJoi) {
    return res.status(400).send({
      msg: "Validation error (Joi)",
      error: error.details.map((detail) => detail.message), // Extract error messages
    });
  }

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    return res.status(400).send({
      msg: "Validation error (Mongoose)",
      error: Object.values(error.errors).map((err) => err.message), // Extract error messages
    });
  }

  // Handle other errors
  res.status(500).send({
    msg: "Server error",
    error: error.message || "An unexpected error occurred",
  });
};

module.exports = handleServerError;
