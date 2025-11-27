// services/adminUser.service.js
const db = require("../config/db");

exports.createAdminUser = async ({ deptId, departmentName, createdBy }) => {
  // Generate random 5-digit empcode
  const empcode = Math.floor(10000 + Math.random() * 90000).toString();

  const name = `${departmentName} Admin`;
  const designation = "Admin";
  const role = 0;
  const reporting = 10000;
  const email = "shailendra.kumar@netcastservice.com";
  const password = `${departmentName}Admin@1234`;
  const created_date = new Date();

  const query = `
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
    createdBy,
    created_date,
  ];

  return await new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) return reject(err);

      resolve({
        userId: result.insertId,
        empcode,
        password,
        email,
        name,
      });
    });
  });
};
