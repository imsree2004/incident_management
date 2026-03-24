<<<<<<< HEAD
import jwt from "jsonwebtoken";

// ✅ AUTH middleware
export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ ADMIN check
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
=======
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ message: 'Token required' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(403).json({ message: 'Invalid token format' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.log('✅ Token verified:', decoded);
    req.user = decoded;
    next();
  });
};
>>>>>>> e350c6a70503b801a65d323abe7b1da8e73181d8
