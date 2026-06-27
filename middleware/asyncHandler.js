/**
 * asyncHandler — wraps an Express async route handler to automatically
 * catch promise rejections and forward them to the centralized error handler.
 *
 * Usage:
 *   export const myController = asyncHandler(async (req, res, next) => {
 *     // No try/catch needed — errors go to errorMiddleware automatically
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
