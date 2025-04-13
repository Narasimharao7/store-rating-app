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
  if (user.role_id !== 3) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
});

router.get("/ratings", (req, res) => {
  const ratings = db
    .prepare(
      `
    SELECT u.name, r.rating
    FROM Ratings r
    JOIN Stores s ON r.store_id = s.id
    JOIN Users u ON r.user_id = u.id
    WHERE s.owner_id = ?
  `
    )
    .all(req.session.userId);
  res.json(ratings);
});

router.get("/average-rating", (req, res) => {
  const result = db
    .prepare(
      `
    SELECT AVG(r.rating) AS averageRating
    FROM Ratings r
    JOIN Stores s ON r.store_id = s.id
    WHERE s.owner_id = ?
  `
    )
    .get(req.session.userId);
  res.json({ averageRating: result.averageRating || 0 });
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
