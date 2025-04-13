const express = require("express");
const serverless = require("serverless-http");
const bcrypt = require("bcrypt");
const { db } = require("../backend/initDB");

const app = express();
app.use(express.json());

app.post("/signin", (req, res) => {
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

  const role = db
    .prepare("SELECT name FROM Roles WHERE id = ?")
    .get(user.role_id).name;
  res.json({ user: { id: user.id, email: user.email, role } });
});

module.exports.handler = serverless(app);
