const db = require("../config/db")
const csv = require("csvtojson");
const logger = require('../utils/logger')


exports.getDoctorList = async (req, res) => {
  const { empcode, deptId } = req.body;

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
     
    )
    SELECT DISTINCT d.doctor_id, d.doctor_name, d.speciality, d.garnet_code, d.rps_flag
    FROM doctor_mst d
    INNER JOIN user_mst u ON d.empcode = u.empcode
    WHERE u.user_id IN (SELECT user_id FROM hierarchy)
      AND d.status = 'Y'
      AND d.dept_id = ?
     
  `;

  try {
    db.query(query, [empcode, deptId], (err, results) => {
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

exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const searchName = req.query.searchName || "";
    const deptId = req.query.deptId || "";
    const reqEmpcode = Number(req.query.empcode);

    // ✅ Hierarchy start logic
    const empcodeFilter = reqEmpcode === 10000 ? "" : reqEmpcode || "";

    // ----------------------------
    // Build Recursive CTE
    // ----------------------------
    const baseCTE = `
      WITH RECURSIVE doctor_hierarchy AS (
        -- Base doctors
        SELECT 
          d.doctor_id,
          d.doctor_name,
          d.speciality,
          d.garnet_code,
          d.rps_flag,
          d.status,
          d.empcode AS doctor_empcode,
          d.qualification,
          d.doc_unique_code,
          d.subarea,
          d.grade,
          d.dept_id
        FROM doctor_mst d
        WHERE d.status = 'Y'
        ${deptId ? `AND d.dept_id = ${db.escape(deptId)}` : ''}
        ${empcodeFilter ? `AND d.empcode = ${db.escape(empcodeFilter)}` : ''}

        UNION ALL

        -- Doctors under reporting hierarchy
        SELECT 
          d2.doctor_id,
          d2.doctor_name,
          d2.speciality,
          d2.garnet_code,
          d2.rps_flag,
          d2.status,
          d2.empcode AS doctor_empcode,
          d2.qualification,
          d2.doc_unique_code,
          d2.subarea,
          d2.grade,
          d2.dept_id
        FROM doctor_mst d2
        INNER JOIN user_mst u ON d2.empcode = u.empcode
        INNER JOIN doctor_hierarchy dh 
          ON u.reporting = dh.doctor_empcode
        WHERE d2.status = 'Y'
        ${deptId ? `AND d2.dept_id = ${db.escape(deptId)}` : ''}
      )
    `;

    // ----------------------------
    // Paginated Data
    // ----------------------------
    const dataQuery = `
      ${baseCTE}
      SELECT 
        doctor_id,
        doctor_name,
        speciality,
        garnet_code,
        rps_flag,
        status,
        doctor_empcode AS empcode,
        qualification,
        doc_unique_code,
        subarea,
        grade
      FROM doctor_hierarchy
      WHERE doctor_name LIKE ${db.escape(searchName + "%")}
      ORDER BY doctor_name ASC
      LIMIT ${limit} OFFSET ${offset};
    `;

    // ----------------------------
    // Total Count
    // ----------------------------
    const countQuery = `
      ${baseCTE}
      SELECT COUNT(*) AS totalCount
      FROM doctor_hierarchy
      WHERE doctor_name LIKE ${db.escape(searchName + "%")};
    `;

    const doctors = await new Promise((resolve, reject) => {
      db.query(dataQuery, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const countData = await new Promise((resolve, reject) => {
      db.query(countQuery, (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });

    res.status(200).json({
      errorCode: 1,
      doctors,
      totalCount: countData.totalCount,
      page,
      limit,
    });

  } catch (error) {
    logger.error(`Error in /controller/doctor/getAllDoctors: ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      message: "We are unable to process your request right now. Please try again later.",
      error: error.message,
    });
  }
};
exports.doctorUpsertSingle = async (req, res) => {
  try {
    const {
      doctor_name = "",
      speciality = "",
      empcode = "",
      rps_flag = "Non-RPS",
      status = "Y",
      qualification = "",
      doc_unique_code = "",
      subarea = "",
      grade = "",
      userId,
      deptId
    } = req.body;

    // ----------------------------
    // Validations
    // ----------------------------
    if (!deptId) {
      return res.status(400).json({
        errorCode: 0,
        message: "deptId is required",
      });
    }

    if (!doctor_name || !doctor_name.trim()) {
      return res.status(400).json({
        errorCode: 0,
        message: "doctor_name is required",
      });
    }

    if (!speciality || !speciality.trim()) {
      return res.status(400).json({
        errorCode: 0,
        message: "speciality is required",
      });
    }

    if (!empcode) {
      return res.status(400).json({
        errorCode: 0,
        message: "empcode is required",
      });
    }

    if (!qualification || !qualification.trim()) {
      return res.status(400).json({
        errorCode: 0,
        message: "qualification is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        errorCode: 0,
        message: "userId is required",
      });
    }

    // ----------------------------
    // 1️⃣ Check if doctor already exists
    // ----------------------------
    const checkQuery = `
      SELECT doctor_id
      FROM doctor_mst
      WHERE 
        TRIM(doctor_name) = TRIM(?)
        AND TRIM(speciality) = TRIM(?)
        AND empcode = ?
        AND TRIM(qualification) = TRIM(?)
        AND created_by = ?
        AND dept_id = ?
        AND status = 'Y'
      LIMIT 1
    `;

    const existingDoctor = await new Promise((resolve, reject) => {
      db.query(
        checkQuery,
        [
          doctor_name,
          speciality,
          empcode,
          qualification,
          userId,
          deptId
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (existingDoctor.length > 0) {
      return res.status(409).json({
        errorCode: 0,
        message: "Doctor already exists",
      });
    }

    // ----------------------------
    // 2️⃣ Insert new doctor
    // ----------------------------
    const insertQuery = `
      INSERT INTO doctor_mst
      (
        doctor_name,
        speciality,
        rps_flag,
        status,
        created_date,
        empcode,
        qualification,
        doc_unique_code,
        subarea,
        grade,
        created_by,
        dept_id
      )
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [
          doctor_name,
          speciality,
          rps_flag,
          status,
          empcode,
          qualification,
          doc_unique_code,
          subarea,
          grade,
          userId,
          deptId
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    return res.status(200).json({
      errorCode: 1,
      message: "Doctor inserted successfully",
      doctor_name,
    });

  } catch (error) {
    logger.error(
      `Error in /controller/doctor/doctorUpsertSingle: ${error.message}`
    );
    return res.status(500).json({
      errorCode: 0,
      message: "We are unable to process your request right now. Please try again later.",
      error: error.message,
    });
  }
};
exports.doctorCSVUpsert = async (req, res) => {
  try {
    const { userId, deptId } = req.body;

    if (!deptId) {
      return res.status(400).json({
        errorCode: 0,
        message: "deptId are required",
      });
    }
     if (!userId) {
      return res.status(400).json({
        errorCode: 0,
        message: "userId are required",
      });
    }

    // 1️⃣ Validate CSV
    if (!req.file) {
      return res.status(400).json({
        errorCode: "NO_FILE",
        message: "Please upload a CSV file",
        data: []
      });
    }

    const fileExt = req.file.originalname.split(".").pop().toLowerCase();
    if (fileExt !== "csv") {
      return res.status(400).json({
        errorCode: "INVALID_FILE_TYPE",
        message: "Only .csv files are allowed. Please download the sample template for reference.",
        data: []
      });
    }

    const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        errorCode: "INVALID_MIME_TYPE",
        message: "Only .csv files are allowed. Please download the sample template for reference.",
        data: []
      });
    }

    // 2️⃣ Parse CSV
    const rows = await csv().fromString(req.file.buffer.toString());
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        errorCode: 0,
        message: "CSV file is empty",
        data: []
      });
    }

    const successList = [];
    const failedList = [];

    const required = ["doctor_name", "empcode", "speciality", "qualification"];

    for (const row of rows) {
      let remark = "";

      const garnet_code = (row.garnet_code || "").trim();
      const doctor_name = (row.doctor_name || "").trim();
      const empcode = (row.empcode || "").trim();
      const speciality = (row.speciality || "").trim();
      const qualification = (row.qualification || "").trim();
      const rps_flag = row.rps_flag || "Non-RPS";
      const doc_unique_code = row.doc_unique_code || "";
      const subarea = row.subarea || "";
      const grade = row.grade || "";
      const statusVal = row.status || "Y";

      // -------------------------------
      // REQUIRED FIELD CHECK
      // -------------------------------
      for (const col of required) {
        if (!row[col] || row[col].trim() === "") {
          remark = `Missing required field: ${col}`;
          break;
        }
      }

      if (remark) {
        failedList.push({ ...row, Status: "Failed", Remark: remark });
        continue;
      }

      // -------------------------------------------------
      // 3️⃣ CHECK IF DOCTOR ALREADY EXISTS
      // -------------------------------------------------
      const checkQuery = `
        SELECT doctor_id
        FROM doctor_mst
        WHERE
          TRIM(doctor_name) = TRIM(?)
          AND TRIM(speciality) = TRIM(?)
          AND empcode = ?
          AND TRIM(qualification) = TRIM(?)
          AND created_by = ?
          AND dept_id = ?
          AND status = 'Y'
        LIMIT 1
      `;

      const existing = await new Promise((resolve, reject) => {
        db.query(
          checkQuery,
          [
            doctor_name,
            speciality,
            empcode,
            qualification,
            userId,
            deptId
          ],
          (err, result) => (err ? reject(err) : resolve(result))
        );
      });

      if (existing.length > 0) {
        failedList.push({
          ...row,
          Status: "Failed",
          Remark: "Doctor already exists"
        });
        continue;
      }

      // -------------------------------------------------
      // 4️⃣ INSERT NEW DOCTOR
      // -------------------------------------------------
      try {
        const insertQuery = `
          INSERT INTO doctor_mst
          (
            doctor_name,
            speciality,
            garnet_code,
            rps_flag,
            status,
            created_date,
            empcode,
            qualification,
            doc_unique_code,
            subarea,
            grade,
            created_by,
            dept_id
          )
          VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [
              doctor_name,
              speciality,
              garnet_code,
              rps_flag,
              statusVal,
              empcode,
              qualification,
              doc_unique_code,
              subarea,
              grade,
              userId,
              deptId
            ],
            (err) => (err ? reject(err) : resolve())
          );
        });

        successList.push({
          ...row,
          Status: "Success",
          Remark: ""
        });

      } catch (err) {
        failedList.push({
          ...row,
          Status: "Failed",
          Remark: err.message
        });
      }
    }

    // ============================================================
    // FINAL RESPONSE
    // ============================================================
    return res.status(200).json({
      errorCode: 1,
      message: "Doctor CSV processed successfully",
      successCount: successList.length,
      failedCount: failedList.length,
      successList,
      failedList,
    });

  } catch (error) {
    logger.error(`Error in /controller/doctor/doctorCSVUpsert: ${error.message}`);
    return res.status(500).json({
      errorCode: 0,
      message: "We are unable to process your request right now. Please try again later.",
      error: error.message
    });
  }
};


exports.deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;

  if (!doctorId) {
    res.status(400).json({
      errorCode: 0,
      message: "Doctor Id is invalid",
      errorDetail: err.message,
    });
  }

  const query = 'update doctor_mst set status = "N" where doctor_id =?'
  try {
    db.query(query, [doctorId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/doctor/deleteDoctor: ${err.message}`);

        res.status(500).json({
          errorCode: 0,
          message: "We are unable to process your request right now. Please try again later.",
          errorDetail: err.message,
        });
      }
      else {
        res.status(200).json({ message: "Doctor Deleted Successfully", errorCode: "1" })
      }
    });
  } catch (error) {
    logger.error(`Error in /controller/doctor/deleteDoctor: ${err.message}`);
    res.status(500).json({
      errorCode: 0,
      message: "We are unable to process your request right now. Please try again later.",
      errorDetail: err.message,
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      doctor_id,
      doctor_name = "",
      speciality = "",
      garnet_code = "",
      rps_flag = "Non-RPS",
      status = "Y",
      qualification = "",
      doc_unique_code = "",
      empcode,
      subarea = "",
      grade = "",
      userId
    } = req.body;

    // 1️⃣ Validate
    if (!doctor_id) {
      return res.status(400).json({
        errorCode: 0,
        message: "doctor_id is required",
      });
    }

    if (!doctor_name || String(doctor_name).trim() === "") {
      return res.status(400).json({
        errorCode: 0,
        message: "doctor_name is required",
      });
    }

    if (!speciality || String(speciality).trim() === "") {
      return res.status(400).json({
        errorCode: 0,
        message: "speciality is required",
      });
    }

    if (!empcode || String(empcode).trim() === "") {
      return res.status(400).json({
        errorCode: 0,
        message: "empcode is required",
      });
    }

    // 1️⃣ Validate required field
    if (!qualification || String(qualification).trim() === "") {
      return res.status(400).json({
        errorCode: 0,
        message: "qualification is required",
      });
    }

    if (!userId || String(userId).trim() === "") {
      return res.status(400).json({
        errorCode: 0,
        message: "userId is required",
      });
    }

    // 2️⃣ Check if doctor exists
    const checkQuery = `
      SELECT doctor_id 
      FROM doctor_mst 
      WHERE doctor_id = ?
      LIMIT 1
    `;

    const doctorExists = await new Promise((resolve, reject) => {
      db.query(checkQuery, [doctor_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (doctorExists.length === 0) {
      return res.status(404).json({
        errorCode: 0,
        message: "Doctor not found",
      });
    }

    // 3️⃣ Update everything
    const updateQuery = `
      UPDATE doctor_mst
      SET 
        doctor_name = ?,
        empcode=?,
        speciality = ?,
        garnet_code = ?,
        rps_flag = ?,
        status = ?,
        qualification = ?,
        doc_unique_code = ?,
        subarea = ?,
        grade = ?,
        updated_by = ?,
        updated_date = NOW()
      WHERE doctor_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(
        updateQuery,
        [
          doctor_name,
          empcode,
          speciality,
          garnet_code,
          rps_flag,
          status,
          qualification,
          doc_unique_code,
          subarea,
          grade,
          userId,
          doctor_id
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // 4️⃣ Response
    return res.status(200).json({
      errorCode: 1,
      message: "Doctor updated successfully",
      mode: "UPDATE",
      doctor_id,
      garnet_code
    });

  } catch (error) {
    logger.error(`Error in /controller/doctor/updateDoctor: ${error.message}`);
    return res.status(500).json({
      errorCode: 0,
      error: error.message,
      message: "We are unable to process your request right now. Please try again later."
    });
  }
};