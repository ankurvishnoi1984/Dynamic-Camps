import React, { useEffect, useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./CustomCss.css";
import { BASEURL2 } from "../constant/constant";

function ImgDownload({ show, handelCloseModal }) {
  const [employeeData, setEmployeeData] = useState([]);
  const [posterLen, setPosterLen] = useState(0);
  const [myCampType, setMyCampType] = useState([]);
  const [filters, setFilters] = useState({ campType: "All" });
  const [loading, setLoading] = useState(false);
const [batchStatus, setBatchStatus] = useState("");

  const getPrescriptionData = async () => {
  try {
    const userId = sessionStorage.getItem("userId");
    const role = sessionStorage.getItem("role");

    // base API
    let url = `${BASEURL2}/admin/getPrescriptionImages`;

    // if not admin, add userId param
    if (role !== "0" && userId) {
      url += `?userId=${userId}`;
    }

    const res = await axios.get(url);
    setEmployeeData(res.data.transformedResult);
    setPosterLen(res.data.poslength);
  } catch (error) {
    console.error("Error fetching prescription data:", error);
  }
};

  // Fetch camp types
  const getMyCampsType = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASEURL2}/basic/getCampNonCampType`);
      setMyCampType(res.data.data);
    } catch (error) {
      console.log("Error fetching camp types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptionData();
    getMyCampsType();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

//   const handleDownloadZip = async () => {
//     setLoading(true)
//     let dataToDownload = employeeData;

//     if (filters.campType !== "All") {
//       dataToDownload = employeeData.filter(
//         (emp) => emp.campName === filters.campType
//       );
//     }

//     if (!dataToDownload || dataToDownload.length === 0) {
//       alert("No data available for the selected camp.");
//       return;
//     }

//     const zip = new JSZip();

//     for (const employee of dataToDownload) {
//       const {
//         employeeName,
//         employeeCode,
//         doctorName,
//         doctorCode,
//         campName,
//         campId,
//         campDate, 
//         posters,
//       } = employee;

//       const formattedDate = new Date(campDate)
//     .toLocaleDateString("en-GB")
//     .replace(/\//g, "-"); 

//       const campFolder = zip.folder(campName);
//       const employeeFolder = campFolder.folder(
//         `${employeeName}_${employeeCode}`
//       );
//       const doctorFolder = employeeFolder.folder(
//         `${doctorName}_${doctorCode}_${formattedDate}_${campId}`
//       );
// const brandCount = {};
//       for (let i = 0; i < posters.length; i++) {
//         try {
//           const response = await fetch(
//             `${BASEURL2}/uploads/${posters[i].posterUrl}`
//           );
//           const blob = await response.blob();

//           const brandKey = posters[i].brandName.replace(/\s+/g, "_");

 
//           if (!brandCount[brandKey]) {
//             brandCount[brandKey] = 1;
//           }

//           doctorFolder.file(
//             `${posters[i].brandName}_prescription_${brandCount[brandKey]}.jpg`,
//             blob,
//             { binary: true }
//           );
//             brandCount[brandKey]++;
//         } catch (error) {
//           console.error("Error fetching image:", error);
//         }
//       }
//     }
//     zip.generateAsync({ type: "blob" }).then((content) => {
//       FileSaver.saveAs(
//         content,
//         `${filters.campType === "All" ? "all_camps" : filters.campType}_prescriptions.zip`
//       );
//     });
//     setLoading(false)
//   };

const handleDownloadZip = async () => {
  setLoading(true);
  setBatchStatus("Preparing download...");

  let dataToDownload = employeeData;

  // Apply filter if a specific camp is selected
  if (filters.campType !== "All") {
    dataToDownload = employeeData.filter(
      (emp) => emp.campName === filters.campType
    );
  }

  if (!dataToDownload || dataToDownload.length === 0) {
    alert("No data available for the selected camp.");
    setLoading(false);
    setBatchStatus("");
    return;
  }

  // Calculate total images
  const totalImages = dataToDownload.reduce(
    (sum, emp) => sum + (emp.posters?.length || 0),
    0
  );

  const batchSize = 500; // employees per batch
  const totalEmployees = dataToDownload.length;
  const totalBatches = Math.ceil(totalEmployees / batchSize);

  let processedImages = 0;
  let batchStartImageIndex = 1; // track image index per batch

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, totalEmployees);
    const batchData = dataToDownload.slice(start, end);

    const zip = new JSZip();
    let batchImageCount = 0; // images in this batch

    for (const employee of batchData) {
      const {
        employeeName,
        employeeCode,
        doctorName,
        doctorCode,
        campName,
        campId,
        campDate,
        posters,
      } = employee;

      const formattedDate = new Date(campDate)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const campFolder = zip.folder(campName);
      const employeeFolder = campFolder.folder(
        `${employeeName}_${employeeCode}`
      );
      const doctorFolder = employeeFolder.folder(
        `${doctorName}_${doctorCode}_${formattedDate}_${campId}`
      );

      const brandCount = {};

      for (let i = 0; i < posters.length; i++) {
        try {
          const response = await fetch(`${BASEURL2}/uploads/${posters[i].posterUrl}`);
          const blob = await response.blob();

          const brandKey = posters[i].brandName.replace(/\s+/g, "_");
          if (!brandCount[brandKey]) brandCount[brandKey] = 1;

          doctorFolder.file(
            `${posters[i].brandName}_prescription_${brandCount[brandKey]}.jpg`,
            blob,
            { binary: true }
          );

          brandCount[brandKey]++;
          processedImages++;
          batchImageCount++;

          // Update user progress
          const percent = Math.round((processedImages / totalImages) * 100);
          setBatchStatus(
            `📦 Downloading images ${processedImages} of ${totalImages} (${percent}%)...`
          );
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    }

    // ✅ Generate ZIP name using actual image indices
    const campLabel = filters.campType === "All" ? "all_camps" : filters.campType;
    const zipFileName = `${campLabel}_images_${batchStartImageIndex}-${batchStartImageIndex + batchImageCount - 1}.zip`;

    const zipBlob = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(zipBlob, zipFileName);

    // Update starting image index for next batch
    batchStartImageIndex += batchImageCount;

    // Small delay to free memory
    await new Promise((res) => setTimeout(res, 1000));
  }

  setLoading(false);
  setBatchStatus(`✅ All ${totalImages} images downloaded successfully!`);
};


  if (!show) return null;

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h5>Download Prescriptions</h5>
          <button type="button" className="close-btn"  onClick={() => {
    handelCloseModal();
    setBatchStatus("");
  }}>
            ×
          </button>
        </div>
        <div className="custom-modal-body">
          <form className="g-3">
            {/* Dropdown for camp type */}
            <div className="form-group col-md-12">
              <label htmlFor="campType">Select Camp</label>
              <select
                className="form-control selectStyle"
                name="campType"
                id="campType"
                value={filters.campType}
                onChange={handleChange}
              >
                <option value="All">All</option>
                {myCampType &&
                  myCampType.map((e) => (
                    <option key={e.basic_id} value={e.description}>
                      {e.description}
                    </option>
                  ))}
              </select>
            </div>

            <div className="btn-wrapper text-center">
              <button
                type="button"
                className="btn btn-success mx-auto"
                onClick={handleDownloadZip}
                disabled={loading}
              >
               {loading ? (
      <>
        <span className="spinner" ></span>
        Loading...
      </>
    ) : (
      "Download"
    )}
              </button>
                  {batchStatus && (
    <div className="mt-3">
      <small style={{ color: "#703e97", fontWeight: "bold" }}>{batchStatus}</small>
    </div>
  )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ImgDownload;
