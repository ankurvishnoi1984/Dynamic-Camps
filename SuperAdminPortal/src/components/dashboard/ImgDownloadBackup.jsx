import React, { useState, useEffect } from "react";
import axios from "axios";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "../../../style/css/sb-admin-2.min.css";

const BASEURL = "https://demo2.netcastservice.online/admin";
const BASEURL2 = "https://demo2.netcastservice.online";

function ImgDownload() {
  const [employeeData, setEmployeeData] = useState([]);
  const [posterLen, setPosterLen] = useState(0);

  // Fetch data
  const getPrescriptionData = async () => {
    try {
      const res = await axios.get(`${BASEURL}/getPrescriptionImages`);
      setEmployeeData(res.data.transformedResult);
      setPosterLen(res.data.poslength);
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    }
  };

  useEffect(() => {
    getPrescriptionData();
  }, []);

  // Download ZIP with new folder structure
  const handleDownloadZip = async () => {
    const zip = new JSZip();

    for (const employee of employeeData) {
      const {
        employeeName,
        employeeCode,
        doctorName,
        doctorCode,
        campName,
        campId,
        posters,
      } = employee;

      // Level 1: camp folder
      const campFolder = zip.folder(campName);

      // Level 2: employee folder
      const employeeFolder = campFolder.folder(`${employeeName}_${employeeCode}`);

      // Level 3: doctor folder
      const doctorFolder = employeeFolder.folder(
        `${doctorName}_${doctorCode}_${campId}`
      );

      // Add posters into doctor folder
      for (let i = 0; i < posters.length; i++) {
        try {
          const response = await fetch(`${BASEURL2}/uploads/${posters[i].posterUrl}`);
          const blob = await response.blob();

          doctorFolder.file(
            `${posters[i].brandName}_poster_${i + 1}.jpg`,
            blob,
            { binary: true }
          );
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    }

    // Generate and download zip
    zip.generateAsync({ type: "blob" }).then((content) => {
      FileSaver.saveAs(content, "prescription_posters.zip");
    });
  };

  return (
    <div className="container-fluid">
      <button
        onClick={handleDownloadZip}
        className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm mt-5"
      >
        <i className="fas fa-download fa-sm text-white-50"></i> Download Report ({posterLen})
      </button>
    </div>
  );
}

export default ImgDownload;
