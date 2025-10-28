const db = require("../config/db")
const logger = require('../utils/logger')


exports.addNewDepartment = (req, res) => {
  const { clientId, deptName, coName, coContact, userId, websiteUrl } = req.body;

  // Handle file upload
  let logoFile = null;
  if (req.files && req.files.length > 0) {
    const logo = req.files.find((f) => f.fieldname === "logo");
    if (logo) {
      logoFile = logo.filename; // save filename in DB
    }
  }

  const query = `
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
    db.query(
      query,
      [clientId, deptName, coName, coContact, logoFile, websiteUrl, userId],
      (err, results) => {
        if (err) {
          logger.error(
            `Error in /controller/department/addNewDepartment (query): ${err.message}`
          );
          return res.status(500).json({
            errorCode: 0,
            errorDetail: err.message,
            responseData: {},
            status: "ERROR",
            details: "Failed to create department record",
          });
        }

        res.status(200).json({
          message: "Department created successfully",
          errorCode: 1,
          data: results,
        });
      }
    );
  } catch (error) {
    logger.error(
      `Error in /controller/department/addNewDepartment (try-catch): ${error.message}`
    );
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};

exports.getDepartmentDetails = (req, res) => {
  const { clientId } = req.body;

  // Optional filter: you can restrict by client if needed
  let query = `
    SELECT 
      c.client_name,
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
