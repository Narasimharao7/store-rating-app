const express = require("express");
const bcrypt = require("bcrypt");
const { db } = require("../initDB");
const router = express.Router();

// Login
router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.userId = user.id;
  const role = db
    .prepare("SELECT name FROM Roles WHERE id = ?")
    .get(user.role_id).name;
  res.json({ user: { id: user.id, email: user.email, role } });
});

// Logout
router.post("/signout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

// Register Admin
router.post("/signup/admin", (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || !address) {
    return res.status(400).json({ message: "All fields required" });
  }
  if (name.length < 10 || name.length > 60) {
    return res.status(400).json({ message: "Name must be 10-60 characters" });
  }
  if (
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Password must be 8-16 chars, include uppercase and special character",
      });
  }
  if (address.length > 400) {
    return res.status(400).json({ message: "Address max 400 characters" });
  }

  try {
    const existingUser = db
      .prepare("SELECT id FROM Users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare(
      `
      INSERT INTO Users (name, email, password, address, role_id)
      VALUES (?, ?, ?, ?, 1)
    `
    ).run(name, email, hashedPassword, address);
    res.status(201).json({ message: "Admin registered" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Register Store Owner
router.post("/signup/owner", (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || !address) {
    return res.status(400).json({ message: "All fields required" });
  }
  if (name.length < 10 || name.length > 60) {
    return res.status(400).json({ message: "Name must be 10-60 characters" });
  }
  if (
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Password must be 8-16 chars, include uppercase and special character",
      });
  }
  if (address.length > 400) {
    return res.status(400).json({ message: "Address max 400 characters" });
  }

  try {
    const existingUser = db
      .prepare("SELECT id FROM Users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare(
      `
      INSERT INTO Users (name, email, password, address, role_id)
      VALUES (?, ?, ?, ?, 3)
    `
    ).run(name, email, hashedPassword, address);
    res.status(201).json({ message: "Store Owner registered" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Register Normal User
router.post("/signup/user", (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || !address) {
    return res.status(400).json({ message: "All fields required" });
  }
  if (name.length < 10 || name.length > 60) {
    return res.status(400).json({ message: "Name must be 10-60 characters" });
  }
  if (
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Password must be 8-16 chars, include uppercase and special character",
      });
  }
  if (address.length > 400) {
    return res.status(400).json({ message: "Address max 400 characters" });
  }

  try {
    const existingUser = db
      .prepare("SELECT id FROM Users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare(
      `
      INSERT INTO Users (name, email, password, address, role_id)
      VALUES (?, ?, ?, ?, 2)
    `
    ).run(name, email, hashedPassword, address);
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

module.exports = router;
