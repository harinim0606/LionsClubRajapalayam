import jwt from "jsonwebtoken";

/**
 * Middleware to protect private routes.
 * Checks for JWT in cookies or Authorization Bearer header.
 */
export const protect = (req, res, next) => {
  let token = null;

  // 1. Retrieve token from cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Retrieve token from Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const error = new Error("Access denied. No token provided.");
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user payload metadata to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      memberId: decoded.memberId || null,
    };
    
    next();
  } catch (err) {
    const error = new Error("Access denied. Invalid or expired token.");
    error.statusCode = 401;
    return next(error);
  }
};

/**
 * Middleware to check user role clearance (RBAC)
 * Must be mounted after the protect middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error("Access denied. Insufficient privileges.");
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
