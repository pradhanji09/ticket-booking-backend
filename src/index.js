const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./user/routes/index");
const walletRoutes = require("./wallet/routes/index");
const eventRoutes = require("./event/routes/index");
const bookingRoutes = require("./booking/routes/index");
const errorHandler = require("./common/middleware/error.middleware");

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
app.use("/api/events", eventRoutes);
app.use("/api/events", bookingRoutes);

// Centralized error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
