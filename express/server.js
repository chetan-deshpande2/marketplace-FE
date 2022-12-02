const path = require("path");
const express = require("express");
const app = express();
const pathResolve = path.resolve();
const publicPath = path.join(__dirname, "..", "build");

const port = process.env.PORT || 5500;
app.use(express.static(publicPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});
app.listen(port, () => {
  console.log("Server is up!");
});
