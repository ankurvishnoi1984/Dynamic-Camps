const db = require("../config/db")
const logger = require('../utils/logger');

exports.getBrandsList = async (req, res) => {
    const deptId = req.body;
    const query = `
        SELECT MIN(brand_id) AS brand_id, brand_name
        FROM brand_mst
        WHERE status = 'Y'
        AND dept_id = ?
        GROUP BY brand_name
    `;
    try {
        db.query(query,[deptId], (err, result) => {
            if (err) {
                logger.error(`Error in /controller/basic/getBrandsList: ${err.message}`);
                return res.status(500).json({
                    errorCode: "INTERNAL_SERVER_ERROR",
                    errorDetail: err.message,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            if (result.length === 0) {
                return res.status(200).json({ message: "Brands list not found", errorCode: 2 });
            }
            res.status(200).json({
                message: "Brands listed successfully",
                errorCode: 1,
                data: result
            });
        });
    } catch (error) {
        logger.error(`Error in /controller/basic/getBrandsList: ${error.message}`);
        res.send(error);
    }
}