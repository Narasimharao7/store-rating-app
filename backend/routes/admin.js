const express = require("express");
const { db } = require("../initDB");
const router = express.Router();

router.use((req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = db
    .prepare("SELECT role_id FROM Users WHERE id = ?")
    .get(req.session.userId);
  if (user.role_id !== 1) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
});

router.get("/dashboard", (req, res) => {
  const userCount = db
    .prepare("SELECT COUNT(*) AS count FROM Users")
    .get().count;
  const storeCount = db
    .prepare("SELECT COUNT(*) AS count FROM Stores")
    .get().count;
  const ratingCount = db
    .prepare("SELECT COUNT(*) AS count FROM Ratings")
    .get().count;
  res.json({ userCount, storeCount, ratingCount });
});

router.get("/users", (req, res) => {
  const { name } = req.query;
  const users = db
    .prepare(
      `
    SELECT u.id, u.name, u.email, u.address, r.name AS role
    FROM Users u
    JOIN Roles r ON u.role_id = r.id
    WHERE (? IS NULL OR u.name LIKE ?)
  `
    )
    .all(name ? `%${name}%` : null, name ? `%${name}%` : null);
  res.json(users);
});

router.get("/stores", (req, res) => {
  const { name } = req.query;
  const stores = db
    .prepare(
      `
    SELECT s.id, s.name, s.email, s.address, AVG(r.rating) AS avg_rating
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    WHERE (? IS NULL OR s.name LIKE ?)
    GROUP BY s.id
  `
    )
    .all(name ? `%${name}%` : null, name ? `%${name}%` : null);
  res.json(stores);
});

router.post("/stores", (req, res) => {
  const { name, email, address, ownerId } = req.body;
  if (!name || !email || !address || !ownerId) {
    return res.status(400).json({ message: "All fields required" });
  }
  try {
    db.prepare(
      `
      INSERT INTO Stores (name, email, address, owner_id)
      VALUES (?, ?, ?, ?)
    `
    ).run(name, email, address, ownerId);
    res.status(201).json({ message: "Store added" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add store" });
  }
});

module.exports = router;
