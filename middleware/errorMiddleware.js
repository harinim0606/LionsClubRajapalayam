/**
 * Centralized Express Error Handling Middleware
 * Ensures every API error returns the standard JSON failure format:
 * { "success": false, "message": "Description of the error" }
 */
const isProduction = process.env.NODE_ENV === "production";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  // Always log the error internally (with full details)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
    if (!isProduction) console.error(err.stack);
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  }

  // Build the response — NEVER expose stack traces to the client
  const response = {
    success: false,
    message: statusCode >= 500 && isProduction
      ? "An internal server error occurred. Please try again later."
      : err.message || "Internal Server Error",
  };

  // Include validation errors if present (e.g., from Mongoose)
  if (err.errors && typeof err.errors === "object") {
    response.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
