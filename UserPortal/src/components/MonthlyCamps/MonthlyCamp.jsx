import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL, BASEURL2, DeptId, ImageLimit, PageCount } from "../constant/constant";
import ConfirmationPopup from "../popup/Popup";
import Select from "react-select";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import * as XLSX from "xlsx/xlsx.mjs";
import useCampList from "../CustomHook/useCampList";
import "./monthlyCamp.css"
import { useParams } from "react-router-dom";
import SubmissionModal from "./SubmissionModal";
import { BsThreeDotsVertical } from "react-icons/bs";

const MonthlyCamp = () => {
  const userId = sessionStorage.getItem("userId");
  const { campId } = useParams();

  const [openActionId, setOpenActionId] = useState(null);
  const [campList] = useCampList();
  const [brandList, setBrandList] = useState([]);


  const [campType, setCampType] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [doctorName, setDoctorName] = useState("");
  const [speciality, setSpeciality] = useState("");


  const [screenedCount, setScreenedCount] = useState(null);
  const [rxCount, setRxCount] = useState(null);


  const [campVenue, setCampVenue] = useState("");
  const [campDate, setCampDate] = useState("");
  const [campTime, setCampTime] = useState("");
  const [campPatients, setCampPatients] = useState("");


  const [listCampType, setListCampType] = useState("");
  const [campReportList, setCampReportList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");


  const [addRequestModel, setAddRequestModel] = useState(false);
  const [infoReportModel, setInfoReportModel] = useState(false);
  const [editRequestModel, setEditRequestModel] = useState(false);

  const [infoData, setInfoData] = useState({});
  const [campImages, setCampImages] = useState([]);
  const empId = sessionStorage.getItem("empId");

  const [previewImg, setPreviewImg] = useState(null);

  const handleImageClick = (imgUrl) => {
    setPreviewImg(imgUrl);
  };

  const handleClosePreview = () => {
    setPreviewImg(null);
  };



  // for delete

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [editId, setEditId] = useState("");
  const [crid, setCrid] = useState("");
  const [filters, setFilters] = useState({
    campTypeId: "",
    searchQuery: "",
    // filterBy: "",
    // startDate: "",
    // endDate: "",
  });


  // for brand input adding 
  // brand row adding logic
  const [brandInputs, setBrandInputs] = useState([
    { brand: "", sku: "", therapyDay: "" },
  ]);


  // for file upload

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [doctorList, setDoctorList] = useState([]);
  const [doctorId, setDoctorId] = useState('')
  // for camp request data

  const [loading, setLoading] = useState(false);

  const handelAddReport = () => {
    setAddRequestModel(true);
  };

  const handelCloseModel = async () => {
    setAddRequestModel(false);
    // await getCampReportList();
  };


  const handelCloseEditModel = async () => {
    setEditRequestModel(false);
    // await getCampReportList();
    setCampType("");
    setCampVenue("");
    setCampDate("");
    setScreenedCount("");
    setRxCount("");
    setBrandId("");
    setCampPatients("");
    setDoctorName("");
    setSpeciality("");
    setDoctorId('')
    setBrandInputs([{ brand: "", sku: "", therapyDay: "" },]);


  };



  const handelInfo = (submissionId) => {
    const selected = campReportList.find(
      (s) => s.submission_id === submissionId
    );
    setInfoData(selected);
    setInfoReportModel(true);
  };


  const handelCloseInfoModel = () => {
    setInfoReportModel(false);
    setInfoData({});
  };


  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(`${BASEURL}/report/deleteReportWithId`, {
        crId: delId,
      });

      if (res.data.errorCode == "1") {
        toast.success("Camp Report Deleted Successfully");
        // await getCampReportList();
        setDelId("");
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const getCampReportImages = async (crid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/getImages`, {
        crId: crid,
      });
      if (res?.status === 200) {
        setCampImages(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };



  const handelReportDownload = () => {
    if (!campReportList || campReportList.length === 0) {
      alert("No data to export");
      return;
    }

    // ✅ Filter out image fields
    const filteredFields =
      campReportList[0]?.field_values?.filter((fv) => fv.field_type !== "image") || [];

    // ✅ Prepare headers (exclude image columns)
    const headers = [
      "Doctor Name",
      "Speciality",
      ...filteredFields.map((fv) => fv.field_label),
      "Submitted At",
    ];

    // ✅ Map data excluding image fields
    const mappedData = campReportList.map((item) => {
      const dynamicValues = {};

      filteredFields.forEach((fv) => {
        const matchingField = item.field_values?.find(
          (f) => f.field_label === fv.field_label
        );
        dynamicValues[fv.field_label] = matchingField?.value || "-";
      });

      return {
        "Doctor Name": item.doctor_name,
        "Speciality": item.speciality,
        ...dynamicValues,
        "Submitted At": new Date(item.submitted_at).toLocaleString(),
      };
    });

    // ✅ Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CampsReport");
    XLSX.writeFile(wb, "CampsReport.xlsx");
  };


  useEffect(() => {
    if (searchQuery) {
      let timer = setTimeout(() => {
        getCampSubmissionsFull();

      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }
    else {
      getCampSubmissionsFull();

    }
  }, [searchQuery, campId, addRequestModel]);



  const getBrandList = async () => {
    setLoading(true);
    try {
      let res;
      res = await axios.post(`${BASEURL2}/basic/getBrandsList`, { deptId: DeptId });
      if (res?.data?.errorCode === 1) {
        setBrandList(res.data.data)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const getDoctorList = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId, deptId: DeptId });
      setDoctorList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };



  useEffect(() => {
    getBrandList();
    getDoctorList();
    // getCampSubmissionsFull();
  }, [campId, addRequestModel]);

  // for search

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };


  useEffect(() => {
    // Convert comma-separated string to an array of selected options
    if (brandId) {
      const selectedValues = brandId.split(",").map(Number);
      const selectedOptions = brandList
        .filter((brand) => selectedValues.includes(brand.brand_id))
        .map((brand) => ({ value: brand.brand_id, label: brand.item_name }));
      setSelectedBrands(selectedOptions);
    } else {
      setSelectedBrands([]);
    }
  }, [brandId]);



  const handleEditFileChange = (event) => {
    const files = Array.from(event.target.files);
    //const files = event.target.files;
    if (files.length + selectedFiles.length + campImages.length > ImageLimit) {
      toast.error(`You can only upload up to ${ImageLimit} images`);
      //alert('You can only upload up to 3 images');
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index) => {
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newSelectedFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handelDeleteCampImage = async (imgid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/deleteSingalImg`, {
        crimgid: imgid,
      });
      if (res?.data?.errorCode == "1") {
        //toast.success("Image Deleted")
        //alert('Image Deleted')
        await getCampReportImages(editId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBrandChange = (selectedOptions) => {
    setSelectedBrands(selectedOptions);
  };

  const brandOptions = brandList?.map((brand) => ({
    value: brand.brand_id,
    label: brand.item_name,
  }));

  // for select camp request
  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(campReportList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };


  const renderPageNumbers = () => {
    const totalPages = Math.ceil(campReportList.length / PageCount);
    const pageNumbers = [];
    const maxPageNumbersToShow = PageCount - 10;

    if (totalPages <= maxPageNumbersToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(2, page - 2);
      const endPage = Math.min(totalPages - 1, page + 2);

      pageNumbers.push(1); // Always show the first page

      if (startPage > 2) {
        pageNumbers.push("..."); // Ellipsis before startPage if there's a gap
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("..."); // Ellipsis after endPage if there's a gap
      }

      pageNumbers.push(totalPages); // Always show the last page
    }

    // Fix for the duplicate key issue by using a combination of index and pageNum
    return pageNumbers.map((pageNum, index) =>
      pageNum === "..." ? (
        <li className="page-item" key={`ellipsis-${index}`}>
          <span className="page-link">{pageNum}</span>
        </li>
      ) : (
        <li
          className={`page-item ${page === pageNum ? "active" : ""}`}
          onClick={() => selectPageHandler(pageNum)}
          key={`page-${pageNum}`} // Ensure unique key for page numbers
        >
          <span className="page-link">{pageNum}</span>
        </li>
      )
    );
  };


  const handelDoctorChange = (event) => {
    let docId = event.target.value
    if (docId) {
      setDoctorId(docId)
      const doctor = doctorList.find((e) => e.doctor_id == docId);
      setSpeciality(doctor.speciality);
      setCampDate(doctor.camp_date);
      setCampTime(doctor.camp_time1);
      setCampVenue(doctor.camp_venue);
    }
    else {
      setDoctorId('')
      setSpeciality('');
      setCampDate('');
      setCampTime('');
      setCampVenue('');
    }

  }

  const getCampSubmissionsFull = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampSubmissionsFull`, {
        campId: campId,
        userId: userId,
        deptId: DeptId,
        searchQuery,
      });

      if (res.data.errorCode === 1) {
        setCampReportList(res.data.data);
        console.log("img data", res.data.data);

      } else {
        toast.error(res.data.message || "No submissions found");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Something went wrong");
    }
  };



  const handleChange = (index, field, value) => {
    const updated = [...brandInputs];
    brandInputs[index][field] = value;
    setBrandInputs(updated);
  }

  const addBrandSet = () => {
    if (brandInputs.length < 6) {
      setBrandInputs([...brandInputs, { brand: "", sku: "", therapyDay: "" }])
    }
    else {
      toast.error("Maximum 5 selection allowed.")
    }
  }
  const groupedImages = infoData.images?.reduce((acc, img) => {
    if (!acc[img.itemName]) {
      acc[img.itemName] = {
        itemName: img.itemName,
        count: img.image_prescription_count,
        images: [],
      };
    }
    acc[img.itemName].images.push(img.prescriptionImage);
    return acc;
  }, {});
  const removeBrandSet = () => {
    if (brandInputs.length > 1) {
      setBrandInputs(prevInputs => prevInputs.slice(0, -1));
    } else {
      toast.error("At least one brand is required.");
    }
  };

  const removeUpdateBrandSet = async () => {
    if (brandInputs.length > 1) {
      const lastItem = brandInputs[brandInputs.length - 1];

      if (lastItem.mappingId) {
        try {
          // Call your backend API to delete this record
          let res = await axios.post(`${BASEURL}/report/deleteBrandMapping`, { mappingId: lastItem.mappingId });
          // After successful deletion from backend, update state
          setBrandInputs(prevInputs => prevInputs.slice(0, -1));
          toast.success("Brand deleted successfully.");
        } catch (error) {
          console.error("Error deleting brand mapping:", error);
          toast.error("Failed to delete brand from server.");
        }
      } else {
        // No mappingId, just remove from UI state
        setBrandInputs(prevInputs => prevInputs.slice(0, -1));
      }
    } else {
      toast.error("At least one brand is required.");
    }
  };

  return loading ? <Loader /> : (
    <>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            <div className="d-sm-flex align-items-center justify-content-end mb-4">
              <form className="d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group mt-4">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search."
                    aria-label="Search."
                    aria-describedby="basic-addon2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <small className="msgnote mt-2">*Scroll left for other column of table</small>
                  <div className="m-3 d-flex justify-content-between align-items-end" >
                    <button
                      type="button"
                      className="btn btn-download mt-2"
                      onClick={handelReportDownload}
                    >
                      <i className="bx bx-cloud-download"></i> Download Report
                    </button>
                    <button
                      type="button"
                      className="btn btn-success mt-2"
                      onClick={handelAddReport}
                    >
                      <i className="bi bi-plus"></i> Add Camp Report
                    </button>
                  </div>
                  <hr />
                  <div className="tbst">
                    <table className="table table-hover newcss">
                      {campReportList && campReportList.length > 0 ? (
                        <>
                          <thead>
                            <tr>

                              <th scope="col">Doctor Name</th>
                              <th scope="col">Speciality</th>
                              {/* Filter out image type fields before rendering headers */}
                              {campReportList[0]?.field_values
                                ?.filter((fv) => fv.field_type !== "image")
                                .map((fv, idx) => (
                                  <th key={idx}>{fv.field_label}</th>
                                ))}

                              <th scope="col">Date</th>
                              <th scope="col">Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {campReportList
                              .slice(page * PageCount - PageCount, page * PageCount)
                              .map((e) => (
                                <tr key={e.submission_id}>
                                  {/* Filter out image fields before rendering values */}
                                  <td>{e.doctor_name}</td>
                                  <td>{e.speciality}</td>
                                  {e.field_values
                                    ?.filter((fv) => fv.field_type !== "image")
                                    .map((fv, idx) => (
                                      <td key={idx}>{fv.value || "-"}</td>
                                    ))}

                                  <td>{new Date(e.submitted_at).toLocaleDateString()}</td>
                                  <td>
                                    <div className="action-wrapper">
                                      <button
                                        className="btn btn-sm btn-primary btn-circle border-0"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setOpenActionId((prev) =>
                                            prev === e.submission_id ? null : e.submission_id
                                          );
                                        }}
                                      >
                                        <BsThreeDotsVertical />
                                      </button>

                                      {openActionId === e.submission_id && (
                                        <div className="action-dropdown">
                                          <button onClick={() => handelInfo(e.submission_id)}>
                                            View Info
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </>

                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan="100%" className="text-center py-5">
                              <div
                                style={{
                                  color: "#6c757d",
                                  fontSize: "18px",
                                  fontWeight: 500,
                                  textAlign: "center",
                                }}
                              >
                                🚫 No records found.<br />
                                <span style={{ fontSize: "16px" }}>
                                  Click <strong style={{ color: "#0d6efd" }}>“Add Camp Report"</strong> to
                                  add record.
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>

                  </div>

                  {campReportList && campReportList.length > 0 && (
                    <div>
                      <div className="m-2 float-end">
                        {/* <h5 className="card-title">Pagination with icon</h5> */}

                        <nav aria-label="Page navigation example">
                          <ul className="pagination pcur">
                            <li
                              className="page-item"
                              onClick={() => selectPageHandler(page - 1)}
                            >
                              <span className="page-link" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                              </span>
                            </li>
                            {renderPageNumbers()}

                            <li
                              className="page-item"
                              onClick={() => selectPageHandler(page + 1)}
                            >
                              <span className="page-link" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                              </span>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>



      {infoReportModel && infoData && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Camp Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>

                <div className="modal-body">
                  {/* === Submission Info === */}
                  <form className="row g-3">
                    {infoData.field_values.map((field, idx) => (
                      <div
                        className="col-md-4 did-floating-label-content mb-3"
                        key={idx}
                      >
                        {field.field_type === "image" ? (
                          <div className="d-flex flex-column align-items-start">
                            <label className="form-label fw-semibold mb-2">
                              {field.field_label}
                            </label>
                            {field.value ? (
                              <img
                                src={`${BASEURL}/uploads/${field.value}`}
                                alt={field.field_label}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  border: "1px solid #ccc",
                                }}
                                onClick={() => setPreviewImg(field.value)}
                              />
                            ) : (
                              <p className="text-muted small">No image available</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              value={field.value || ""}
                              readOnly
                            />
                            <label className="form-label did-floating-label">
                              {field.field_label}
                            </label>
                          </>
                        )}
                      </div>
                    ))}

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        value={
                          infoData.submitted_at
                            ? new Date(infoData.submitted_at).toLocaleString()
                            : ""
                        }
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Submitted At
                      </label>
                    </div>
                  </form>
                </div>

                {/* === Image Preview Modal === */}
                {previewImg && (
                  <div
                    className="image-preview-overlay"
                    onClick={handleClosePreview}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(0,0,0,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1050,
                    }}
                  >
                    <span
                      className="close-btn"
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "30px",
                        fontSize: "2rem",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </span>
                    <img
                      src={previewImg}
                      alt="Preview"
                      className="preview-img"
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(255,255,255,0.3)",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}





      {addRequestModel && <SubmissionModal
        handelCloseModel={handelCloseModel} />}


      {editRequestModel && (
        <div className="addusermodel">
          <div
            className="modal fade show"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Report</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form className="row g-3">

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={(event) => {
                          setCampType(event.target.value);
                        }}
                        value={campType}
                      >
                        <option value="">Select...</option>
                        {campList.map((e) => (
                          <option

                            key={e.basic_id}
                            value={e.basic_id}
                          >
                            {e.description}
                          </option>
                        ))}
                      </select>
                      <label className="form-label did-floating-label">Type of Camp*</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelDoctorChange}
                        value={doctorId}
                      >
                        <option value="">Select...</option>
                        {doctorList.map((e) => (
                          <option

                            key={e.doctor_id}
                            value={e.doctor_id}
                          >
                            {e.doctor_name}
                          </option>
                        ))}
                      </select>
                      <label className="form-label did-floating-label">Doctor Name*</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="speciality"
                        value={speciality}
                        // onChange={(e)=>{
                        //   setSpeciality(e.target.value)
                        // }}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Speciality</label>
                    </div>


                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        // onChange={(e) => {
                        //   setCampDate(e.target.value);
                        // }}
                        placeholder="Camp Date*"
                        value={campDate}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Date of Camp*
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input

                        type="text"
                        className="form-control did-floating-input"
                        // onChange={(e) => {
                        //   setCampDate(e.target.value);
                        // }}
                        placeholder="Camp Time*"
                        value={campTime}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Time of camp*
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        // onChange={(e) => {
                        //   setCampVenue(e.target.value);
                        // }}
                        placeholder="Address*"
                        value={campVenue}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Address*
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="number"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampPatients(e.target.value);
                        }}
                        placeholder="Patients No.*"
                        value={campPatients}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        min={0}
                      />
                      <label className="form-label did-floating-label">
                        No. of Patients in camp*
                      </label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="number"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setScreenedCount(e.target.value);
                        }}
                        placeholder="Patients Screened No."
                        value={screenedCount}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        min={0}
                      />
                      <label className="form-label did-floating-label">
                        No. of Patients Screened*
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="number"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setRxCount(e.target.value);
                        }}
                        placeholder="Patients Rx No.*"
                        value={rxCount}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        min={0}
                      />
                      <label className="form-label did-floating-label">
                        No. of Rx generated*
                      </label>
                    </div>


                    {brandInputs.map((input, index) => (
                      <React.Fragment key={index}>

                        <div className="form-group col-md-4 did-floating-label-content">
                          <input
                            type="text"
                            className="form-control did-floating-input"
                            onChange={(e) => {
                              handleChange(index, "brand", e.target.value)
                            }}
                            placeholder="Brand"
                            value={input.brand}
                          />
                          <label className="form-label did-floating-label">
                            Brand*
                          </label>
                        </div>
                        <div className="form-group col-md-4 did-floating-label-content">
                          <input
                            type="text"
                            className="form-control did-floating-input"
                            onChange={(e) => {
                              handleChange(index, "sku", e.target.value)
                            }}
                            placeholder="SKU"
                            value={input.sku}
                          />
                          <label className="form-label did-floating-label">
                            SKU*
                          </label>
                        </div>
                        <div className="form-group col-md-4 did-floating-label-content">
                          <input
                            type="number"
                            className="form-control did-floating-input"
                            onChange={(e) => {
                              handleChange(index, "therapyDay", e.target.value)
                            }}
                            placeholder="Therapy Days"
                            value={input.therapyDay}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e') {
                                e.preventDefault();
                              }
                            }}
                            min={0}
                          />
                          <label className="form-label did-floating-label">
                            Therapy Days*
                          </label>

                        </div>

                        {/* <div className="form-group col-md-2 text-end">
        <button
          type="button"
          className="btn btn-danger"
          //onClick={() => handleRemove(index)}
        >
          ❌
        </button>
                      </div> */}

                      </React.Fragment>
                    ))}

                    <div className="col-12 mt-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addBrandSet}
                        disabled={brandInputs.length >= 5}
                      >
                        Add Brand
                      </button>
                      {brandInputs.length > 1 && <button
                        type="button"
                        className="btn btn-danger m-2"
                        onClick={removeUpdateBrandSet}
                        disabled={brandInputs.length == 1}
                      >
                        Remove Brand
                      </button>}

                    </div>


                    <div className="form-group col-md-4 did-floating-label-content">
                      <label
                        htmlFor="fileInput"
                        className={`form-label  ${selectedFiles.length + campImages.length >= ImageLimit ? "custom-file-label1" : "custom-file-label"}`}
                      // style={{
                      //   pointerEvents:
                      //     selectedFiles.length + campImages.length >= 3
                      //       ? "none"
                      //       : "auto",
                      // }}
                      >
                        {" "}
                        Upload Camp Images
                      </label>
                      <br />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        id="fileInput"
                        className="file-input"
                        onChange={handleEditFileChange}
                        disabled={selectedFiles.length + campImages.length >= ImageLimit}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: 'wrap',
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {campImages &&
                        campImages.length > 0 &&
                        campImages.map((img) => (
                          <div
                            key={img.crimgid}
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              crossOrigin="anonymous"
                              src={`${BASEURL}/uploads/report/${img.imgpath}`}
                              alt="Report Image"
                              style={{ width: "100px", height: "130px" }}
                            />
                            <button
                              type="button"
                              onClick={() => handelDeleteCampImage(img.crimgid)}
                              style={{
                                position: "absolute",
                                top: "0",
                                right: "0",
                                background: "#07070742",
                                color: "white",
                                border: "none",
                                padding: "0px 4px",
                                cursor: "pointer",
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}

                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={url}
                            alt="Preview"
                            style={{ width: "100px", height: "130px" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: "absolute",
                              top: "0",
                              right: "0",
                              background: "#07070742",
                              color: "white",
                              border: "none",
                              padding: "0px 4px",
                              cursor: "pointer",
                            }}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </form>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success mx-auto"
                      //onClick={handleImageUpload}
                      onClick={handleEditSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Camp Report?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default MonthlyCamp;
