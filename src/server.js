const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("SoleMate API"));
app.listen(3000);