const express = require("express");
const serverless = require("serverless-http");
const bcrypt = require("bcrypt");
const { db } = require("../backend/initDB");

const app = express();
app.use(express.json());

app.post("/signup-admin", (req, res) => {
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

module.exports.handler = serverless(app);
