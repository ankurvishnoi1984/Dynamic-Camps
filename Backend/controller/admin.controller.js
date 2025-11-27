// controllers/admin.controller.js

const { createAdminUser } = require("../services/adminUser.service");
const { sendAdminCredentialsMail } = require("../services/mail.service");
const db = require("../config/db");

exports.createAdminIfMissing = async (req, res) => {
   
   // Sample request
    /* {
  "deptId": 3,
  "departmentName": "Cipla",
  "createdBy": 140
}*/

  const { deptId, departmentName, createdBy } = req.body;

  if (!deptId) {
    return res.status(400).json({
      success: false,
      message: "deptId is required"
    });
  }

  if (!departmentName) {
    return res.status(400).json({
      success: false,
      message: "departmentName is required"
    });
  }

  try {
    // 1️⃣ Check if Admin already exists for this department
    const checkQuery = `
      SELECT user_id, empcode, name 
      FROM user_mst
      WHERE dept_id = ?
        AND designation = 'Admin'
        AND status = 'Y'
      LIMIT 1;
    `;

    const existing = await new Promise((resolve, reject) => {
      db.query(checkQuery, [deptId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Admin already exists for this department",
        admin: existing[0]
      });
    }

    // 2️⃣ Create Admin User
    const adminData = await createAdminUser({
      deptId,
      departmentName,
      createdBy,
    });

    // 3️⃣ Send Email with CC
    await sendAdminCredentialsMail({
      to: adminData.email,
      empcode: adminData.empcode,
      password: adminData.password,
      deptName: departmentName,
    });

    // 4️⃣ Success Response
    return res.status(200).json({
      success: true,
      message: "Admin created successfully",
      adminDetails: adminData,
    });

  } catch (error) {
    logger.error(`Error in createAdminIfMissing: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error creating admin for existing department",
      error: error.message,
    });
  }
};
