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