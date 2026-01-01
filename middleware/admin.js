import jwt from "jsonwebtoken";

export const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "Access denied. Not an admin." });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
