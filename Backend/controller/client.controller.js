const db = require("../config/db")
const logger = require('../utils/logger')

exports.addNewClient = (req, res) => {
  const { clientName, coName, coContact, userId } = req.body;

  // Handle file upload
  let logoFile = null;
  if (req.files && req.files.length > 0) {
    const logo = req.files.find((f) => f.fieldname === "logo");
    if (logo) {
      logoFile = logo.filename; // save filename in DB
    }
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
          logger.error(
            `Error in /controller/client/addNewClient (query): ${err.message}`
          );
          return res.status(500).json({
            errorCode: 0,
            errorDetail: err.message,
            responseData: {},
            status: "ERROR",
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
    logger.error(
      `Error in /controller/client/addNewClient (try-catch): ${error.message}`
    );
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};



exports.getClientDetails = (req, res) => {
  const { searchKeyword } = req.body; // or req.query if using GET method

  let query = `
    SELECT 
      client_id,
      client_name,
      coordinator_name,
      coordinator_contact,
      logo,
      created_at
    FROM client_mst
    WHERE status = 'Y'
  `;

  const params = [];

  // Optional search filter
 if (searchKeyword && searchKeyword.trim() !== "") {
    query += ` AND LOWER(client_name) LIKE ?`;
    params.push(`%${searchKeyword.trim().toLowerCase()}%`);
  }

  query += ` ORDER BY client_name ASC`; // Optional sorting

  try {
    db.query(query, params, (err, results) => {
      if (err) {
        logger.error(`Error in /controller/client/getClientDetails (query): ${err.message}`);
        return res.status(500).json({
          errorCode: 0,
          errorDetail: err.message,
          responseData: {},
          details: "Failed to fetch client details",
        });
      }

      res.status(200).json({
        message: "Client details fetched successfully",
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

// controller/clientController.js
exports.updateClient = (req, res) => {
  const { clientId, clientName, coName, coContact, userId } = req.body;

  // Handle file upload (optional)
  let logoFile = null;
  if (req.files && req.files.length > 0) {
    const logo = req.files.find((f) => f.fieldname === "logo");
    if (logo) {
      logoFile = logo.filename;
    }
  }

  // Build query dynamically (if logo not provided, don’t overwrite)
  const query = logoFile
    ? `
        UPDATE client_mst
        SET 
          client_name = ?,
          coordinator_name = ?,
          coordinator_contact = ?,
          logo = ?,
          modified_by = ?,
          modified_date = NOW()
        WHERE client_id = ?
      `
    : `
        UPDATE client_mst
        SET 
          client_name = ?,
          coordinator_name = ?,
          coordinator_contact = ?,
          modified_by = ?,
          modified_date = NOW()
        WHERE client_id = ?
      `;

  const params = logoFile
    ? [clientName, coName, coContact, logoFile, userId, clientId]
    : [clientName, coName, coContact, userId, clientId];

  try {
    db.query(query, params, (err, result) => {
      if (err) {
        logger.error(
          `Error in /controller/client/updateClient: ${err.message}`
        );
        return res.status(500).json({
          status: "ERROR",
          errorCode: 0,
          errorDetail: err.message,
          message: "Failed to update client record",
        });
      }

      res.status(200).json({
        message: "Client updated successfully",
        errorCode: 1,
        data: result,
      });
    });
  } catch (error) {
    logger.error(
      `Error in /controller/client/updateClient (try-catch): ${error.message}`
    );
    res.status(500).json({
      message: "Unexpected error occurred",
      error: error.message,
    });
  }
};
