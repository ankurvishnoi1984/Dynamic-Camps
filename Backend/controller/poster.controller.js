const moment = require("moment/moment");
const db = require("../config/db")
const logger = require('../utils/logger')
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");


// Define the uploads path
const uploadsfile2 = path.join(__dirname, '../uploads/poster');



exports.addDoctor = async (req, res) => {
  const { userId, doctorName, code = 0, campDate, campVenue, campTime, subCatId = 0, deptId, speciality } = req.body;
  const formattedCampDate = moment(campDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const filename = req.file && req.file.filename ? req.file.filename : null;
  const query = 'INSERT INTO doctordata (doctor_name, doctor_img, camp_date, camp_time, code, camp_venue,subcat_id, user_id, created_by,doctor_qualification,dept_id) VALUES (?,?,?,?,?,?,?,?,?,?,?);'
  try {
    db.query(query, [doctorName, filename, formattedCampDate, campTime, code, campVenue, subCatId, userId, userId, speciality, deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/doctor/addDoctor: ${err.message}. SQL query: ${query}`);
        res.status(500).json({
          errorCode: "0",
          errorDetail: err,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      }
      else {
        const docid = result.insertId;
        res.status(200).json({
          message: "Doctor Added Successfully",
          errorCode: "1",
          docid
        })
      }
    });
  } catch (error) {
    logger.error(`Error in /controller/doctor/addDoctor: ${error.message}`);
    res.send(error)
  }
}
exports.getAllDoctorsByEmp = async (req, res) => {
  const { userId, deptId, searchText } = req.body;

  let query = `
    SELECT 
      doctor_id,
      doctor_name,
      code,
      camp_venue,
      camp_date,
      camp_time,
      doctor_img,
      doctor_qualification,
      doctor_city,
      doctor_state
    FROM doctordata
    WHERE user_id = ?
      AND dept_id = ?
      AND status = 'Y'
  `;

  const params = [userId, deptId];

  // 🔍 Apply search only if text exists
  if (searchText && searchText.trim() !== "") {
    query += ` AND doctor_name LIKE ?`;
    params.push(`%${searchText.trim()}%`);
  }

  query += ` ORDER BY doctor_id DESC`;

  try {
    db.query(query, params, (err, result) => {
      if (err) {
        logger.error(
          `Error in /controller/doctor/getAllPosterDoctorsByEmp: ${err.message}. SQL query: ${query}`
        );

        return res.status(500).json({
          errorCode: "0",
          status: "ERROR",
          details: "An internal server error occurred",
        });
      }

      const formattedResult = result.map((item) => ({
        ...item,
        camp_date: moment(item.camp_date).format("DD-MM-YYYY"),
      }));

      res.status(200).json({
        message: "Doctor List fetched successfully",
        errorCode: 1,
        data: formattedResult,
      });
    });
  } catch (error) {
    logger.error(
      `Error in /controller/doctor/getAllPosterDoctorsByEmp: ${error.message}`
    );
    res.status(500).json({
      errorCode: "0",
      status: "ERROR",
    });
  }
};


exports.getPosterByDoctorId = async (req, res) => {
  const { docId, subCatId, deptId } = req.body;

  const query = `
    SELECT 
      upm.*,
      d.doctor_id,
      d.doctor_name,
      d.doctor_qualification,
      d.camp_venue,
      d.camp_date
    FROM user_poster_mst upm
    INNER JOIN doctordata d 
      ON d.doctor_id = upm.doctor_id
    WHERE upm.doctor_id = ?
      AND upm.subcat_id = ?
      AND upm.dept_id = ?
  `;

  try {
    db.query(query, [docId, subCatId, deptId], (err, result) => {
      if (err) {
        logger.error(
          `Error in /controller/doctor/getPosterByDoctorId: ${err.message}. SQL query: ${query}`
        );

        return res.status(500).json({
          errorCode: "0",
          status: "ERROR",
          details: "An internal server error occurred",
        });
      }
      if (result.length === 0) {
        return res.status(200).json({
          message: "Poster & Doctor data fetched successfully",
          errorCode: 1,
          result: [{
            poster_name:"Backend/uploads/noPoster"
          }]
        });
      }
      res.status(200).json({
        message: "Poster & Doctor data fetched successfully",
        errorCode: 1,
        result,
      });
    });
  } catch (error) {
    logger.error(
      `Error in /controller/doctor/getPosterByDoctorId: ${error.message}. SQL query: ${query}`
    );

    res.status(500).json({
      errorCode: "0",
      status: "ERROR",
    });
  }
};

exports.downloadPoster = (req, res) => {
  try {
    const { filename } = req.params;
    const { userId, deptId } = req.query;

    // Validate filename
    if (!/^[\w.\-]+$/.test(filename)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid filename",
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads/poster",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        errorCode: 0,
        status: "ERROR",
        message: "File not found",
      });
    }

    /**
     * 1️⃣ Fetch poster + doctor info
     */
    const posterQuery = `
      SELECT 
        upm.upid AS poster_id,
        upm.doctor_id,
        upm.dept_id
      FROM user_poster_mst upm
      WHERE upm.poster_name LIKE ?
      LIMIT 1
    `;

    db.query(
      posterQuery,
      [`%${filename}`],
      (err, posterResult) => {
        if (err || posterResult.length === 0) {
          logger.error("Poster lookup failed", err);
          // Continue download even if logging fails
        } else {
          const { poster_id, doctor_id } = posterResult[0];

          /**
           * 2️⃣ Insert download log
           */
          const logQuery = `
            INSERT INTO user_poster_download_log
            (user_id, poster_id, doctor_id, download_type, dept_id)
            VALUES (?, ?, ?, ?, ?)
          `;

          const logValues = [
            userId || 0,
            poster_id,
            doctor_id,
            "IMAGE_DOWNLOAD",
            deptId || posterResult[0].dept_id,
          ];

          db.query(logQuery, logValues, (logErr) => {
            if (logErr) {
              logger.error(
                `Poster download log error: ${logErr.message}`
              );
            }
          });
        }

        /**
         * 3️⃣ Download file (ALWAYS happens)
         */
        res.download(filePath, filename, (downloadErr) => {
          if (downloadErr) {
            logger.error(`Download error: ${downloadErr.message}`);
            res.status(500).json({
              errorCode: 0,
              status: "ERROR",
              message: "Unable to download file",
            });
          }
        });
      }
    );
  } catch (err) {
    logger.error(`Download Poster Error: ${err.message}`);
    res.status(500).json({
      errorCode: 0,
      status: "ERROR",
    });
  }
};


exports.getCategoryByDept = async (req, res) => {
  const { deptId } = req.body;

  const query = `
       SELECT * from category_mst 
       WHERE status = 'Y'
       AND dept_id = ?
    `;
  try {
    db.query(query, [deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/posters/getCategoryByDept: ${err.message}`);
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
        return res.status(200).json({ message: "Brands list not found", errorCode: 1 });
      }
      res.status(200).json({
        message: "Brands listed successfully",
        errorCode: 1,
        data: result
      });
    });
  } catch (error) {
    console.log("error brandlist", error)
    logger.error(`Error in /controller/posters/getCategoryByDept: ${error.message}`);
    res.send(error);
  }
}

exports.getSubCategoryByDept = async (req, res) => {
  const { deptId, categoryId } = req.body;

  const query = `
       SELECT * from subcategory_mst 
       WHERE status = 'Y'
       AND dept_id = ?
       AND category_id=?
    `;
  try {
    db.query(query, [deptId, categoryId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/posters/getSubCategoryByDept: ${err.message}`);
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
        return res.status(200).json({ message: "Subcategory list not found", errorCode: 1, data: [] });
      }
      res.status(200).json({
        message: "Subcategory listed successfully",
        errorCode: 1,
        data: result
      });
    });
  } catch (error) {
    console.log("error brandlist", error)
    logger.error(`Error in /controller/posters/getSubCategoryByDept: ${error.message}`);
    res.send(error);
  }
}

exports.updatePosterDoctor = async (req, res) => {
  const { userId, doctorId, doctorName, campDate, campVenue, code = 0, campTime, doctorImg } = req.body;
  const formattedCampDate = moment(campDate, 'DD-MM-YYYY').format('YYYY-MM-DD');


  let filename;
  if (req.file) {

    filename = req.file.filename;
    // Check if there was an existing image filename in the request
    const existingImageFilename = doctorImg;

    // Delete the existing image from your filesystem if it exists
    if (existingImageFilename) {
      fs.unlink(`./uploads/profile/${existingImageFilename}`, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting image: ', unlinkErr);
        }
      });
    }
  }
  const query = 'CALL UpdateDoctor(?, ?, ?, ?, ?, ?, ?, ?)'

  try {
    db.query(query, [userId, doctorId, doctorName, filename, campDate, campTime, campVenue, code], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/doctor/updateDoctor: ${err.message}. SQL query: ${query}`);


        res.status(500).json({
          errorCode: "0",
          errorDetail: err,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      }
      else {
        logger.info('Doctor Update Successfully');

        res.status(200).json({
          message: "Doctor Update Successfully", errorCode: "1",
          result
        })
      }
    });
  } catch (error) {
    logger.error(`Error in /controller/doctor/updateDoctor: ${error.message}. SQL query: ${query}`);


    res.send(error)
  }
}

exports.AddPoster = async (req, res) => {
  const { docId, lang = "en", subCatId = 1, deptId } = req.body;

  try {
    // 1️⃣ Get doctor data
    const [doctorRows] = await db.promise().query(
      `SELECT doctor_name, doctor_img, doctor_qualification,
              camp_date, camp_time, camp_venue
       FROM doctordata
       WHERE doctor_id = ? AND dept_id = ?`,
      [docId, deptId]
    );

    if (!doctorRows.length) {
      return res.status(404).json({
        errorCode: "0",
        status: "ERROR",
        message: "Doctor not found"
      });
    }

    const doctor = doctorRows[0];

    // 2️⃣ Get poster template
    const [posterRows] = await db.promise().query(
      `SELECT poster_path, postername, width, height
       FROM poster_mst
       WHERE subcat_id = ?
         AND language = ?
         AND dept_id = ?
         AND status = 'Y'`,
      [subCatId, lang, deptId]
    );

    if (!posterRows.length) {
      return res.status(404).json({
        errorCode: "0",
        status: "ERROR",
        message: "Poster template not found"
      });
    }

    const posterTemplate = posterRows[0];

    // 3️⃣ Generate poster image
    const formattedDate = moment(doctor.camp_date)
      .format("DD MMM YYYY")
      .toUpperCase();

    const posterPath = await addTextOnImage({
      doctor,
      formattedDate,
      posterTemplate,
      docId,
      lang,
      subCatId
    });

    // 4️⃣ Save poster path
    await db.promise().query(
      `CALL AddPoster(?,?,?,?,?)`,
      [docId, lang, posterPath, subCatId, deptId]
    );

    return res.status(200).json({
      errorCode: "1",
      message: "Poster Added Successfully",
      poster: posterPath
    });

  } catch (err) {
    logger.error("error in AddPoster", err);
    return res.status(500).json({
      errorCode: "0",
      status: "ERROR",
      message: "Internal server error"
    });
  }
};

exports.AddPosterV2 = async (req, res) => {
  const { docId, lang = "en", deptId } = req.body;

  try {
    /**
     * 1️⃣ Get doctor data
     */
    const [doctorRows] = await db.promise().query(
      `SELECT 
         doctor_name,
         doctor_img,
         doctor_qualification,
         camp_date,
         camp_time,
         camp_venue
       FROM doctordata
       WHERE doctor_id = ?
         AND dept_id = ?`,
      [docId, deptId]
    );

    if (!doctorRows.length) {
      return res.status(404).json({
        errorCode: "0",
        status: "ERROR",
        message: "Doctor not found",
      });
    }

    const doctor = doctorRows[0];

    /**
     * 2️⃣ Get ALL active poster templates
     */
    const [posterTemplates] = await db.promise().query(
      `SELECT 
         poster_id,
         postername,
         poster_path,
         width,
         height,
         subcat_id
       FROM poster_mst
       WHERE language = ?
         AND dept_id = ?
         AND status = 'Y'
       ORDER BY displayorder`,
      [lang, deptId]
    );

    if (!posterTemplates.length) {
      return res.status(404).json({
        errorCode: "0",
        status: "ERROR",
        message: "No active poster templates found",
      });
    }

    /**
     * 3️⃣ Generate posters (LOOP)
     */
    const formattedDate = moment(doctor.camp_date)
      .format("DD MMM YYYY")
      .toUpperCase();

    const generatedPosters = [];

    for (const template of posterTemplates) {
      try {
        const posterPath = await addTextOnImage({
          doctor,
          formattedDate,
          posterTemplate: template,
          docId,
          lang,
          subCatId: template.subcat_id, // 👈 IMPORTANT
        });

        /**
         * 4️⃣ Save poster entry
         */
        await db.promise().query(
          `CALL AddPoster(?,?,?,?,?)`,
          [
            docId,
            lang,
            posterPath,
            template.subcat_id,
            deptId,
          ]
        );

        generatedPosters.push({
          poster_id: template.poster_id,
          postername: template.postername,
          subCatId: template.subcat_id,
          posterPath,
        });
      } catch (posterErr) {
        logger.error(
          `Poster generation failed for poster_id=${template.poster_id}`,
          posterErr
        );
        // continue loop
      }
    }

    /**
     * 5️⃣ Final response
     */
    return res.status(200).json({
      errorCode: "1",
      message: "Posters generated successfully",
      totalGenerated: generatedPosters.length,
      posters: generatedPosters,
    });

  } catch (err) {
    logger.error("error in AddPoster", err);
    return res.status(500).json({
      errorCode: "0",
      status: "ERROR",
      message: "Internal server error",
    });
  }
};



async function addTextOnImage({
  doctor,
  formattedDate,
  posterTemplate,
  docId,
  lang,
  subCatId
}) {
  try {
    const {
      postername,
      poster_path,
      width,
      height
    } = posterTemplate;

    const posterFields = await getPosterData(postername);

    const {
      nx, ny, dx, dy, tx, ty,
      fs, c, nta
    } = posterFields;

    const svg = `
      <svg width="${width}" height="${height}">
        <style>
          .title {
            fill: ${c};
            font-size: ${fs}px;
            font-weight: 500;
            font-family: Arial, sans-serif;
          }
          .bold { font-weight: bold; }
        </style>
        <text x="${nx}%" y="${ny}%" text-anchor="${nta}" class="title bold">
          ${doctor.doctor_name}
        </text>
        <text x="${dx}%" y="${dy}%" class="title">
          ${formattedDate}
        </text>
        <text x="${tx}%" y="${ty}%" class="title">
          ${doctor.camp_time}
        </text>
      </svg>
    `;

    // const outputDir = subCatId === 3 ? "test" : "uploads/poster";
    const outputDir = "uploads/poster";
    const outputPath = `${outputDir}/${docId}-${postername}-${lang}-${subCatId}.png`;

    await sharp(`${uploadsfile2}/${poster_path}`)
      .composite([{ input: Buffer.from(svg) }])
      .toFile(outputPath);

    return outputPath;

  } catch (err) {
    logger.error("error in addTextOnImage", err);
    throw err;
  }
}


async function getPosterData(postername) {
  const [rows] = await db.promise().query(
    `SELECT *
     FROM poster_field_mst
     WHERE poster_name = ?`,
    [postername]
  );

  if (!rows.length) {
    throw new Error("Poster field configuration not found");
  }

  return rows[0];
}
