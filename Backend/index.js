const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const clientRoutes = require("./routes/client.route");
const dashboardRoutes = require("./routes/dashboard.route");

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
app.use("/client",clientRoutes);
app.use("/dashboard",dashboardRoutes);

const PORT = process.env.PORT || 8035;

app.listen(PORT, async () => {
  try {
    console.log(`listining on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});