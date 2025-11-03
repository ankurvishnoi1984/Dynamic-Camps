import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx/xlsx.mjs";

import { BASEURL, BASEURL2, ImageLimit, PageCount } from "../constant/constant";
import axios from "axios";
import "./Dashboard.css";
import Loader from "../utils/Loader";
import useCampList from "../CustomHook/useCampList";
import Pagination from "../utils/Pagination";
import DiabetesModal from "../Modals/ExecuteDiabetesModal";
import HypertensionModal from "../Modals/ExecuteHypertensionModal";
import LipidModal from "../Modals/ExecuteLipidModal";
import AddMyCampModal from "../Modals/AddMyCampModal";
import AddMyCampAbmModal from "../Modals/AddMyCampAbmModal";
import useAbmCampList from "../CustomHook/useAbmCampList";
import AbpmExecution from "../Modals/AbpmExecution";
import CathlabExecution from "../Modals/CathlabExecution";
import HbA1cExecution from "../Modals/HbA1cExecution";
import AddPrescriptionModal from "../Modals/AddPrescriptionModal";
import { BsThreeDotsVertical } from "react-icons/bs";
const Dashboard = () => {
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");
  const designation = sessionStorage.getItem("designation")
const [openActionId, setOpenActionId] = useState(null);
  const [campReportList, setCampReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExecuted, setIsExecuted] = useState('N');
  const [addRequestModel, setAddRequestModel] = useState(false);
  const [myCampsReport, setMyCampsReport] = useState([]);
  const [editRequestModal, setEditModal] = useState(false);
  const [campId, setCampId] = useState("");
  const [campTypeName, setCampTypeName] = useState("");
  const [addPrescriptionModal,setAddPrescriptionModal ] = useState(false);

    const [infoReportModel, setInfoReportModel] = useState(false);
    const [previewImg, setPreviewImg] = useState(null);
    const handleClosePreview = () => {
      setPreviewImg(null);
    };
  
    const [infoData, setInfoData] = useState({});

  const tabs = [
    { key: "N", label: "Planned", icon: "bx bx-calendar" },
    { key: "Y", label: "Executed", icon: "bx bx-check-circle" },
  ];

  const handleOpenPrescriptionModal = ()=>{
    setAddPrescriptionModal(true)
  }
  const handleClosePrescriptionModal = ()=>{
    setAddPrescriptionModal(false)

  }


  // change this logic for abm later 
  const [campList] = (designation === "AREA BUSINESS MANAGER" && Number(role) === 4) ? useAbmCampList() : useCampList();

  // for filter result
  const [filters, setFilters] = useState({
    campTypeId: "",
    searchQuery: "",
    // filterBy: "",
    // startDate: "",
    // endDate: "",
  });


  const handelSetFilterValue = (event) => {
    const { name, value } = event.target;
    setFilters((previousFilter) => ({
      ...previousFilter,
      [name]: value,
    }));
  };
  const handelInfo = async (campReportId) => {
    const infoData = campReportList.find((e)=>e.crid === campReportId);
     console.log('camp_type_name raw ->', infoData?.camp_type_name);
     console.log('type camp_type_name raw ->', typeof(infoData?.camp_type_name));
  console.log('camp_type_name as JSON ->', JSON.stringify(infoData?.camp_type_name));
    setInfoData(infoData);
    // await getCampReportImages(campReportId);
    // await getBrandMapping(campReportId)
    setInfoReportModel(true);
    setOpenActionId(false)
  };
  const handelCloseModel = async () => {
    setAddRequestModel(false);
    await getCampReportList();
  };
 const handleImageClick = (imgUrl) => {
    setPreviewImg(imgUrl);
  };
   const handelCloseInfoModel = () => {
    setInfoReportModel(false);
    setInfoData({});
  };
  const toggleAddCampModal = () => {
    // setAddRequestModel(addRModel?false:true)
    setAddRequestModel(true)

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

  //  for showing dashboard list
  const getCampReportList = async () => {

    setLoading(true);
    try {
      let res;
      res = await axios.post(
        `${BASEURL2}/dashboard/getCampReportList?searchName=${filters.searchQuery}`,
        { ...filters, userId: userId, isExecuted: isExecuted }
      );
      if (res?.data?.errorCode == "1") {
        console.log("CampReportList",res?.data?.data);
        
        setCampReportList(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getMyCampsReport = async () => {
    setLoading(true);
    try {
      let res;
      res = await axios.post(
        `${BASEURL2}/reports/myCampReports`,
        { userId: userId }
      );
      if (res?.data?.errorCode == "1") {
        setMyCampsReport(res?.data?.data)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (filters.searchQuery) {
      let timer = setTimeout(() => {
        getCampReportList();
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      getCampReportList();
      getMyCampsReport();
    }
  }, [filters, isExecuted]);


  const getApprovalStatus = (e) => {
    // if any is Reconsider → show Reconsider
    if (e.camp_type_name !== "Cathlab") {
      return "Not Applicable";
    }

    if(e.approved_by_admin === "Approved"){
      return "Approved By Admin"
    }
    else if (e.approved_by_nsm === "Approved") {
      return "Approved By NSM"
    } else if (e.approved_by_dsm === "Approved") {
      return "Approve By DSM"
    } else if (e.approved_by_rm === "Approved") {
      return "Approve By RM"
    }

    if (
      e.approved_by_rm === "Reconsider" ||
      e.approved_by_dsm === "Reconsider" ||
      e.approved_by_nsm === "Reconsider"
    ) return "Reconsider";

    // if any is Pending → show Pending
    if (
      e.approved_by_rm === "Pending" ||
      e.approved_by_dsm === "Pending" ||
      e.approved_by_nsm === "Pending"
    ) return "Pending";

    // if all three approved → Approved by All
    if (
      e.approved_by_rm === "Approved" &&
      e.approved_by_dsm === "Approved" &&
      e.approved_by_nsm === "Approved"
    ) return "Approved";

    // if any rejected → Rejected
    if (
      e.approved_by_rm === "Rejected" ||
      e.approved_by_dsm === "Rejected" ||
      e.approved_by_nsm === "Rejected"
    ) return "Rejected";

    return "Status Unknown";
  }
  const handleDisableBtn = (e) => {
    // If admin approved, never disable
    if (e.approved_by_admin === "Approved") return false;

    // Otherwise, disable only if everything is still pending
    return e.approved_by_nsm === "Pending" ||
      e.approved_by_dsm === "Pending" ||
      e.approved_by_rm === "Pending";
  };
const canExecute = (campDateStr) => {
  const campDate = new Date(campDateStr); // YYYY-MM-DD is directly parseable
  const today = new Date();
  const diffDays = (today - campDate) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
};

  const handelReportDownload = () => {

    // New headers for camp report
    const headers = [
      "Doctor Name",
      "Speciality",
      "Activity Name",
      "Camp Id",
      "Camp Type",
      "User Id",
      "Camp Date",
      "Patient Screened",
      "Prescription Count",
      // "Is Executed",
      "Hypertension Kit Utilized",
      "Jupiros Diet Care Kit Utilized",
      'Glucometer Kits',
      "Is Prescription Generated",
      "Date Of Prescription",
      "Is BCC1 Distributed",
      "Is Coupons Given",
      "Coupons Given Qty",
      "Is Coupons Used By Patient",
      "Is Empanorm Launched",
      "Coupons Used Qty",
      "Status",
      "Created By",
      "Created Date",
      "Updated By",
      "Updated Date",
      "RPS Flag"
    ];


    const mappedData = (myCampsReport || []).map((item) => ({
      "Doctor Name": item.doctorName,
      "Speciality": item.speciality,
      "Activity Name": item.activityName,
      "Camp Id": item.camp_id,
      "Camp Type": item.camp_type,
      "User Id": item.user_id,
      "Camp Date": item.campDate,
      "Patient Screened": item.patient_screened,
      "Prescription Count": item.prescription_count,
      // "Is Executed": item.is_executed,
      'Hypertension Kit Utilized': item.camp_type === "Hypertension" ? item.no_of_kits_given : 0,
      'Jupiros Diet Care Kit Utilized': item.camp_type === "Lipid" ? item.no_of_kits_given : 0,
      'Glucometer Kits': item.camp_type === "Diabetes Detection" ? item.no_of_kits_given : 0,
      "Is Prescription Generated": item.is_prescription_generated === "Y"?"Yes":"No",
      "Date Of Prescription": item.date_of_prescription,
      "Is BCC1 Distributed": item.is_bcc1_distributed=== "Y"?"Yes":"No",
      "Is Coupons Given": item.is_coupons_given,
      "Coupons Given Qty": item.coupons_given_qty,
      "Is Coupons Used By Patient": item.is_coupons_used_by_patient,
      "Is Empanorm Launched": item.is_empanorm_launched=== "Y"?"Yes":"No",
      "Coupons Used Qty": item.coupons_used_qty,
      "Status": item.is_executed === "Y"?"executed":"planned",
      "Created By": item.created_by,
      "Created Date": item.created_date,
      "Updated By": item.updated_by,
      "Updated Date": item.updated_date,
      "RPS Flag": item.is_rps === "Y"?"RPS":"Non-RPS"
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camp Reports");
    const rn = Math.floor(Math.random() * 1000) + 1;
    XLSX.writeFile(wb, `Alkem_My_Camps_Reports_${rn}.xlsx`);

  };


  const executeCamp = (campId, name) => {
    setEditModal(true);
    setCampId(campId);
    setCampTypeName(name);
  }

  const handelCloseEditModal = () => {
    setEditModal(false);
    getCampReportList();
    getMyCampsReport();
  }


  // pagination logic

  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(campReportList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };


  const allowedCampTypes = [
    "Diabetes Detection",
    "Hypertension",
    "Lipid",
    "TSART Trio BP Monitor Investment",
    "Prescription Upload",
    "Bcc Distribution"
  ];

  // build the array you’ll actually display
  const filteredList =
    designation !== "AREA BUSINESS MANAGER" &&  Number(role) !== 4
      ? (campReportList || []).filter((e) =>
        allowedCampTypes.includes(e.camp_type_name)
      )
      : campReportList || [];



  return loading ? (
    <Loader />
  ) : (
    <div>
      <main id="main" className="main">
        <div className="row">
        </div>
        {/* <ChartComponents listCampType={filters.listCampType} /> */}
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
                    name="searchQuery"
                    onChange={handelSetFilterValue}
                    value={filters.searchQuery}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
              {<div className="dropdown ml-3 mt-4" style={{ marginLeft: "1%" }}>
                <select
                  className="form-control selectStyle"
                  name="campTypeId"
                  onChange={handelSetFilterValue}
                  value={filters.campTypeId}
                >
                  <option value="">Select Camp Type</option>
                  {campList.map((e) => (
                    <option
                      key={e.basic_id}
                      value={e.description}
                    >
                      {e.description}
                    </option>
                  ))}
                </select>
              </div>}
            </div>
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <small className="msgnote mt-2">*Scroll left for other column of table</small>
                  {/* <div className="m-3 d-flex justify-content-between align-items-end" >
                    <button
                      type="button"
                      className="btn btn-download mt-2 m-1"
                      onClick={handelReportDownload}
                    >
                      <i className="bx bx-cloud-download"></i> Download Report
                    </button>
                      <div>
                        {!(designation === "AREA BUSINESS MANAGER" && Number(role) === 4) && (
                          <button
                            type="button"
                            className="btn btn-success mt-2 m-1"
                            onClick={handleOpenPrescriptionModal}
                          >
                            <i className="bi bi-plus"></i> Prescription Upload
                          </button>
                        )}

                    <button
                      type="button"
                      className="btn btn-success mt-2 m-1"
                      onClick={toggleAddCampModal}
                    >
                      <i className="bi bi-plus"></i> Add New Camp
                    </button></div>
                      
                  </div> */}
                  <hr />
                  {/* <ul className="nav nav-tabs " id="campTabs" role="tablist">
                    {tabs.map((tab) => (
                      <li className="nav-item" role="presentation" key={tab.key}>
                        <button
                          className={`nav-link d-flex align-items-center px-4 py-2 fw-semibold ${isExecuted === tab.key ? "active" : ""
                            }`}
                          id={`${tab.label.toLowerCase()}-tab`}
                          data-bs-toggle="tab"
                          data-bs-target={`#${tab.label.toLowerCase()}`}
                          type="button"
                          role="tab"
                          aria-controls={tab.label.toLowerCase()}
                          aria-selected={isExecuted === tab.key}
                          onClick={() => setIsExecuted(tab.key)}
                        >
                          <i className={`${tab.icon} me-2 fs-5`}></i>
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul> */}
                  {/* Bordered Table */}
                  <h3>No Camps to show</h3>
                  {/* End Bordered Table */}
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

                            <Pagination reportList={campReportList}
                              page={page}
                              selectPageHandler={selectPageHandler}
                            />

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
      {/* End #main */}
 {infoReportModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Camp Report Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Existing form fields */}
                  <form className="row g-3">
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Type"
                        value={infoData && infoData.camp_type_name}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Type of Camp
                      </label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Name"
                        value={infoData && infoData.doctor_name}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Doctor Name
                      </label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Speciality"
                        value={infoData && infoData.speciality}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Speciality
                      </label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Speciality"
                        value={infoData && infoData.garnet_code}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Garnet code
                      </label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Date"
                        value={infoData && infoData.camp_date1}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Date of Camp
                      </label>
                    </div>
                      <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Speciality"
                        value={infoData && infoData.is_rps === "N" ? "No" : "Yes"}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Is Doctor RPS
                      </label>
                    </div>
                     {infoData?.camp_type_name?.trim() !== "Cathlab" && (
  <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.patient_count}
      readOnly
    />
    <label className="form-label did-floating-label">
      No. of Patients Screened
    </label>
  </div>
)}
                    
                    {infoData?.camp_type_name?.trim() === "Diabetes Detection" && (
  <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder=""
      value={infoData && infoData?.no_of_kits_given}
      readOnly
    />
    <label className="form-label did-floating-label">
     No. of Glucometer Kits Utilised
    </label>
  </div>
)}
                  {infoData?.camp_type_name?.trim() === "Lipid" && (
  <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder=""
      value={infoData && infoData?.no_of_kits_given}
      readOnly
    />
    <label className="form-label did-floating-label">
      JUPIROS DIET CARE KIT Utilised
    </label>
  </div>
)}
{infoData?.camp_type_name?.trim() === "Hypertension" && (
  <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder=""
      value={infoData && infoData?.no_of_kits_given}
      readOnly
    />
    <label className="form-label did-floating-label">
      Hypertension Care kit Utilised
    </label>
  </div>
)}

       {infoData?.camp_type_name?.trim() === "Cathlab" && (
        <>
           <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.hospital_name}
      readOnly
    />
    <label className="form-label did-floating-label">
      Hospital Name
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.angioplasty_count}
      readOnly
    />
    <label className="form-label did-floating-label">
      Number of Angioplasty
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.total_ticagrelor_potential}
      readOnly
    />
    <label className="form-label did-floating-label">
      Total Ticagrelor Potential
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.pax_count}
      readOnly
    />
    <label className="form-label did-floating-label">
    Number of Pax
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.current_business}
      readOnly
    />
    <label className="form-label did-floating-label">
      Current Business
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.expected_business}
      readOnly
    />
    <label className="form-label did-floating-label">
      Expected Business
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData.is_ticavic_avl === "N" ? "No" : "Yes"}
      readOnly
    />
    <label className="form-label did-floating-label">
     Is Ticavic Available?
    </label>
  </div>
   <div className="col-md-4 did-floating-label-content">
    <input
      type="text"
      className="form-control did-floating-input"
      placeholder="Speciality"
      value={infoData && infoData?.hospital_type === "N" ? "Non discounted" : "Discounted"}
      readOnly
    />
    <label className="form-label did-floating-label">
   Hospital Type
    </label>
  </div>
  
        </>
 
  
)}
                   
                     
                  </form>

                  {/* === Images + Brand Mappings Table === */}
                  <div className="mt-4">
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            {/* <th>Brand Name</th> */}
                            <th>Prescription Count</th>
                            <th>Images</th>
                          </tr>
                        </thead>
                       <tbody>
  {groupedImages && Object.values(groupedImages).length > 0 ? (
    Object.values(groupedImages).map((group, idx) => (
      <tr key={idx}>
        <td className="fw-semibold">{group.itemName}</td>
        <td>{group.count}</td>
        <td>
          <div className="d-flex flex-wrap gap-2">
            {group.images.map((image, i) => (
              <img
                key={i}
                src={image}
                alt={group.itemName}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center">
        No prescription images or brand mappings found.
      </td>
    </tr>
  )}
</tbody>
                      </table>
                    </div>
                  </div>
                  {/* === End of section === */}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

       {previewImg && (
  <div className="image-preview-overlay" onClick={handleClosePreview}>
    <span className="close-btn">&times;</span>
    <img src={previewImg} alt="Preview" className="preview-img" />
  </div>
)}  
       {addPrescriptionModal&& <AddPrescriptionModal
      handelCloseModel={handleClosePrescriptionModal}/>}

      {designation === "AREA BUSINESS MANAGER" && Number(role) === 4 &&
        addRequestModel
        ? <AddMyCampAbmModal
          handelCloseModel={handelCloseModel}
        />
        : addRequestModel && <AddMyCampModal
          handelCloseModel={handelCloseModel}
        />
      }

      {
        campTypeName === "ABPM" && <AbpmExecution
          crid={campId}
          show={editRequestModal}
          handelCloseEditModal={handelCloseEditModal}
          campReportList={campReportList}
        />
      }

      {
        campTypeName === "Cathlab" && <CathlabExecution
          crid={campId}
          show={editRequestModal}
          handelCloseEditModal={handelCloseEditModal}
          campReportList={campReportList}
        />
      }

      
      {
        campTypeName === "HbA1c" && <HbA1cExecution
          crid={campId}
          show={editRequestModal}
          handelCloseEditModal={handelCloseEditModal}
          campReportList={campReportList}
        />
      }


      {campTypeName === "Diabetes Detection" && <DiabetesModal
        crid={campId}
        show={editRequestModal}
        handelCloseEditModal={handelCloseEditModal}
        campReportList={campReportList}
      />}

      {campTypeName === "Hypertension" && <HypertensionModal
        crid={campId}
        show={editRequestModal}
        handelCloseEditModal={handelCloseEditModal}
        campReportList={campReportList}
      />}

      {campTypeName === "Lipid" && <LipidModal
        crid={campId}
        show={editRequestModal}
        handelCloseEditModal={handelCloseEditModal}
        campReportList={campReportList}
      />}

    </div>
  );
};

export default Dashboard;
