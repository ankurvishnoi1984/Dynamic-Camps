const db = require("../config/db");
const csv = require("csvtojson");
const logger = require("../utils/logger");

exports.getAllEmployee = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const searchName = req.query.searchName || '';
  const empcodeFilter = req.query.empcode || '';
  const deptId = req.query.deptId || '';
  console.log("deptId",deptId)

  if (!deptId) {
    return res.status(400).json({
      success: false,
      message: "Department ID (deptId) is required.",
    });
  }

  // Fully qualify dept_id column to avoid ambiguity
  const deptConditionBase = deptId ? `AND u.dept_id = ${db.escape(deptId)}` : '';
  const deptConditionCTE = deptId ? `AND eh.dept_id = ${db.escape(deptId)}` : '';

  // Recursive CTE for employee hierarchy
  const baseCTE = `
    WITH RECURSIVE employee_hierarchy AS (
      SELECT 
        u.user_id, 
        u.empcode, 
        u.name, 
        u.designation, 
        u.role, 
        u.doj,
        u.zone,
        u.region,
        u.area,
        u.hq,
        u.reporting,
        u.mobile,
        u.email,
        u.status,
        u.dept_id
      FROM user_mst u
      WHERE u.status = 'Y'
        ${empcodeFilter ? `AND u.empcode = ${db.escape(empcodeFilter)}` : ''}

      UNION ALL

      SELECT 
        u.user_id, 
        u.empcode, 
        u.name, 
        u.designation, 
        u.role, 
        u.doj,
        u.zone,
        u.region,
        u.area,
        u.hq,
        u.reporting,
        u.mobile,
        u.email,
        u.status,
        u.dept_id
      FROM user_mst u
      INNER JOIN employee_hierarchy eh 
        ON u.reporting = eh.empcode
      WHERE u.status = 'Y'
        
    )
  `;

  const dataQuery = `
    ${baseCTE}
    SELECT *
    FROM employee_hierarchy
    WHERE name LIKE ${db.escape('%' + searchName + '%')}
    AND dept_id = ${deptId}
    LIMIT ${limit} OFFSET ${offset};
  `;

  const countQuery = `
    ${baseCTE}
    SELECT COUNT(*) AS totalCount
    FROM employee_hierarchy
    WHERE name LIKE ${db.escape('%' + searchName + '%')}
    AND dept_id = ${deptId};
  `;

  try {
    const [users, totalRowCountResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(dataQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(countQuery, (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        });
      }),
    ]);
    res.status(200).json({
      success: true,
      users,
      totalCount: totalRowCountResult.totalCount,
      filters: {
        dept_id: deptId,
        empcode: empcodeFilter || null,
        search: searchName || null,
      },
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching employee data",
      error: error.message,
    });
  }
};


exports.addEmployee = (req, res) => {
  const {
    name,
    empcode,
    hq,
    reporting,
    password,
    designation,
    zone,
    region,
    mobile,
    email,
    created_by,
    deptId,
  } = req.body;

  if (!name || !empcode || !designation || !created_by || !deptId) {
    return res
      .status(400)
      .json({ errorCode: "0", message: "Missing required fields" });
  }

  // 1️⃣ Fetch role_id for the given designation & dept
  const roleQuery = `
    SELECT role_id 
    FROM designation_mst
    WHERE LOWER(TRIM(designation)) = LOWER(TRIM(?))
      AND dept_id = ?
      AND status = 'Y'
    LIMIT 1;
  `;

  db.query(roleQuery, [designation, deptId], (err, roleResult) => {
    if (err) {
      logger.error(err.message);
      return res.status(500).json({ errorCode: "0", message: err.message });
    }

    // ❌ If designation not found in DB
    if (roleResult.length === 0) {
      return res.status(400).json({
        errorCode: "0",
        message: "Invalid designation for this department",
      });
    }

    const role = roleResult[0].role_id;

    // 2️⃣ Insert employee with fetched role
    const insertQuery = `
      INSERT INTO user_mst
      (empcode, name, designation, role, zone, region, hq, reporting, 
       mobile, email, password, status, created_by, created_date, dept_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Y', ?, NOW(), ?)
    `;

    const insertValues = [
      empcode,
      name,
      designation,
      role,
      zone,
      region,
      hq,
      reporting,
      mobile,
      email,
      password,
      created_by,
      deptId
    ];

    db.query(insertQuery, insertValues, (err, result) => {
      if (err) {
        logger.error(err.message);
        return res.status(500).json({ errorCode: "0", message: err.message });
      }

      return res.status(200).json({
        errorCode: "1",
        message: "Employee added successfully",
      });
    });
  });
};

exports.updateEmp = (req, res) => {
  const {
    user_id,
    name,
    empcode,
    state,
    hq,
    reporting,
    password,
    designation,
    joiningDate,
    zone,
    region,
    mobile,
    email,
    dob,
    modified_by,
  } = req.body;

  if (!user_id || !name || !empcode || !designation) {
    return res
      .status(400)
      .json({ errorCode: "0", message: "Missing required fields" });
  }

  // 1️⃣ First fetch user's department (we need deptId for role lookup)
  const getDeptQuery = `
      SELECT dept_id 
      FROM user_mst 
      WHERE user_id = ?
      LIMIT 1;
  `;

  db.query(getDeptQuery, [user_id], (err, deptResult) => {
    if (err) {
      logger.error(err.message);
      return res.status(500).json({ errorCode: "0", message: err.message });
    }

    if (deptResult.length === 0) {
      return res.status(404).json({
        errorCode: "0",
        message: "Employee not found",
      });
    }

    const deptId = deptResult[0].dept_id;

    // 2️⃣ Fetch role_id from designation_mst for the given designation + deptId
    const roleQuery = `
        SELECT role_id
        FROM designation_mst
        WHERE LOWER(TRIM(designation)) = LOWER(TRIM(?))
          AND dept_id = ?
          AND status = 'Y'
        LIMIT 1;
    `;

    db.query(roleQuery, [designation, deptId], (err, roleResult) => {
      if (err) {
        logger.error(err.message);
        return res.status(500).json({ errorCode: "0", message: err.message });
      }

      if (roleResult.length === 0) {
        return res.status(400).json({
          errorCode: "0",
          message: "Invalid designation for this department",
        });
      }

      const role = roleResult[0].role_id;

      // 3️⃣ Update employee record
      const updateQuery = `
        UPDATE user_mst 
        SET 
          name = ?, 
          empcode = ?, 
          designation = ?, 
          role = ?, 
          doj = ?, 
          zone = ?, 
          region = ?, 
          hq = ?, 
          reporting = ?, 
          mobile = ?, 
          email = ?, 
          password = ?, 
          dob = ?, 
          state = ?, 
          updated_by = ?, 
          modified_date = NOW()
        WHERE user_id = ?
      `;

      const updateValues = [
        name,
        empcode,
        designation,
        role,
        joiningDate,
        zone,
        region,
        hq,
        reporting,
        mobile,
        email,
        password,
        dob,
        state,
        modified_by,
        user_id,
      ];

      db.query(updateQuery, updateValues, (err, result2) => {
        if (err) {
          logger.error(err.message);
          return res.status(500).json({ errorCode: "0", message: err.message });
        }

        if (result2.affectedRows === 0) {
          return res
            .status(404)
            .json({ errorCode: "0", message: "Employee not found" });
        }

        return res.status(200).json({
          errorCode: "1",
          message: "Employee updated successfully",
        });
      });
    });
  });
};

exports.deleteEmployee = async (req, res) => {
    const userId = req.params.id;

    const query = 'update user_mst set status = "N" where user_id =?'
    try {
        db.query(query, [userId], (err, result) => {
            if (err) {
                logger.error(err.message);

                res.status(500).json({
                    errorCode: "0",
                    errorDetail: err.message,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else {
                logger.info('Employee Delete Successfully');

                res.status(200).json({ message: "Employee Deleted Successfully", errorCode: "1" })
            }
        });
    } catch (error) {
        logger.error(error.message);

        res.send(error)
    }
};
exports.getEmployeeWithId = async (req, res) => {
    const userId = req.params.id;

    const query = 'select * from user_mst where user_id = ? AND status = "Y"'
    try {
        db.query(query, [userId], (err, result) => {
            if (err) {
                logger.error(err.message);

                res.status(500).json({
                    errorCode: 0,
                    errorDetail: err.message,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else {
                logger.info('Fetch Employee Successfully');

                res.status(200).json({ user: result, errorCode: 1 })
            }
        });
    } catch (error) {
        logger.error(error.message);

        res.send(error)
    }
};

exports.getSeniorEmpcodesByDesignation = async (req, res) => {
  const { designation, deptId } = req.body;

  if (!designation) {
    return res.status(400).json({ message: "designation is required" });
  }

  // Separate conditions for each scope
  const deptConditionBase = deptId ? `AND u.dept_id = ${db.escape(deptId)}` : "";
  const deptConditionRecursive = deptId ? `AND s.dept_id = ${db.escape(deptId)}` : "";
  const deptConditionFinal = deptId ? `AND dept_id = ${db.escape(deptId)}` : "";

  const query = `
    WITH RECURSIVE senior_hierarchy AS (
      SELECT 
        u.user_id,
        u.empcode,
        u.name,
        u.reporting,
        u.dept_id
      FROM user_mst u
      WHERE u.status = 'Y' 
        AND u.designation = ?
        ${deptConditionBase}

      UNION ALL

      SELECT 
        s.user_id,
        s.empcode,
        s.name,
        s.reporting,
        s.dept_id
      FROM user_mst s
      INNER JOIN senior_hierarchy sh 
        ON sh.reporting = s.empcode
      WHERE s.status = 'Y'
        ${deptConditionRecursive}
    )
    SELECT DISTINCT empcode, name
    FROM senior_hierarchy
    WHERE empcode NOT IN (
      SELECT empcode FROM user_mst WHERE designation = ? ${deptConditionFinal}
    )
    ORDER BY name;
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [designation, designation], (err, rows) => {
        if (err) {
          logger.error(`Error in getSeniorEmpcodesByDesignation: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const seniors = result.map((r) => ({
      empcode: r.empcode,
      name: r.name,
    }));

    res.status(200).json({
      success: true,
      filters: { designation, deptId: deptId || null },
      totalSeniors: seniors.length,
      seniors,
    });
  } catch (error) {
    logger.error(`Error in getSeniorEmpcodesByDesignation: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching senior empcodes",
      error: error.message,
    });
  }
};

exports.getSeniorEmployees = async (req, res) => {
  const { designation, deptId } = req.body;

  if (!designation) {
    return res.status(400).json({
      success: false,
      message: "designation is required",
    });
  }

  if (!deptId) {
    return res.status(400).json({
      success: false,
      message: "deptId is required",
    });
  }

  try {
    // 1️⃣ Check if designation is top hierarchy
    const topHierarchyCheckQuery = `
      SELECT is_top_hierarchy 
      FROM designation_mst
      WHERE LOWER(TRIM(designation)) = LOWER(TRIM(?))
        AND dept_id = ?
        AND status = 'Y'
      LIMIT 1;
    `;

    const topRows = await new Promise((resolve, reject) => {
      db.query(topHierarchyCheckQuery, [designation, deptId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const isTopHierarchy =
      topRows.length > 0 && topRows[0].is_top_hierarchy === "Y";

    // 2️⃣ If top hierarchy → return Admin (trimmed fields only)
    if (isTopHierarchy) {
      const adminQuery = `
        SELECT 
          empcode,
          name,
          designation
        FROM user_mst
        WHERE LOWER(TRIM(designation)) = 'admin'
          AND dept_id = ?
          AND status = 'Y'
        LIMIT 1;
      `;

      const admin = await new Promise((resolve, reject) => {
        db.query(adminQuery, [deptId], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      return res.status(200).json({
        success: true,
        message: "Top hierarchy detected — returning Admin details",
        input: { designation, deptId },
        total: admin.length,
        seniors: admin,
      });
    }

    // 3️⃣ ELSE (existing logic for normal hierarchy)
    const recursiveQuery = `
      WITH RECURSIVE senior_designations AS (
        SELECT 
          LOWER(TRIM(d.designation)) COLLATE utf8mb4_general_ci AS designation,
          LOWER(TRIM(d.reporting)) COLLATE utf8mb4_general_ci AS reporting
        FROM designation_mst d
        WHERE LOWER(TRIM(d.designation)) COLLATE utf8mb4_general_ci = LOWER(TRIM(?)) COLLATE utf8mb4_general_ci
          AND d.dept_id = ?
          AND d.status = 'Y'

        UNION ALL

        SELECT
          LOWER(TRIM(d2.designation)) COLLATE utf8mb4_general_ci,
          LOWER(TRIM(d2.reporting)) COLLATE utf8mb4_general_ci
        FROM designation_mst d2
        INNER JOIN senior_designations sd
          ON sd.reporting = LOWER(TRIM(d2.designation)) COLLATE utf8mb4_general_ci
        WHERE d2.status = 'Y'
      )

      SELECT 
        u.empcode,
        u.name,
        u.designation
      FROM user_mst u
      WHERE u.status = 'Y'
        AND LOWER(TRIM(u.designation)) COLLATE utf8mb4_general_ci IN (
          SELECT designation 
          FROM senior_designations
          WHERE designation <> LOWER(TRIM(?)) COLLATE utf8mb4_general_ci
        )
        AND u.dept_id = ?
      ORDER BY u.designation, u.name;
    `;

    const params = [designation, deptId, designation, deptId];

    const rows = await new Promise((resolve, reject) => {
      db.query(recursiveQuery, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "All senior-level employees fetched",
      input: { designation, deptId },
      total: rows.length,
      seniors: rows,
    });

  } catch (error) {
    logger.error(`Error in getSeniorEmployees: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching senior employees",
      error: error.message,
    });
  }
};



exports.bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ errorCode: "0", message: "CSV file is required" });

    if (req.file.mimetype !== "text/csv")
      return res.status(400).json({ errorCode: "0", message: "Only CSV file is allowed" });

    const createdBy = req.body.created_by;
    const deptId = req.body.deptId;
    const empcode = req.body.empcode;

    if (!createdBy)
      return res.status(400).json({ errorCode: "0", message: "created_by is required" });

    if (!deptId)
      return res.status(400).json({ errorCode: "0", message: "deptId is required" });

    const users = await csv().fromFile(req.file.path);

    const requiredColumns = [
      "empcode", "name", "designation", "reporting",
      "mobile", "email", "password",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(users[0]).includes(col)
    );

    if (missingColumns.length > 0)
      return res.status(400).json({
        errorCode: "0",
        message: `Missing columns: ${missingColumns.join(", ")}`,
      });

    // 1️⃣ Extract reporting empcodes
    const reportingEmpcodes = [...new Set(users.map(u => u.reporting))];

    const placeholders = reportingEmpcodes.map(() => "?").join(",");
    const checkReportingQuery = `
      SELECT empcode, dept_id 
      FROM user_mst 
      WHERE empcode IN (${placeholders})
    `;
    const [reportingUsers] = await db.promise().query(checkReportingQuery, reportingEmpcodes);

    const reportingDeptMap = {};
    reportingUsers.forEach(r => reportingDeptMap[r.empcode] = r.dept_id);

    const invalidReportings = reportingEmpcodes.filter(emp =>
      reportingDeptMap[emp] && reportingDeptMap[emp] != deptId
    );

    if (invalidReportings.length > 0) {
      let msg = "";
      if (empcode && empcode === 10000) {
        msg = `Invalid Reporting: These employees do not belong to selected department (${deptId}): ${invalidReportings.join(", ")}`
      } else {
        msg = `Invalid Reporting: ${invalidReportings.join(", ")}`
      }
      return res.status(400).json({
        errorCode: "0",
        message: msg,
      });
    }

    // 2️⃣ Validate duplicate empcodes inside CSV
    const fileEmpcodes = users.map((u) => u.empcode);
    const uniqueEmpcodes = new Set(fileEmpcodes);
    if (fileEmpcodes.length !== uniqueEmpcodes.size)
      return res.status(400).json({
        errorCode: "0",
        message: "Duplicate empcode found inside CSV file",
      });

    // 3️⃣ Check duplicates in DB
    const placeholders2 = fileEmpcodes.map(() => "?").join(",");
    const checkQuery = `SELECT empcode FROM user_mst WHERE empcode IN (${placeholders2})`;
    const [existing] = await db.promise().query(checkQuery, fileEmpcodes);

    if (existing.length > 0)
      return res.status(400).json({
        errorCode: "0",
        message: `These empcodes are not available: ${existing.map(e => e.empcode).join(", ")}`,
      });

    // 4️⃣ Fetch role_id for ALL designations in the CSV (batch fetch)
    const csvDesignations = [...new Set(users.map(u => u.designation.trim()))];
    const designationPlaceholders = csvDesignations.map(() => "?").join(",");

    const designationQuery = `
      SELECT LOWER(TRIM(designation)) AS designation, role_id
      FROM designation_mst
      WHERE dept_id = ?
        AND status = 'Y'
        AND LOWER(TRIM(designation)) IN (${designationPlaceholders})
    `;

    const [designationRows] = await db.promise().query(designationQuery, [
      deptId,
      ...csvDesignations.map(d => d.toLowerCase())
    ]);

    // Convert to map: designation → role_id
    const roleMap = {};
    designationRows.forEach(d => {
      roleMap[d.designation] = d.role_id;
    });

    // ❌ Validate any invalid designation in CSV
    const invalidDesignations = csvDesignations.filter(
      d => !roleMap[d.toLowerCase()]
    );

    if (invalidDesignations.length > 0) {
      return res.status(400).json({
        errorCode: "0",
        message: `Invalid designation(s) for dept ${deptId}: ${invalidDesignations.join(", ")}`
      });
    }

    // 5️⃣ Prepare Insert Values using DB role_id
    const insertValues = users.map((u, index) => [
      u.empcode,
      u.name,
      u.designation,
      roleMap[u.designation.toLowerCase()],   // ⬅️ using DB role_id
      u.zone || null,
      u.region || null,
      u.hq || null,
      u.reporting,
      u.mobile,
      u.email,
      u.password,
      "Y",
      createdBy,
      deptId,
    ]);

    const insertQuery = `
      INSERT INTO user_mst
      (empcode, name, designation, role, zone, region, hq, reporting, 
       mobile, email, password, status, created_by, dept_id)
      VALUES ?
    `;

    await db.promise().query(insertQuery, [insertValues]);

    return res.status(200).json({
      errorCode: "1",
      message: "Users uploaded successfully ✅",
      totalInserted: insertValues.length,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ errorCode: "0", message: err.message });
  }
};

