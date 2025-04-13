const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.post("/signout", (req, res) => {
  res.json({ message: "Logged out" });
});

module.exports.handler = serverless(app);
