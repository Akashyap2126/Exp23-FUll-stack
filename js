const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// 🔐 Hardcoded user (for simplicity)
const user = {
  id: 1,
  username: "testuser",
  password: "password123", // in real projects, use bcrypt to hash passwords!
};

// 🧾 Login Route (issues JWT)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Basic credential check
  if (username === user.username && password === user.password) {
    // Create token payload
    const payload = { id: user.id, username: user.username };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// 🧱 JWT Middleware (verifies token)
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Get token after "Bearer"

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded; // Store decoded info in request
    next();
  });
}

// 🔒 Protected Route
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to protected route!",
    user: req.user,
  });
});

// 🌐 Public Route
app.get("/", (req, res) => {
  res.send("Welcome! Try POST /login and then GET /protected with your token.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
