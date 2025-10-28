const db = require("../config/db")
const logger = require('../utils/logger')

exports.addNewClient = (req, res) => {
  const { clientName, coName, coContact, userId } = req.body;

  if (!clientName || !coName || !coContact || !userId) {
    return res.status(400).json({
      errorCode: 0,
      message: "Missing required fields",
      details: "clientName, coName, coContact, and userId are required.",
    });
  }

  // Handle file upload (logo)
  let logoFile = null;
  if (req.file) {
    // If multer single('logo') used
    logoFile = req.file.filename;
  } else if (req.files && req.files.logo) {
    // If multer fields([{ name: 'logo', maxCount: 1 }]) used
    logoFile = req.files.logo[0].filename;
  }

  const query = `
    INSERT INTO client_mst (
      client_name,
      coordinator_name,
      coordinator_contact,
      logo,
      created_by
    )
    VALUES (?,?,?,?,?)
  `;

  try {
    db.query(
      query,
      [clientName, coName, coContact, logoFile, userId],
      (err, results) => {
        if (err) {
          logger.error(`Error in /controller/client/addNewClient (query): ${err.message}`);
          return res.status(500).json({
            errorCode: 0,
            errorDetail: err.message,
            details: "Failed to create client record",
          });
        }

        res.status(200).json({
          message: "Client created successfully",
          errorCode: 1,
          data: results,
        });
      }
    );
  } catch (error) {
    logger.error(`Error in /controller/client/addNewClient (try-catch): ${error.message}`);
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};



exports.getClientDetails = (req, res) => {
  const query = `
    SELECT 
     client_id,
     client_name,
     coordinator_name,
     coordinator_contact,
     created_at

     FROM client_mst

     WHERE status = 'Y'
  `;

  try {
    db.query(query, (err, results) => {
      if (err) {
        logger.error(`Error in /controller/client/getClientDetails (query): ${err.message}`);
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
    logger.error(`Error in /controller/client/getClientDetails (catch): ${error.message}`);
    res.status(500).json({
      errorCode: 0,
      errorDetail: error.message,
      responseData: {},
      details: "Unexpected error occurred",
    });
  }
};