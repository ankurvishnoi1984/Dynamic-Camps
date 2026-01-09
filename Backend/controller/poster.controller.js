const moment = require("moment/moment");
const db = require("../config/db")
const logger = require('../utils/logger')
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");


// Define the uploads path
const uploadsfile2 = path.join(__dirname, '../uploads/poster');



exports.addPosterDoctor = async (req, res) => {
  const { userId, doctorName, code = 0, campDate, campVenue, campTime, subCatId = 1, deptId } = req.body;
  const formattedCampDate = moment(campDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const filename = req.file && req.file.filename ? req.file.filename : null;
  const query = 'INSERT INTO doctordata (doctor_name, doctor_img, camp_date, camp_time, code, camp_venue,subcat_id, user_id, created_by,dept_id) VALUES (?,?,?,?,?,?,?,?,?,?);'
  try {
    db.query(query, [doctorName, filename, formattedCampDate, campTime, code, campVenue, subCatId, userId, userId, deptId], (err, result) => {
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
exports.getAllPosterDoctorsByEmp = async (req, res) => {
  const { userId, subCatId, deptId } = req.body
  const query = `SELECT doctor_id,doctor_name,code,camp_venue,camp_date,camp_time,doctor_img,doctor_qualification,doctor_city,doctor_state 
  FROM doctordata 
  where user_id = ? and subcat_id = ? and dept_id =? and status = 'Y' 
  ORDER BY doctordata.doctor_id DESC`
  // const query = 'CALL GetDoctorDataWithUserId(?,?)'
  try {
    db.query(query, [userId, subCatId, deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/doctor/getDoctorDataWithUserId: ${err.message}. SQL query: ${query}`);

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

        const formattedResult = result.map((item) => ({
          ...item,
          camp_date: moment(item.camp_date).format('DD-MM-YYYY'), // Convert date format
        }));


        res.status(200).json({ message: "Doctor List get Successfully", errorCode: 1, data: formattedResult })

      }
    });
  } catch (error) {
    logger.error(`Error in /controller/doctor/getDoctorDataWithUserId: ${error.message}. SQL query: ${query}`);
    res.send(error)
  }
}

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
  console.log("downloadPoster triggered")
  try {
    const { filename } = req.params;

    const filePath = path.join(
      __dirname,
       "../uploads/poster",
      filename
    );
    console.log("filepath",filePath)

    // Security check
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        errorCode: 0,
        status: "ERROR",
        message: "File not found",
      });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        logger.error(`Download error: ${err.message}`);
        res.status(500).json({
          errorCode: 0,
          status: "ERROR",
          message: "Unable to download file",
        });
      }
    });
  } catch (err) {
    logger.error(`Download Poster Error: ${err.message}`);
    res.status(500).json({
      errorCode: 0,
      status: "ERROR",
    });
  }
};


exports.getCategory = async (req, res) => {
  const { deptId } = req.body;

  const query = `
       SELECT catid,name from category 
       WHERE status = 'Y'
       AND dept_id = ?
    `;
  try {
    db.query(query, [deptId], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/posters/getCategory: ${err.message}`);
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
    logger.error(`Error in /controller/posters/getCategory: ${error.message}`);
    res.send(error);
  }
}

exports.updatePosterDoctor = async (req, res) => {
  const { userId, doctorId, doctorName, campDate, campVenue, code, campTime, doctorImg } = req.body;
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
    db.query(query, [userId, doctorId, doctorName, filename, formattedCampDate, campTime, campVenue, code], (err, result) => {
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
          message: "Doctor Update Successfully", errorCode: "1"
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

  const query = 'select doctor_name,doctor_img,doctor_qualification,camp_date,camp_time, camp_venue from doctordata where doctor_id = ? and dept_id = ?'

  try {
    db.query(query, [docId, deptId], async (err, result) => {
      if (err) {
        // Handle the database error
        logger.error("error in addposter1", err.message);
        return res.status(500).json({
          errorCode: "0",
          errorDetail: err,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      } else {


        const data = result[0];
        //console.log("doctor data",data)

        const posternameQuery = "SELECT poster_path, postername, language, width, height FROM poster_mst WHERE subcat_id = ? and language = ? and dept_id=? and status = 'Y'";

        db.query(posternameQuery, [subCatId, lang, deptId], async (posterErr, posterResult) => {
          if (posterErr) {
            // Handle the database error for retrieving postername
            logger.error("error in addposter2", err.message);
            return res.status(500).json({
              errorCode: "0",
              errorDetail: posterErr,
              responseData: {},
              status: "ERROR",
              details: "An internal server error occurred while retrieving the postername",
              getMessageInfo: "An internal server error occurred"
            });
          }
          else {


            let element = posterResult[0]
            let translatedName = data.doctor_name;
            let translatedVenue = data.camp_venue;



            const posterpath = element.poster_path;
            const postername = element.postername;
            const width = element.width;
            const height = element.height;

            const formatedDate = moment(data.camp_date).format('DD MMM YYYY').toUpperCase()
            const poster = await addTextOnImage(data.doctor_img, translatedName, formatedDate, translatedVenue, data.camp_time, postername, posterpath, docId, lang, width, height, subCatId);

            //console.log("poster",poster)

            const insertQuery = 'CALL AddPoster(?,?,?,?,?)'

            //console.log(docId,posterType,lang, poster);
            db.query(insertQuery, [docId, lang, poster, subCatId, deptId], (insertErr, insertResult) => {
              if (insertErr) {
                console.log("insert error", insertErr);
                logger.error("error in addposter3", insertErr);
                return res.status(500).json({
                  errorCode: "0",
                  errorDetail: insertErr,
                  responseData: {},
                  status: "ERROR",
                  details: "An internal server error occurred while inserting/updating the poster path",
                  getMessageInfo: "An internal server error occurred"
                });
              } else {
                console.log(`Poster path saved/updated in the database: ${poster}`);
                // res.status(200).json({ poster,message: "Poster Added Successfully",errorCode: "1" });
              }
            });


            res.status(200).json({ message: "Poster Added Successfully", errorCode: "1" });

          }
        });
      }
    });
  } catch (error) {
    logger.error("error in addposter4", error.message);
    res.send(error);
  }

}

// working code with sharp 
async function addTextOnImage(waterMarkImage, name, date, venue, time, postername, posterpath, docId, lang, width, height, subCatId) {

  try {

    let obj = await getPosterData(postername);


    const { nx, ny, vx, vy, dx, dy, tx, ty, fs, iw, ih, it, il, c, nta, vta } = obj;



    //const text1 = translatedName ? translatedName : name;
    //const text2 =  translatedVenue ? translatedVenue : venue;
    const text1 = name;
    const text2 = venue;
    const text3 = date;
    const text4 = time;

    let svgImage;

    if (subCatId == 1 || subCatId == 2) {

      svgImage = `
      <svg width="${width}" height="${height}">
           <style>
            .title { fill: ${c}; font-size: ${fs}px; font-weight: 500; font-family:Arial,sans-serif;}
            .bold { font-weight: bold; }
            </style>
           <text x="${nx}%" y="${ny}%" text-anchor="${nta}" class="title bold">${text1}</text>
            <text x="${dx}%" y="${dy}%" text-anchor="left" class="title">${text3}</text>
            <text x="${tx}%" y="${ty}%" text-anchor="left" class="title">${text4}</text>
         </svg>
          `;

      const svgBuffer = Buffer.from(svgImage);
      let imgname = `uploads/poster/${docId}-${postername}-${lang}-${subCatId}.png`

      const compositeOptions = [
        {
          input: svgBuffer,
          // top: 3600,
          // left: 400,
        },
      ];

      // if (circularImage) {

      //   compositeOptions.push({
      //       input: circularImage,
      //       top: it,
      //       left: il,
      //       // gravity: 'northwest' // Adjust gravity as needed
      //   });
      // }
      const image = await sharp(`${uploadsfile2}/${posterpath}`)
        .composite(compositeOptions)
        .toFile(imgname);
      return imgname;


    }

    else if (subCatId == 3) {

      svgImage = `
         <svg width="${width}" height="${height}">
              <style>
               .title { fill: ${c}; font-size: ${fs}px; font-weight: 500; font-family:Arial,sans-serif;}
                .bold { font-weight: bold; }
               </style>
              <text x="${nx}%" y="${ny}%" text-anchor="${nta}" class="title bold">${text1}</text>
               <text x="${dx}%" y="${dy}%" text-anchor="left" class="title">${text3}</text>
               <text x="${tx}%" y="${ty}%" text-anchor="left" class="title">${text4}</text>
            </svg>
             `;

      const svgBuffer = Buffer.from(svgImage);
      let imgname = `test/${docId}-${postername}-${lang}-${subCatId}.png`

      const compositeOptions = [
        {
          input: svgBuffer,
          // top: 3600,
          // left: 400,
        },
      ];

      // if (circularImage) {

      //   compositeOptions.push({
      //       input: circularImage,
      //       top: it,
      //       left: il,
      //       // gravity: 'northwest' // Adjust gravity as needed
      //   });
      // }
      const image = await sharp(`${uploadsfile2}/${posterpath}`)
        .composite(compositeOptions)
        .toFile(imgname);
      return imgname;


    }

  } catch (error) {
    logger.error("error in index/addTextOnImage", error.message);
    console.log(error);
  }
}

function getPosterData(postername) {
  return new Promise((resolve, reject) => {
    const posterDataQuery = "SELECT * FROM poster_field_mst WHERE poster_name = ?";

    db.query(posterDataQuery, [postername], (err, result) => {
      if (err) {
        logger.error("error in index/getPosterData", err.message);
        reject(err);
      } else {
        //console.log(result[0]);
        const pdata = result[0];
        resolve(pdata);
      }
    });
  });
}