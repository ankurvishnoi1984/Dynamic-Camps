import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx/xlsx.mjs";

import { BASEURL, BASEURL2, ImageLimit, PageCount } from "../constant/constant";
import axios from "axios";
import "./NotFound.css";
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
const NotFound = () => {
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
        <h3>No Camps to show</h3>
      </main>


    </div>
  );
};

export default NotFound;
