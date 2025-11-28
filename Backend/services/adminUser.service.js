// services/adminUser.service.js
const db = require("../config/db");

exports.createAdminUser = async ({ deptId, departmentName, createdBy }) => {
  if (!deptId || !departmentName) {
    throw new Error("deptId and departmentName are required");
  }

  // 1️⃣ Check if admin already exists
  const checkQuery = `
    SELECT user_id, empcode, name 
    FROM user_mst 
    WHERE dept_id = ?
      AND designation = 'Admin'
      AND status = 'Y'
    LIMIT 1;
  `;

  const existingAdmin = await new Promise((resolve, reject) => {
    db.query(checkQuery, [deptId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

  if (existingAdmin.length > 0) {
    // Return existing admin without creating new one
    return {
      alreadyExists: true,
      userId: existingAdmin[0].user_id,
      empcode: existingAdmin[0].empcode,
      name: existingAdmin[0].name,
    };
  }

  // 2️⃣ Generate random 5-digit empcode
  const empcode = Math.floor(10000 + Math.random() * 90000).toString();

  // 3️⃣ Default data
  const name = `${departmentName} Admin`;
  const designation = "Admin";
  const role = 0;
  const reporting = 10000;
  const email = "shailendra.kumar@netcastservice.com";
  const password = `${departmentName}Admin@1234`;
  const created_date = new Date();

  const insertQuery = `
    INSERT INTO user_mst 
      (empcode, name, designation, role, dept_id, reporting, email, password, status, created_by, created_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Y', ?, ?)
  `;

  const params = [
    empcode,
    name,
    designation,
    role,
    deptId,
    reporting,
    email,
    password,
    createdBy || null,
    created_date
  ];

  const result = await new Promise((resolve, reject) => {
    db.query(insertQuery, params, (err, output) => {
      if (err) return reject(err);
      resolve(output);
    });
  });

  return {
    alreadyExists: false,
    userId: result.insertId,
    empcode,
    password,
    email,
    name,
  };
};
