function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Image must be smaller than 2 MB";
  }

  if (err.code === 11000) {
    status = 400;
    message = "This value already exists";
  }

  if (status === 500) console.log(err);

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
