const db = require("../config/db")
const logger = require('../utils/logger')

const BASE_URL = process.env.BASE_URL 


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
  dept_id,
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
  const { campId, userId, doctorId=1, status = "Y", values,deptId } = req.body;

  if (!campId || !userId || !Array.isArray(values) || values.length === 0) {
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

exports.getCampTypeDetailsAdmin = (req, res) => {
  const {deptId} = req.body;
  const query = `
    SELECT 
        ct.camp_type_id,
        ct.camp_type_name,
        ct.status,
        ct.created_date,
        ct.created_by,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'field_id', cf.field_id,
                'label', cf.label,
                'order_index', cf.order_index,
                'field_type', cf.field_type,
                'is_required', cf.is_required,
                'options_json', cf.options_json,
                'order_index', cf.order_index
            )
        ) AS fields
    FROM camp_type_mst ct
    LEFT JOIN camp_type_fields cf 
        ON ct.camp_type_id = cf.camp_type_id 
        AND cf.status = 'Y'
    WHERE ct.status = 'Y'
    AND ct.dept_id = ?
    GROUP BY 
        ct.camp_type_id,
        ct.camp_type_name,
        ct.status,
        ct.created_date,
        ct.created_by
    ORDER BY ct.camp_type_id;
  `;

  try {
    db.query(query,[deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/getCampDetailsAdmin: ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch active camp configurations",
        });
      }

      if (!result || result.length === 0) {
        return res.status(200).json({
          message: "No active camp configurations found",
          errorCode: 0,
          data: [],
        });
      }

      // Parse JSON fields
      const formatted = result.map(row => ({
        ...row,
        fields: row.fields ? (row.fields) : []
      }));

      res.status(200).json({
        message: "Active camp type configurations fetched successfully",
        errorCode: 1,
        data: formatted,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/monthlyCamps/getActiveCampTypeConfigs: ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "An internal server error occurred",
    });
  }
};

exports.getCampTypeList = (req, res) => {
  const {deptId} = req.body;
  const query = `select camp_type_id, camp_type_name, created_date,created_by from camp_type_mst
  where status = 'Y' and dept_id = ?`
  try {
    db.query(query,[deptId], (err, results) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/getAllCampType (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch camp types",
        });
      }
      res.status(200).json({
        message: 'Camp type fetched successfully',
        errorCode: 1,
        data: results,
      });
    })
  } catch (error) {
    logger.error(error.message);
    res.send(error)
  }
}

exports.getMonthlyCampsList = (req, res) => {
  const {deptId} = req.body;
  const query = `
    SELECT 
        mcm.camp_id,
        mcm.camp_name,
        mcm.created_by,
        mcm.created_date,
        mcm.start_date,
        mcm.end_date,
        mcm.is_doctor_required,
        mcm.is_prescription_required,
        mcm.status,
        mcm.camp_type_id,
        mcm.is_active,
        ct.camp_type_name,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'field_id', cf.field_id,
                'label', cf.label,
                'order_index', cf.order_index
            )
        ) AS fields
    FROM monthly_camp_mst mcm
    LEFT JOIN camp_type_mst ct 
        ON mcm.camp_type_id = ct.camp_type_id
    LEFT JOIN camp_type_fields cf 
        ON ct.camp_type_id = cf.camp_type_id 
        AND cf.status = 'Y'
    WHERE mcm.status = 'Y'
    AND mcm.dept_id = ?
    GROUP BY 
        mcm.camp_id,
        mcm.camp_name,
        mcm.created_by,
        mcm.created_date,
        mcm.start_date,
        mcm.end_date,
        mcm.is_doctor_required,
        mcm.is_prescription_required,
        mcm.status,
        mcm.camp_type_id,
        mcm.is_active,
        ct.camp_type_name
    ORDER BY mcm.camp_id DESC;
  `;

  try {
    db.query(query,[deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/getMonthlyCampsList: ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch monthly camp details",
        });
      }

      if (!result || result.length === 0) {
        return res.status(200).json({
          message: "No camp records found",
          errorCode: 0,
          data: [],
        });
      }

      const formatted = result.map(row => ({
        ...row,
        fields: row.fields ? (row.fields) : []
      }));

      res.status(200).json({
        message: "Monthly camp details fetched successfully",
        errorCode: 1,
        data: formatted,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/monthlyCamps/getCampDetailsAdmin: ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "An internal server error occurred",
    });
  }
};

exports.getActiveCampsNavList = (req, res) => {
  const {deptId} = req.body;
  const query = `
    SELECT 
      m.camp_id,
      m.camp_name,
      m.camp_type_id,
      ct.camp_type_name,
      m.start_date,
      m.end_date,
      m.created_by,
      m.created_date,
      m.is_doctor_required,
      m.is_prescription_required
    FROM monthly_camp_mst m
    INNER JOIN camp_type_mst ct 
      ON m.camp_type_id = ct.camp_type_id
    WHERE 
      m.status = 'Y'
      AND m.is_active = 'Y'
      AND m.dept_id = ?
      AND CURRENT_DATE() BETWEEN DATE(m.start_date) AND DATE(m.end_date)
    ORDER BY m.start_date DESC;
  `;

  try {
    db.query(query,[deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/monthlyCamps/getActiveCamps: ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: [],
          message: "Failed to fetch active camps",
        });
      }

      if (!result || result.length === 0) {
        return res.status(200).json({
          errorCode: 1,
          message: "No active camps found",
          data: [],
        });
      }

      return res.status(200).json({
        errorCode: 1,
        message: "Active camps fetched successfully",
        data: result,
      });
    });
  } catch (error) {
    logger.error(`Error in /controller/monthlyCamps/getActiveCamps: ${error.message}`);
    return res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: [],
      message: "An internal server error occurred",
    });
  }
};

exports.getCampSubmissionsFull = (req, res) => {
  const { campId, userId,deptId } = req.body;
  const BASE_URL1 = `${BASE_URL}/uploads/`

  if (!campId || !userId) {
    return res.status(400).json({
      errorCode: 0,
      message: "campId and userId are required",
    });
  }

  const query = `
    SELECT 
      cs.submission_id,
      cs.camp_id,
      cs.user_id,
      cs.submitted_at,
      cs.status,
      cs.doctor_id,
      d.doctor_name,
      d.garnet_code,
      d.speciality
    FROM camp_submissions cs
    LEFT JOIN doctor_mst d ON cs.doctor_id = d.doctor_id
    WHERE cs.camp_id = ? AND cs.user_id = ? AND cs.dept_id = ?
    ORDER BY cs.submitted_at DESC
  `;

  db.query(query, [campId, userId,deptId], (err, submissions) => {
    if (err) {
      return res.status(500).json({
        errorCode: 0,
        message: "Error fetching submissions",
        errorDetail: err.message,
      });
    }

    if (!submissions.length) {
      return res.status(200).json({
        errorCode: 1,
        message: "No submissions found",
        data: [],
      });
    }

    const submissionIds = submissions.map((s) => s.submission_id);

    const fieldQuery = `
      SELECT 
        csv.submission_id,
        f.label AS field_label,
        f.field_type,
        csv.value
      FROM camp_submission_values csv
      JOIN camp_type_fields f ON csv.field_id = f.field_id
      WHERE csv.submission_id IN (?) AND csv.dept_id = ?
    `;

    db.query(fieldQuery, [submissionIds,deptId], (err2, fieldValues) => {
      if (err2) {
        return res.status(500).json({
          errorCode: 0,
          message: "Error fetching submission field values",
          errorDetail: err2.message,
        });
      }

      const presQuery = `
        SELECT 
          p.submission_id,
          p.crimgid,
          p.brand_id,
          b.brand_name,
          p.imgpath,
          p.prescription_count,
          p.created_date
        FROM monthly_camp_prescription_mst p
        LEFT JOIN brand_mst b ON p.brand_id = b.brand_id
        WHERE p.submission_id IN (?) AND p.dept_id = ?
      `;

      db.query(presQuery, [submissionIds,deptId], (err3, presData) => {
        if (err3) {
          return res.status(500).json({
            errorCode: 0,
            message: "Error fetching prescription data",
            errorDetail: err3.message,
          });
        }

        // const BASE_URL = "http://localhost:8035/uploads/"; // adjust as needed

        // ✅ Group prescriptions by brand_id for each submission
        const groupedPres = presData.reduce((acc, p) => {
          const key = `${p.submission_id}_${p.brand_id}`;
          if (!acc[key]) {
            acc[key] = {
              submission_id: p.submission_id,
              brand_id: p.brand_id,
              brand_name: p.brand_name,
              prescription_count: p.prescription_count,
              created_date: p.created_date,
              imgpaths: [],
            };
          }
          if (p.imgpath) {
            acc[key].imgpaths.push(BASE_URL1 + p.imgpath);
          }
          return acc;
        }, {});

        // ✅ Combine everything into nested structure
        const fullData = submissions.map((sub) => ({
          ...sub,
          field_values: fieldValues.filter(
            (fv) => fv.submission_id === sub.submission_id
          ),
          prescriptions: Object.values(groupedPres).filter(
            (p) => p.submission_id === sub.submission_id
          ),
        }));

        return res.status(200).json({
          errorCode: 1,
          message: "Camp submissions with details fetched successfully",
          data: fullData,
        });
      });
    });
  });
};

exports.monthlyCampsAdminReports = (req, res) => {
  const { campId, empcode, searchKeyword = "",deptId } = req.body;

  if (!campId) {
    return res.status(400).json({
      errorCode: 0,
      message: "campId required",
    });
  }

  if (!empcode) {
    return res.status(400).json({
      errorCode: 0,
      message: "empcode required",
    });
  }

  // --- Main query with recursive hierarchy based on empcode ---
  const baseQuery = `
    WITH RECURSIVE hierarchy AS (
      SELECT user_id, name, empcode, reporting, 0 AS level
      FROM user_mst
      WHERE empcode = ? AND status = 'Y'

      UNION ALL

      SELECT u.user_id, u.name, u.empcode, u.reporting, h.level + 1
      FROM user_mst u
      INNER JOIN hierarchy h ON u.reporting = h.empcode
      WHERE u.status = 'Y'
    )
    SELECT 
      cs.submission_id,
      cs.camp_id,
      cs.user_id,
      cs.submitted_at,
      cs.status,
      cs.doctor_id,
      d.doctor_name,
      d.garnet_code,
      d.speciality
    FROM camp_submissions cs
    LEFT JOIN doctor_mst d ON cs.doctor_id = d.doctor_id
    WHERE cs.camp_id = ?
      AND cs.user_id IN (SELECT user_id FROM hierarchy)
      AND cs.dept_id = ?
      ${searchKeyword && searchKeyword.trim() !== "" ? "AND d.doctor_name LIKE ?" : ""}
    ORDER BY cs.submitted_at DESC
  `;

  const queryParams = [empcode, campId,deptId];
  if (searchKeyword && searchKeyword.trim() !== "") {
    queryParams.push(`%${searchKeyword.trim()}%`);
  }

  db.query(baseQuery, queryParams, (err, submissions) => {
    if (err) {
      return res.status(500).json({
        errorCode: 0,
        message: "Error fetching submissions",
        errorDetail: err.message,
      });
    }

    if (!submissions.length) {
      return res.status(200).json({
        errorCode: 1,
        message: "No submissions found",
        data: [],
      });
    }

    const submissionIds = submissions.map((s) => s.submission_id);

    // --- Fetch field values ---
    const fieldQuery = `
      SELECT 
        csv.submission_id,
        f.label AS field_label,
        f.field_type,
        csv.value
      FROM camp_submission_values csv
      JOIN camp_type_fields f ON csv.field_id = f.field_id
      WHERE csv.submission_id IN (?) AND csv.dept_id = ?
    `;

    db.query(fieldQuery, [submissionIds,deptId], (err2, fieldValues) => {
      if (err2) {
        return res.status(500).json({
          errorCode: 0,
          message: "Error fetching submission field values",
          errorDetail: err2.message,
        });
      }

      // --- Fetch prescription summary (no images for now) ---
      const presQuery = `
        SELECT 
          p.submission_id,
          p.brand_id,
          b.brand_name,
          p.prescription_count,
          p.created_date
        FROM monthly_camp_prescription_mst p
        LEFT JOIN brand_mst b ON p.brand_id = b.brand_id
        WHERE p.submission_id IN (?) AND p.dept_id = ?
      `;

      db.query(presQuery, [submissionIds,deptId], (err3, presData) => {
        if (err3) {
          return res.status(500).json({
            errorCode: 0,
            message: "Error fetching prescription data",
            errorDetail: err3.message,
          });
        }

        // --- Group prescriptions ---
        const groupedPres = presData.reduce((acc, p) => {
          const key = `${p.submission_id}_${p.brand_id}`;
          if (!acc[key]) {
            acc[key] = {
              submission_id: p.submission_id,
              brand_id: p.brand_id,
              brand_name: p.brand_name,
              prescription_count: p.prescription_count,
              created_date: p.created_date,
            };
          }
          return acc;
        }, {});

        // --- Combine submissions, field values, prescriptions ---
        const fullData = submissions.map((sub) => ({
          ...sub,
          field_values: fieldValues.filter(
            (fv) => fv.submission_id === sub.submission_id
          ),
          prescriptions: Object.values(groupedPres).filter(
            (p) => p.submission_id === sub.submission_id
          ),
        }));

        return res.status(200).json({
          errorCode: 1,
          message: "Camp submissions with details fetched successfully",
          data: fullData,
        });
      });
    });
  });
};

exports.updateCampType = (req, res) => {
  const { camp_type_id, camp_type_name, fields,deptId } = req.body;
  const modified_by = req.body.userId || 0;

  if (!camp_type_id || !camp_type_name) {
    return res.status(400).json({ errorCode: 0, message: "Missing required fields" });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ errorCode: 0, message: "DB connection failed" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Transaction start error:", err);
        return res.status(500).json({ errorCode: 0, message: "Transaction failed" });
      }

      // 1️⃣ Update camp_type_mst
      const updateTypeSql = `
        UPDATE camp_type_mst
        SET camp_type_name = ?, modified_date = NOW(), modified_by = ?
        WHERE camp_type_id = ? AND dept_id = ?
      `;

      connection.query(updateTypeSql, [camp_type_name, modified_by, camp_type_id,deptId], (err) => {
        if (err) {
          console.error("Error updating camp type:", err);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ errorCode: 0, message: "Failed to update camp type" });
          });
        }

        // 2️⃣ Get existing fields
        const getFieldsSql = `SELECT field_id FROM camp_type_fields WHERE camp_type_id = ? AND dept_id = ? AND status = 'Y'`;
        connection.query(getFieldsSql, [camp_type_id,deptId], (err, existingRows) => {
          if (err) {
            console.error("Error fetching existing fields:", err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ errorCode: 0, message: "Failed to fetch fields" });
            });
          }

          const existingIds = existingRows.map((r) => r.field_id);
          const currentIds = fields.filter((f) => f.field_id).map((f) => f.field_id);
          const toDeactivate = existingIds.filter((id) => !currentIds.includes(id));

          // 3️⃣ Deactivate removed fields
          if (toDeactivate.length > 0) {
            const deactivateSql = `
              UPDATE camp_type_fields SET status = 'N'
              WHERE field_id IN (?) AND camp_type_id = ? AND dept_id = ?
            `;
            connection.query(deactivateSql, [toDeactivate, camp_type_id,deptId], (err) => {
              if (err) {
                console.error("Error deactivating fields:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ errorCode: 0, message: "Failed to deactivate old fields" });
                });
              }
              proceedToSaveFields();
            });
          } else {
            proceedToSaveFields();
          }

          // 4️⃣ Insert or update active fields
          function proceedToSaveFields() {
            if (!fields || fields.length === 0) {
              return connection.commit((err) => {
                connection.release();
                if (err) return res.status(500).json({ errorCode: 0, message: "Commit failed" });
                res.json({ errorCode: 1, message: "Camp type updated successfully" });
              });
            }

            const upsertTasks = fields.map((field) => {
              return (cb) => {
                if (field.field_id) {
                  // Update existing field
                  const updateFieldSql = `
                    UPDATE camp_type_fields
                    SET label = ?, field_type = ?, is_required = ?, options_json = ?, order_index = ?, status = 'Y'
                    WHERE field_id = ? AND camp_type_id = ? AND dept_id = ?
                  `;
                  connection.query(
                    updateFieldSql,
                    [
                      field.label,
                      field.field_type,
                      field.is_required,
                      field.options_json = (field.field_type === "dropdown" && field.options_json
                        ? JSON.stringify(field.options_json.split(",").map((opt) => opt.trim()))
                        : JSON.stringify([])),
                      field.order_index,
                      field.field_id,
                      camp_type_id,
                      deptId
                    ],
                    cb
                  );
                } else {
                  // Insert new field
                  const insertFieldSql = `
                    INSERT INTO camp_type_fields
                    (camp_type_id, label, field_type, is_required, options_json, order_index,dept_id, status)
                    VALUES (?, ?, ?, ?, ?, ?,?, 'Y')
                  `;
                  connection.query(
                    insertFieldSql,
                    [
                      camp_type_id,
                      field.label,
                      field.field_type,
                      field.is_required,
                      field.options_json = (field.field_type === "dropdown" && field.options_json
                        ? JSON.stringify(field.options_json.split(",").map((opt) => opt.trim()))
                        : JSON.stringify([])),
                      field.order_index,
                      deptId
                    ],
                    cb
                  );
                }
              };
            });

            // Run all field queries sequentially
            runSeries(upsertTasks, (err) => {
              if (err) {
                console.error("Error updating/inserting fields:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ errorCode: 0, message: "Failed to save fields" });
                });
              }

              connection.commit((err) => {
                if (err) {
                  console.error("Commit error:", err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ errorCode: 0, message: "Commit failed" });
                  });
                }

                connection.release();
                res.json({ errorCode: 1, message: "Camp type updated successfully" });
              });
            });
          }
        });
      });
    });
  });
};

exports.updateMonthlyCamp = (req, res) => {
  const {
    campId,
    campName,
    campTypeId,
    startDate,
    endDate,
    isDoctorRequired,
    isPrescriptionRequired,
    userId,
    deptId
  } = req.body;

  if (!campId)
    return res.status(400).json({ errorCode: 0, message: "Camp ID required" });

  const query = `
    UPDATE monthly_camp_mst
    SET 
      camp_name = ?,
      camp_type_id = ?,
      start_date = ?,
      end_date = ?,
      is_doctor_required = ?,
      is_prescription_required = ?,
      modified_date = NOW(),
      modified_by = ?
    WHERE camp_id = ?
    AND dept_id = ?;
  `;

  db.query(
    query,
    [
      campName,
      campTypeId,
      startDate,
      endDate,
      isDoctorRequired,
      isPrescriptionRequired,
      userId,
      campId,
      deptId,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ errorCode: 0, message: "DB error updating camp" });
      }
      res.json({ errorCode:1,success: true, message: "Camp updated successfully" });
    }
  );
};

exports.manageCampStatus = (req,res)=>{
  const {campId,status='Y',userId,deptId} = req.body;
   if (!campId)
    return res.status(400).json({ errorCode: 0, message: "Camp ID required" });

  const query = `
   UPDATE monthly_camp_mst
    SET 
      is_active = ?,
      modified_date = NOW(),
      modified_by = ?
    WHERE camp_id = ?
    AND dept_id = ?;`

     db.query(
    query,
    [
     status,
     userId,
     campId,
     deptId
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ errorCode: 0, message: "DB error updating camp" });
      }
      res.json({ errorCode: 1,success: true, message: "Camp status updated successfully" });
    }
  );


}

exports.getMonthlyCampsPrescriptionImages = (req, res) => {
  const {userId} = req.body;
  const {deptId} = req.body;
  const params = [userId,deptId];

    if (!deptId) {
    return res.status(400).json({
      success: false,
      message: 'deptId is required',
      errorCode :0,
    });
  }

  db.query('CALL GetMonthlyCampPrescriptionHierarchy(?,?)', params, (err, results) => {
    if (err) {
      console.error('Error fetching prescription images:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching prescription images',
        error: err.message
      });
    }

    const rows = results[0] || [];
    const transformedMap = {}; // key: campId_doctor_emp

    rows.forEach(row => {
      // Create a unique key for camp + doctor + employee
      const key = `${row.campId}_${row.doctorFolder}_${row.empFolder}`;

      if (!transformedMap[key]) {
        transformedMap[key] = {
          campId: row.campId,
          doctorName: row.doctorFolder.split('_')[0],  // doctor name
          doctorCode: row.doctorFolder.split('_')[1],  // doctor garnet code
          employeeName: row.empFolder.split('_')[0],
          employeeCode: row.empFolder.split('_')[1],
          campName: row.campName,
          campDate: row.submitted_at,
          posters: []
        };
      }

      // Push image into posters array
      transformedMap[key].posters.push({ posterUrl: row.imageFile, brandName: row.brandName });
    });

    const transformedResult = Object.values(transformedMap);

    return res.status(200).json({
      success: true,
      transformedResult,
      poslength: transformedResult.length
    });
  });
};

exports.saveBrandImages = (req, res) => {
  try {
    const { campId, userId, submissionId,deptId } = req.body;
    // parse brandsMeta JSON from FormData
    const brandsMeta = JSON.parse(req.body.brandsMeta || "[]");
    const files = req.files || [];

    if (!campId || !userId) {
      return res
        .status(400)
        .json({ errorCode: 0, message: "campId and userId are required" });
    }

    if (!Array.isArray(brandsMeta) || brandsMeta.length === 0) {
      return res.json({ errorCode: 1, message: "No brand images to save" });
    }

    const rows = [];

    // Loop through each brandMeta
    brandsMeta.forEach((meta) => {
      // ✅ Find all files for this brand (supports multiple)
      const matchingFiles = files.filter(
        (f) =>
          f.fieldname.startsWith(`files_${meta.brandId}`) ||
          f.fieldname.startsWith(`brandImages_${meta.brandId}`)
      );


      if (matchingFiles.length > 0) {
        matchingFiles.forEach((f) => {
          rows.push([
            campId, // crid
            meta.brandId,
            f.filename, // imgpath (multer saves filename)
            meta.prescriptionCount || 0,
            "Y",
            userId,
            new Date(), // created_date
            submissionId,
            deptId
          ]);
        });
      } else {
        // ✅ If no files uploaded, still allow row insert with NULL image
        rows.push([
          campId,
          meta.brandId,
          null,
          meta.prescriptionCount || 0,
          "Y",
          userId,
          new Date(),
          submissionId,
          deptId
        ]);
      }
    });

    if (rows.length === 0) {
      return res.json({ errorCode: 1, message: "No valid images to save" });
    }

    // ✅ Insert all rows at once
    const insertSQL = `
          INSERT INTO monthly_camp_prescription_mst 
            (crid, brand_id, imgpath, prescription_count, status, created_by, created_date,submission_id,dept_id) 
          VALUES ?
        `;

    db.query(insertSQL, [rows], (err, result) => {
      if (err) {
        console.error("Error inserting brand images:", err);
        return res
          .status(500)
          .json({ errorCode: 0, message: "Error saving brand images" });
      }

      return res.json({
        errorCode: 1,
        message: "Brand images saved successfully",
        insertedCount: result.affectedRows,
      });
    });
  } catch (err) {
    console.error("saveBrandImages error:", err);
    return res
      .status(500)
      .json({ errorCode: 0, message: "Server error saving brand images" });
  }
};