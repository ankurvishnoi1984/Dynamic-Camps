const db = require("../config/db")
const logger = require('../utils/logger')

exports.createCampType = (req, res) => {
  const { campTypeName, userId,deptId } = req.body;
  const status = "Y";

  const query = `insert into camp_type_mst (
        camp_type_name,
        status,
        created_by,
        dept_id
     ) values (?,?,?,?)`;

  try {
    db.query(query, [campTypeName, status, Number(userId),deptId], (err, results) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/createCampType (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to create camp reports",
        });
      }
      res.status(200).json({
        message: 'Camp type created successfully',
        errorCode: 1,
        data: results,
      });
    })
  } catch (error) {
    logger.error(error.message);
    res.send(error)
  }
}

exports.createCampConfig = (req, res) => {
  const { campTypeId, fields,deptId } = req.body;
  /**
   * fields = [
   *   { label: "Hospital Name", field_type: "text", is_required: "Y", options_json: null, order_index: 1 },
   *   { label: "Gift Type", field_type: "dropdown", is_required: "Y", options_json: ["Cup", "Plate"], order_index: 2 },
   *   { label: "Upload Image", field_type: "image", is_required: "N", options_json: null, order_index: 3 }
   * ]
   */

  /* sample request body
  {
  "campTypeId": 5,
  "deptId":3,
  "fields": [
    {
      "label": "Hospital Name",
      "field_type": "text",
      "is_required": "Y",
      "options_json": null,
      "order_index": 1
    },
    {
      "label": "Kit Type",
      "field_type": "dropdown",
      "is_required": "Y",
      "options_json": ["Cup", "Plate", "Kulhad"],
      "order_index": 2
    },
    {
      "label": "Upload Image",
      "field_type": "image",
      "is_required": "N",
      "options_json": null,
      "order_index": 3
    }
  ]
} 
  */

  if (!campTypeId || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({
      errorCode: 0,
      errorDetail: "Invalid request body. Expected campTypeId and fields array.",
      responseData: {},
    });
  }

  try {
    // Build bulk insert query
    const query = `
      INSERT INTO camp_type_fields
      (camp_type_id, label, field_type, is_required, options_json, order_index,dept_id)
      VALUES ?
    `;

    // Convert JS array into a structure MySQL bulk insert can use
    const values = fields.map((f) => [
      campTypeId,
      f.label || null,
      f.field_type || null,
      f.is_required || "N",
      f.options_json ? JSON.stringify(f.options_json) : null,
      f.order_index || 0,
      deptId,
    ]);

    db.query(query, [values], (err, results) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/createCampTypeFields (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to insert camp type fields",
        });
      }

      res.status(200).json({
        message: "Camp type fields created successfully",
        errorCode: 1,
        data: results,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/monthlyCamps/createCampTypeFields (catch): ${error.message}`);
    return res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
    });
  }
};


exports.getActiveCamps = (req, res) => {
  const { deptId } = req.body;
  const query = `select camp_id,camp_name,camp_type_id,created_by,created_date,start_date,end_date,
  is_doctor_required,is_prescription_required from monthly_camp_mst where dept_id = ? and status = 'Y'`;
  try {
    db.query(query,[deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/getActiveCamps: ${err.message}`);
        res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          // status: "ERROR",
          details: "An internal server error occurred",
          // getMessageInfo: "An internal server error occurred"
        });
      }
      else if (result.length === 0) {
        res.status(200).json({ message: "Camp list not found", errorCode: 1 });
      }
      else {
        res.status(200).json({ message: "Camps listed successfully", errorCode: 1, data: result });
      }
    })
  } catch (error) {
    logger.error(error.message);
    res.send(error)
  }
}
exports.getCampFieldDetails = (req, res) => {
  const { campId,deptId } = req.body;

  if (!campId) {
    return res.status(400).json({
      errorCode: 0,
      message: "campId is required",
    });
  }

  // Step 1: Get camp_type_id + required flags from monthly_camp_mst
  const getCampTypeQuery = `
    SELECT camp_type_id, is_doctor_required, is_prescription_required
    FROM monthly_camp_mst 
    WHERE camp_id = ? AND dept_id = ? AND status = 'Y'
  `;

  try {
    db.query(getCampTypeQuery, [campId,deptId], (err, campResult) => {
      if (err) {
        logger.error(`Error in getCampFieldDetails (camp lookup): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          message: "Failed to fetch camp type",
        });
      }

      if (campResult.length === 0) {
        return res.status(404).json({
          errorCode: 0,
          message: "No active camp found for given campId",
        });
      }

      const { camp_type_id: campTypeId, is_doctor_required, is_prescription_required } = campResult[0];

      // Step 2: Fetch fields based on camp_type_id
      const fieldQuery = `
        SELECT field_id, label, field_type, is_required, options_json, order_index
        FROM camp_type_fields 
        WHERE camp_type_id = ? AND dept_id = ? AND status = 'Y'
        ORDER BY order_index ASC
      `;

      db.query(fieldQuery, [campTypeId,deptId], (err, fieldResult) => {
        if (err) {
          logger.error(`Error in getCampFieldDetails (field lookup): ${err.message}`);
          return res.status(500).json({
            errorCode: 0,
            errorDetail: err.message,
            message: "Failed to fetch camp fields",
          });
        }

        if (fieldResult.length === 0) {
          return res.status(200).json({
            errorCode: 0,
            message: "No fields found for the given camp type",
            campTypeId,
            is_doctor_required,
            is_prescription_required,
          });
        }

        res.status(200).json({
          errorCode: 1,
          message: "Camp field details fetched successfully",
          campTypeId,
          is_doctor_required,
          is_prescription_required,
          data: fieldResult,
        });
      });
    });
  } catch (error) {
    logger.error(`Unhandled error in getCampFieldDetails: ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      message: "Unexpected server error",
      errorDetail: error.message,
    });
  }
};

exports.createMonthlyCamp = (req, res) => {
  const { campName, campTypeId, userId, starDate, endDate
    , deptId, isDrRequired,
    isPrescRequired,
  } = req.body;

  const query = `insert into monthly_camp_mst 
  (
  camp_name,
  camp_type_id,
  created_by,
  start_date,
  end_date,
  department_id,
  is_doctor_required,
  is_prescription_required
  )
  values (?,?,?,?,?,?,?,?)
  `
  try {
    db.query(query, [
      campName,
      campTypeId,
      userId,
      starDate,
      endDate,
      deptId,
      isDrRequired,
      isPrescRequired,
    ],
      (err, results) => {
        if (err) {
          logger.error(`Error in /controller/monthlyCamps/createMonthlyCamp (query): ${err.message}`);
          return res.status(500).json({
            errorCode: 0,
            errorDetail: err.message,
            responseData: {},
            details: "Failed to create camp reports",
          });
        }
        res.status(200).json({
          message: 'Camp created successfully',
          errorCode: 1,
          data: results,
        });
      })
  } catch (error) {
    logger.error(error.message);
    res.send(error)
  }


}

exports.submitFormAnswers = (req, res) => {
  const { campId, userId, doctorId, status = "Y", values,deptId } = req.body;

  if (!campId || !userId || !doctorId || !Array.isArray(values) || values.length === 0) {
    return res.status(400).json({
      errorCode: 0,
      errorDetail: "Missing required fields or empty values array",
      responseData: {},
    });
  }

  db.getConnection((err, connection) => {
    if (err) {
      logger.error(`Error getting DB connection: ${err.message}`);
      return res.status(500).json({
        errorCode: 0,
        errorDetail: "Database connection failed",
        responseData: {},
      });
    }

    connection.beginTransaction(async (transErr) => {
      if (transErr) {
        connection.release();
        logger.error(`Error starting transaction: ${transErr.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: transErr.message,
          responseData: {},
        });
      }

      try {
        // Step 1️⃣: Insert into camp_submissions
        const insertSubmissionQuery = `
          INSERT INTO camp_submissions (camp_id, user_id, doctor_id, status,dept_id)
          VALUES (?, ?, ?, ?,?)
        `;

        const [submissionResult] = await new Promise((resolve, reject) => {
          connection.query(insertSubmissionQuery, [campId, userId, doctorId, status,deptId], (err, result) => {
            if (err) reject(err);
            else resolve([result]);
          });
        });

        const submissionId = submissionResult.insertId;

        // Step 2️⃣: Insert multiple values (bulk insert)
        const insertValuesQuery = `
          INSERT INTO camp_submission_values (submission_id, field_id, value,dept_id)
          VALUES ?
        `;

        const submissionValues = values.map(v => [submissionId, v.fieldId, v.value,deptId]);

        await new Promise((resolve, reject) => {
          connection.query(insertValuesQuery, [submissionValues], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // Step 3️⃣: Commit transaction
        connection.commit(commitErr => {
          connection.release();
          if (commitErr) {
            logger.error(`Error committing transaction: ${commitErr.message}`);
            return res.status(500).json({
              errorCode: 0,
              errorDetail: commitErr.message,
              responseData: {},
            });
          }

          res.status(200).json({
            message: "Camp submission saved successfully",
            errorCode: 1,
            data: { submissionId },
          });
        });

      } catch (error) {
        // Rollback on any failure
        connection.rollback(() => {
          connection.release();
          logger.error(`Transaction rolled back: ${error.message}`);
          res.status(500).json({
            errorCode: 0,
            errorDetail: error.message,
            responseData: {},
            details: "Submission failed and rolled back",
          });
        });
      }
    });
  });
};