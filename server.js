const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 PASTE YOUR MONGODB LINK BELOW (inside quotes)
mongoose.connect("mongodb+srv://dhruvgarg086_db_user:NgZ30b8pO2utqiXG@cluster0.kekvewg.mongodb.net/?appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Simple test route
app.get("/", (req, res) => {
  res.send("Family Finance Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
