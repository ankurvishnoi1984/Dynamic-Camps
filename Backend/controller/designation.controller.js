const db = require("../config/db")
const logger = require('../utils/logger');

exports.insertDesignations = (req, res) => {
  const { designations } = req.body;

  // Validate input
  if (!Array.isArray(designations) || designations.length === 0) {
    return res.status(400).json({
      errorCode: 0,
      details: "designations must be a non-empty array",
    });
  }

  // Prepare values for bulk insert
  const values = designations.map(item => [
    item.role_id,
    item.designation,
    item.dept_id,
    item.status || 'Y',  // Default value
    item.reporting,
  ]);

  const query = `
      INSERT INTO designation_mst 
      (role_id, designation, dept_id, status,reporting) 
      VALUES ?
  `;

  try {
    db.query(query, [values], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/designation/insertDesignations: ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to insert designations",
        });
      }

      res.status(200).json({
        message: "Designations inserted successfully",
        errorCode: 1,
        insertedCount: result.affectedRows,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/designation/insertDesignations (catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
};

exports.getDesignationsDeptWise = (req,res)=>{
  const {deptId} = req.body

  if(!deptId){
     return res.status(400).json({
      errorCode: 0,
      details: "deptId required",
    });
  }

  const query = `SELECT * from designation_mst where dept_id = ? order by role_id desc ;`;

    try {
    db.query(query, [deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/designation/getDesignationsDeptWise: ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to insert designations",
        });
      }

      res.status(200).json({
        message: "Designations listed successfully",
        errorCode: 1,
        designationList: result,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/designation/getDesignationsDeptWise (catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
}
