const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./user/routes/index");
const walletRoutes = require("./wallet/routes/index");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
connectDB();

// Routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoutes);
app.use("/api/wallet", walletRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
