const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Roles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      address TEXT NOT NULL,
      role_id INTEGER,
      FOREIGN KEY (role_id) REFERENCES Roles(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      owner_id INTEGER,
      FOREIGN KEY (owner_id) REFERENCES Users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      FOREIGN KEY (store_id) REFERENCES Stores(id),
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);
  db.run(
    'INSERT OR IGNORE INTO Roles (id, name) VALUES (1, "System Administrator"), (2, "Normal User"), (3, "Store Owner")'
  );
});

module.exports = { db };
