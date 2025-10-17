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
