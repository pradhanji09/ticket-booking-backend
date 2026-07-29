const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./user/routes/index");

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", userRoutes);

// DB Connection
connectDB();

// Routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
