const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const clientRoutes = require("./routes/client.route");
const dashboardRoutes = require("./routes/dashboard.route");
const monthlyCampRoutes = require("./routes/monthlyCamps.route")
const deptRoutes = require("./routes/department.route")
const employeeRoutes = require("./routes/employee.route");
const drRoutes = require("./routes/doctor.route");
const basicRoutes = require("./routes/basic.route");
const userDashboardRoutes = require("./routes/userDashboard.route");

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
app.use("/monthlyCamps",monthlyCampRoutes);
app.use("/department",deptRoutes);
app.use("/dashboard",dashboardRoutes);
app.use("/employee",employeeRoutes);
app.use("/client",clientRoutes);
app.use("/basic",basicRoutes);
app.use("/auth", authRoutes);
app.use("/doc",drRoutes);

const PORT = process.env.PORT || 8035;

app.listen(PORT, async () => {
  try {
    console.log(`listining on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});