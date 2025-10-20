import jwt from "jsonwebtoken";

export const jwt_verify = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Get the actual token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.userId = decoded.id; // attach payload to req (NOT res)
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
