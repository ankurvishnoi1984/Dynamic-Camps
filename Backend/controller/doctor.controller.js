const db = require("../config/db")
const logger = require('../utils/logger')


exports.getDoctorList = async (req, res) => {
  const { empcode,deptId } = req.body;

  // 1️⃣ Recursive CTE to get full hierarchy of users
  const query = `
    WITH RECURSIVE hierarchy AS (
      SELECT user_id, empcode
      FROM user_mst
      WHERE empcode = ? AND status = 'Y'
      UNION ALL
      SELECT u.user_id, u.empcode
      FROM user_mst u
      INNER JOIN hierarchy h ON u.reporting = h.empcode
      WHERE u.status = 'Y'
      AND u.dept_id = ?
    )
    SELECT DISTINCT d.doctor_id, d.doctor_name, d.speciality, d.garnet_code, d.rps_flag
    FROM doctor_mst d
    INNER JOIN user_mst u ON d.empcode = u.empcode
    WHERE u.user_id IN (SELECT user_id FROM hierarchy)
      AND d.status = 'Y'
      AND d.dept_id  = ?
  `;

  try {
    db.query(query, [deptId,empcode,deptId], (err, results) => {
      if (err) {
        logger.error(`Error in /controller/doctor/getDoctorList: ${err.message}`);
        res.status(500).json({
          errorCode: "INTERNAL_SERVER_ERROR",
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      } else if (results.length === 0) {
        res.status(200).json({ message: "Doctor list not found", errorCode: 2, data: [] });
      } else {
        res.status(200).json({ message: "Doctor list retrieved successfully", errorCode: 1, data: results });
      }
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send(error);
  }
};