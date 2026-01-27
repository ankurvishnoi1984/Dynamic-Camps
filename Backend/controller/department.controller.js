const db = require("../config/db")
const logger = require('../utils/logger')

const { createAdminUser } = require("../services/adminUser.service");
const { sendAdminCredentialsMail } = require("../services/mail.service");


exports.addNewDepartment = async (req, res) => {
  const { clientId, deptName, coName, coContact, userId, websiteUrl } = req.body;

  let logoFile = null;
  if (req.files && req.files.length > 0) {
    const logo = req.files.find((f) => f.fieldname === "logo");
    if (logo) logoFile = logo.filename;
  }

  const insertDeptQuery = `
    INSERT INTO department_mst (
      client_id,
      dept_name,
      coordinator_name,
      coordinator_contact,
      dept_logo,
      website_url,
      created_by
    )
    VALUES (?,?,?,?,?,?,?)
  `;

  try {
    // 1️⃣ Insert department
    const deptResult = await new Promise((resolve, reject) => {
      db.query(
        insertDeptQuery,
        [clientId, deptName, coName, coContact, logoFile, websiteUrl, userId],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });

    const deptId = deptResult.insertId;

    // 2️⃣ Create Admin Employee for this department
    const adminData = await createAdminUser({
      deptId,
      departmentName: deptName,
      createdBy: userId,
    });

    // 3️⃣ Send admin credentials email
    await sendAdminCredentialsMail({
      to: adminData.email,        // shailendra.kumar@netcastservice.com
      empcode: adminData.empcode,
      password: adminData.password,
      deptName: deptName,
    });

    // 4️⃣ Final Response
    return res.status(200).json({
      message: "Department & Admin created successfully",
      errorCode: 1,
      departmentId: deptId,
      adminUser: adminData,
    });

  } catch (err) {
    logger.error(`Error in addNewDepartment: ${err.message}`);

    return res.status(500).json({
      status: "ERROR",
      errorDetail: err.message,
       errorCode: 0,
    });
  }
};

exports.getDepartmentDetails = (req, res) => {
  const { clientId,searchKeyword } = req.body;

  // Optional filter: you can restrict by client if needed
  let query = `
    SELECT 
      c.client_name,
      d.client_id,
      d.dept_logo,
      d.dept_id,
      d.dept_name,
      d.website_url,
      d.coordinator_name AS dept_coordinator_name,
      d.coordinator_contact AS dept_coordinator_contact,
      d.created_at AS dept_created_at
    FROM department_mst d
    INNER JOIN client_mst c ON d.client_id = c.client_id
    WHERE c.status = 'Y' AND d.status = 'Y'
  `;

  const params = [];

  if (clientId) {
    query += ` AND d.client_id = ?`;
    params.push(clientId);
  }
   if (searchKeyword && searchKeyword.trim() !== ""){
    query += ` AND LOWER(d.dept_name) LIKE ?`;
    params.push(`%${searchKeyword.trim().toLowerCase()}%`);
   }

  query += ` ORDER BY d.created_at DESC`;

  try {
    db.query(query, params, (err, results) => {
      if (err) {
        logger.error(`Error in /controller/department/getDepartmentDetails (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "Failed to fetch department details",
        });
      }

      res.status(200).json({
        message: "Department details fetched successfully",
        errorCode: 1,
        data: results,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/department/getDepartmentDetails (try-catch): ${error.message}`);
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};

// controller/departmentController.js
exports.updateDepartment = (req, res) => {
  const { deptId, clientId, deptName, coName, coContact, userId, websiteUrl } = req.body;

  // Handle optional logo upload
  let logoFile = null;
  if (req.files && req.files.length > 0) {
    const logo = req.files.find((f) => f.fieldname === "logo");
    if (logo) {
      logoFile = logo.filename;
    }
  }

  const query = logoFile
    ? `
        UPDATE department_mst
        SET
          client_id = ?,
          dept_name = ?,
          coordinator_name = ?,
          coordinator_contact = ?,
          dept_logo = ?,
          website_url = ?,
          modified_by = ?,
          modified_date = NOW()
        WHERE dept_id = ?
      `
    : `
        UPDATE department_mst
        SET
          client_id = ?,
          dept_name = ?,
          coordinator_name = ?,
          coordinator_contact = ?,
          website_url = ?,
          modified_by = ?,
          modified_date = NOW()
        WHERE dept_id = ?
      `;

  const params = logoFile
    ? [clientId, deptName, coName, coContact, logoFile, websiteUrl, userId, deptId]
    : [clientId, deptName, coName, coContact, websiteUrl, userId, deptId];

  try {
    db.query(query, params, (err, result) => {
      if (err) {
        logger.error(`Error in /controller/department/updateDepartment: ${err.message}`);
        return res.status(500).json({
          status: "ERROR",
          errorCode: 0,
          errorDetail: err.message,
          message: "Failed to update department",
        });
      }

      res.status(200).json({
        message: "Department updated successfully",
        errorCode: 1,
        data: result,
      });
    });
  } catch (error) {
    logger.error(
      `Error in /controller/department/updateDepartment (try-catch): ${error.message}`
    );
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};

exports.getDepartmentPermissions = (req, res) => {
  const { dept_id } = req.body;

  if (!dept_id) {
    return res.status(400).json({
      errorCode: "0",
      errorDetail: "dept_id is required",
      responseData: {},
      status: "ERROR",
      details: "BAD_REQUEST",
      getMessageInfo: "dept_id is required"
    });
  }

  const query = `
    SELECT view_poster, view_camp
    FROM department_mst
    WHERE dept_id = ?
  `;

  db.query(query, [dept_id], (err, result) => {
    if (err) {
      logger.error(`Error in getDepartmentPermissions: ${err.message}`);
      return res.status(500).json({
        errorCode: "0",
        errorDetail: err.message,
        responseData: {},
        status: "ERROR",
        details: "INTERNAL_SERVER_ERROR",
        getMessageInfo: "Internal server error"
      });
    }

    if (!result.length) {
      return res.status(404).json({
        errorCode: "0",
        errorDetail: "Department not found",
        responseData: {},
        status: "ERROR",
        details: "NOT_FOUND",
        getMessageInfo: "Department not found"
      });
    }

    return res.json({
      errorCode: "1",
      errorDetail: "",
      responseData: {
        view_poster: result[0].view_poster,
        view_camp: result[0].view_camp
      },
      status: "SUCCESS",
      details: "",
      getMessageInfo: ""
    });
  });
};
