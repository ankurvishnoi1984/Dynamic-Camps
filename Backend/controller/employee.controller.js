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

  // Role mapping based on designation
  const roleMapping = {
    "MARKETING EXECUTIVE": 5,
    "AREA BUSINESS MANAGER": 4,
    "SENIOR AREA BUSINESS MANAGER": 4,
    "REGIONAL MANAGER": 3,
    "SENIOR REGIONAL MANAGER": 3,
    "DIVISIONAL SALES MANAGER": 2,
    "ZONAL SALES MANAGER": 2,
    "SALES MANAGER": 2,
    "Associate General Manager - Sales - Sale": 1,
    "NATIONAL SALES MANAGER": 1,
  };

  const role = roleMapping[designation] || 5; // Default lowest if not found

  // Step 1️⃣ — Check if usernamehq already exists
  // const checkUsernameQuery = "SELECT user_id FROM user_mst WHERE usernamehq = ? AND status = 'Y'";
    // Step 2️⃣ — Insert new employee
    const insertQuery = `
      INSERT INTO user_mst
      (empcode, name, designation, role, zone, region, hq, reporting, 
       mobile, email, password, status, created_by, created_date,dept_id)
      VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, 'Y', ?, NOW(),?)
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

    db.query(insertQuery, insertValues, (err, result2) => {
      if (err) {
        logger.error(err.message);
        return res.status(500).json({ errorCode: "0", message: err.message });
      }

      return res.status(200).json({
        errorCode: "1",
        message: "Employee added successfully",
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

    // 🧭 Role mapping based on designation
    const roleMapping = {
        "MARKETING EXECUTIVE": 5,
        "AREA BUSINESS MANAGER": 4,
        "SENIOR AREA BUSINESS MANAGER": 4,
        "REGIONAL MANAGER": 3,
        "SENIOR REGIONAL MANAGER": 3,
        "DIVISIONAL SALES MANAGER": 2,
        "ZONAL SALES MANAGER": 2,
        "SALES MANAGER": 2,
        "ASSOCIATE GENERAL MANAGER - SALES": 1,
        "NATIONAL SALES MANAGER": 1,
    };

    const role = roleMapping[designation] || 5; // default lowest role if not found

      // 🧩 Step 2️⃣ — Perform the update
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

            return res
                .status(200)
                .json({ errorCode: "1", message: "Employee updated successfully" });
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

exports.bulkUploadUsers = async (req, res) => {
  const roleMapping = {
    "MARKETING EXECUTIVE": 5,
    "AREA BUSINESS MANAGER": 4,
    "SENIOR AREA BUSINESS MANAGER": 4,
    "REGIONAL MANAGER": 3,
    "SENIOR REGIONAL MANAGER": 3,
    "DIVISIONAL SALES MANAGER": 2,
    "ZONAL SALES MANAGER": 2,
    "SALES MANAGER": 2,
    "Associate General Manager - Sales - Sale": 1,
    "NATIONAL SALES MANAGER": 1,
  };

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

    // ✅ Extract all reporting empcodes
    const reportingEmpcodes = [...new Set(users.map(u => u.reporting))];

    // ✅ Validate Reporting Exists in SAME department
    const placeholders = reportingEmpcodes.map(() => "?").join(",");
    const checkReportingQuery = `
      SELECT empcode, dept_id 
      FROM user_mst 
      WHERE empcode IN (${placeholders})
    `;
    const [reportingUsers] = await db.promise().query(checkReportingQuery, reportingEmpcodes);

    // Create map empcode → dept
    const reportingDeptMap = {};
    reportingUsers.forEach(r => reportingDeptMap[r.empcode] = r.dept_id);

    // Find Invalid Reporting References
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

    // ✅ Validate duplicate empcodes inside CSV
    const fileEmpcodes = users.map((u) => u.empcode);
    const uniqueEmpcodes = new Set(fileEmpcodes);
    if (fileEmpcodes.length !== uniqueEmpcodes.size)
      return res.status(400).json({
        errorCode: "0",
        message: "Duplicate empcode found inside CSV file",
      });

    // ✅ Check duplicate empcodes in DB
    const placeholders2 = fileEmpcodes.map(() => "?").join(",");
    const checkQuery = `SELECT empcode FROM user_mst WHERE empcode IN (${placeholders2})`;
    const [existing] = await db.promise().query(checkQuery, fileEmpcodes);

    if (existing.length > 0)
      return res.status(400).json({
        errorCode: "0",
        message: `These empcodes are not available: ${existing.map(e => e.empcode).join(", ")}`,
      });

    // ✅ Prepare Insert Values
    const insertValues = users.map((u) => [
      u.empcode,
      u.name,
      u.designation,
      roleMapping[u.designation] || 5,
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

