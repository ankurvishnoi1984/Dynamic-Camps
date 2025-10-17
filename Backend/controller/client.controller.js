const db = require("../config/db")
const logger = require('../utils/logger')

exports.addNewClient = (req,res)=>{
    const {clientName,coName,coContact,coEmail,userId} = req.body;
    const query = `insert into client_mst (
    client_name,
    coordinator_name,
    coordinator_contact,
    coordinator_email,
    created_by
    )
    values (?,?,?,?,?)`
        try {
        db.query(query,
            [
               clientName,
               coName,
               coContact,
               coEmail,
               userId
            ],
            (err, results) => {
                if (err) {
                    logger.error(`Error in /controller/client/addNewClient (query): ${err.message}`);
                    return res.status(500).json({
                        errorCode: 0,
                        errorDetail: err.message,
                        responseData: {},
                        status: "ERROR",
                        details: "Failed to create camp reports",
                    });
                }
                res.status(200).json({
                    message: 'Created successfully',
                    errorCode: 1,
                    data: results,
                });
            }

        )
    } catch (error) {
        logger.error(`Error in /controller/camps/prescriptionUpload (try-catch): ${error.message}`);
        res.status(500).json({ message: "Unexpected error occurred", error });
    }

}