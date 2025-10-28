const db = require("../config/db")
const logger = require('../utils/logger')

exports.getRecentClientDetails = (req, res) => {
  const query = `
    SELECT 
      c.client_name,
      d.dept_name,
      c.coordinator_name,
      d.created_at AS created_date
    FROM department_mst d
    INNER JOIN client_mst c ON d.client_id = c.client_id
    WHERE c.status = 'Y' AND d.status = 'Y'
    ORDER BY d.created_at DESC
  `;

  try {
    db.query(query, (err, results) => {
      if (err) {
        logger.error(`Error in /controller/client/getClientDepartmentDetails (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch client-department details",
        });
      }

      res.status(200).json({
        message: "Client and department details fetched successfully",
        errorCode: 1,
        data: results,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/client/getClientDepartmentDetails (catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
};

exports.getRecentCampDetails = (req, res) => {
  const query = `
    SELECT 
      c.client_name,
      d.dept_name,
      m.camp_name,
      m.start_date,
      m.end_date
    FROM monthly_camp_mst m
    INNER JOIN department_mst d ON m.dept_id = d.dept_id
    INNER JOIN client_mst c ON d.client_id = c.client_id
    WHERE m.status = 'Y' 
      AND d.status = 'Y' 
      AND c.status = 'Y'
    ORDER BY m.start_date DESC
  `;

  try {
    db.query(query, (err, results) => {
      if (err) {
        logger.error(`Error in /controller/camps/getRecentCamps (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch recent camps",
        });
      }

      res.status(200).json({
        message: "Recent camps fetched successfully",
        errorCode: 1,
        data: results,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/camps/getRecentCamps (catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
};

exports.totalCountDetails = (req, res) => {
  const totalEmployeeQuery = `
    SELECT COUNT(*) AS totalEmployees
    FROM user_mst
    WHERE status = 'Y';
  `;

  const totalClientsQuery = `
    SELECT COUNT(*) AS totalClients
    FROM client_mst
    WHERE status = 'Y';
  `;

  const totalDeptQuery = `
    SELECT COUNT(*) AS totalDepartments
    FROM department_mst
    WHERE status = 'Y';
  `;

  const totalCampsQuery = `
    SELECT COUNT(*) AS totalCamps
    FROM monthly_camp_mst
    WHERE is_active = 'Y'
      AND status = 'Y';
  `;

  try {
    // Execute all queries in parallel for better performance
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(totalEmployeeQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result[0].totalEmployees);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(totalClientsQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result[0].totalClients);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(totalDeptQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result[0].totalDepartments);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(totalCampsQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result[0].totalCamps);
        });
      }),
    ])
      .then(([totalEmployees, totalClients, totalDepartments, totalCamps]) => {
        res.status(200).json({
          message: "Total count details fetched successfully",
          errorCode: 1,
          data: {
            totalEmployees,
            totalClients,
            totalDepartments,
            totalCamps,
          },
        });
      })
      .catch((err) => {
        logger.error(`Error in /controller/dashboard/totalCountDetails: ${err.message}`);
        res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch total count details",
        });
      });
  } catch (error) {
    logger.error(`Error in /controller/dashboard/totalCountDetails (try-catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
};
