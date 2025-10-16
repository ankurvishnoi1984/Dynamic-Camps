const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const campRoutes = require("./routes/camp");
const basicRoutes = require("./routes/basic")
const dashRoutes= require("./routes/dashboard")
const reportRoutes = require("./routes/reports")
const docRoutes = require("./routes/doctor")
const adminDashboardRoutes = require("./routes/adminDashboard")
const monthlyCampRoutes = require("./routes/monthlyCamps")
const path = require('path');


// Middleware and configuration
const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache");
  next();
});


//Auth Routes
app.use("/auth", authRoutes);

//Camp Routes
app.use("/camp",campRoutes)

//Basic Routes
app.use("/basic",basicRoutes)

// Dashboard Routes
app.use("/dashboard",dashRoutes)

// Report Routes
app.use("/reports",reportRoutes)

// Doctor Routes
app.use("/doc",docRoutes)

// Admin Routes
app.use("/admin",adminDashboardRoutes)

// Monthly Camp Routes
app.use("/monthlyCamps",monthlyCampRoutes)

const PORT = process.env.PORT || 8035;

app.listen(PORT, async () => {
  try {
    console.log(`listining on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});