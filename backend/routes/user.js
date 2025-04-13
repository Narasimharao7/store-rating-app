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
  if (user.role_id !== 2) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
});

router.get("/stores", (req, res) => {
  const { name } = req.query;
  const userId = req.session.userId;
  const stores = db
    .prepare(
      `
    SELECT s.id, s.name, s.address,
           AVG(r.rating) AS avg_rating,
           (SELECT rating FROM Ratings WHERE store_id = s.id AND user_id = ?) AS user_rating
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    WHERE (? IS NULL OR s.name LIKE ?)
    GROUP BY s.id
  `
    )
    .all(userId, name ? `%${name}%` : null, name ? `%${name}%` : null);
  res.json(stores);
});

router.post("/ratings", (req, res) => {
  const { storeId, rating } = req.body;
  if (!storeId || !rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Valid store ID and rating (1-5) required" });
  }
  try {
    db.prepare(
      `
      INSERT INTO Ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
    `
    ).run(req.session.userId, storeId, rating);
    res.status(201).json({ message: "Rating submitted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

router.post("/password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords required" });
  }
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    !/[A-Z]/.test(newPassword) ||
    !/[^A-Za-z0-9]/.test(newPassword)
  ) {
    return res
      .status(400)
      .json({
        message:
          "New password must be 8-16 chars, include uppercase and special character",
      });
  }
  try {
    const user = db
      .prepare("SELECT password FROM Users WHERE id = ?")
      .get(req.session.userId);
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE Users SET password = ? WHERE id = ?").run(
      hashedPassword,
      req.session.userId
    );
    res.json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: "Password update failed" });
  }
});

module.exports = router;
