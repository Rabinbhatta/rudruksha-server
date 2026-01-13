import jwt from "jsonwebtoken";

// Optional JWT verification - doesn't fail if no token is provided
// Used for routes that allow both authenticated and guest access
export const optional_jwt_verify = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]; // Get the actual token
      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decoded.id; // attach payload to req if token is valid
      } catch (error) {
        // Token is invalid, but we don't fail - just continue without userId
      }
    }
    // If no token, continue without setting userId (guest checkout)
    next();
  } catch (error) {
    // Even if something goes wrong, continue (for guest checkout)
    next();
  }
};
