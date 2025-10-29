import React, { useState, useEffect } from "react";
import ConfirmationPopup from "../popup/Popup";
//import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import * as XLSX from "xlsx/xlsx.mjs";
import axios from "axios";
import "../Dashboard/Dashboard.css";
import { BASEURL, PageCount } from "../constant/constant";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import useCampList from "../CustomHook/useCampList";
import Pagination from "../utils/Pagination";
import useRepresentativeList from "../CustomHook/useRepresentativeList";
import useDoctorList from "../CustomHook/useDoctorList";
import usePathlabList from "../CustomHook/usePathlabList";
import useMarketingHeadList from "../CustomHook/useMarketingHeadList";
const Request = () => {
  const userId = sessionStorage.getItem("userId");
  const empId = sessionStorage.getItem('empId');
  const role = sessionStorage.getItem('role');
  const userMail = sessionStorage.getItem('email');

  // custom hook for get camp list
  const [campList] = useCampList();
  const [representativeList] = useRepresentativeList(empId,role);
  const [doctorList] = useDoctorList(empId,role);
  const [pathlabList] = usePathlabList();
  const [marketingHeadList] = useMarketingHeadList();
  
  // data for select tag
  const [isLoading, setIsLoading] = useState(false);
  
  const [marketingHeadEmail, setMarketingHeadEamil] = useState("");
  const [marketingHeadId, setMarketingHeadId] = useState("");
  const [campType, setCampType] = useState("");
  const [campName, setCampName] = useState("");
  const [repId, setRepId] = useState("");
  const [repName, setRepName] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repMobile, setRepMobile] = useState("");
  const [repHq, setRepHq] = useState("");
  const [repZone, setRepZone] = useState("");
  const [repState, setRepState] = useState("");
  const [repCity, setRepCity] = useState('');

  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorQualification, setDoctorQualification] = useState("");
  const [pathlab, setPathlab] = useState("");
  const [pathlabName, setPathlabName] = useState("");
  const [pathlabEmail, setPathlabEmail] = useState("");
  const [pathlabEmail1, setPathlabEmail1] = useState("");


  const [campVenue, setCampVenue] = useState("");
  const [campDate, setCampDate] = useState("");
  const [campTime, setCampTime] = useState("");
  const [campPatients, setCampPatients] = useState("");
  const [abmContact, setAbmContact] = useState("");

  const [listCampType, setListCampType] = useState("");
  const [campRequestList, setCampRequestList] = useState([]);

  const [addRequestModel, setAddRequestModel] = useState(false);
  const [infoRequestModel, setInfoRequestModel] = useState(false);
  const [remarkInfoRequestModel, setRemarkInfoRequestModel] = useState(false);
  const [editRequestModel, setEditRequestModel] = useState(false);

  const [infoData, setInfoData] = useState({});
  const [remarkInfoData, setRemarkInfoData] = useState([]);
  // for delete

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [editId, setEditId] = useState("");
  const [userComment, setUserComment] = useState('')
  const [loading, setLoading] = useState(false);

  // for filter result
// for filter result
const [filters, setFilters] = useState({
  listCampType: "",
  searchQuery: "",
  filterBy: "",
  startDate: "",
  endDate: "",
});

const handelSetFilterValue = (event) => {
  const { name, value } = event.target;
  setFilters((previousFilter) => ({
    ...previousFilter,
    [name]: value,
  }));
};


  const handelAddRequest = () => {
    setAddRequestModel(true);
  };
  const handelCloseModel = () => {
    setAddRequestModel(false);
  };
  const handelCloseEditModel = () => {
    setEditRequestModel(false);
    setCampType("");
    setCampName("");
    setRepId("");
    setRepName("");
    setRepMobile("");
    setRepEmail("");
    setDoctorId("");
    setDoctorName("");
    setDoctorQualification("");
    setPathlab("");
    setPathlabName("");
    setPathlabEmail("");
    setPathlabEmail1("");
    setCampVenue("");
    setCampDate("");
    setCampTime("");
    setCampPatients("");
    setRepZone("");
    setRepCity("");
    setRepHq("");
    setRepState("");
    setAbmContact("");
    setMarketingHeadEamil("");
  };

  const handelInfo = async (campRequestId) => {
    await getCampRequestInfoWithId(campRequestId);
    setInfoRequestModel(true);
  };
  const handelCloseInfoModel = () => {
    setInfoRequestModel(false);
    setInfoData({});
  };

  const handelRemarkInfo = async (campRequestId) => {
    await getCampRequestRemarkInfoWithId(campRequestId);
    setRemarkInfoRequestModel(true);
  };
  const handelCloseRemarkInfoModel = () => {
    setRemarkInfoRequestModel(false);
    setRemarkInfoData([]);
   
  };

  const getCampRequestRemarkInfoWithId = async (campReqId) => {
    try {
      const res = await axios.post(
        `${BASEURL}/campRequest/getCampRemarkInfo`,
        { campReqId: campReqId }
      );
      if (res?.data?.errorCode === "1") {
        setRemarkInfoData(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelDelete = (campRequestId) => {
    setShowDeleteConfirmation(true);
    setDelId(campRequestId);
  };
  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleEdit = async (campRequestId) => {
    setEditId(campRequestId);
    try {
      // Make an API call to fetch the details of the camp request
      const response = await axios.post(
        `${BASEURL}/campRequest/getCampRequestDetails`,
        {
          campReqId: campRequestId,
        }
      );

      if (response.data && response.data.errorCode == "1") {
        const requestData = response.data.data[0]; // Assuming the data is returned as an array

        console.log("request data", requestData);
        // Set the state with the fetched data
        setCampType(requestData.camp_id);
        setCampName(requestData.camp_name);
        setRepId(requestData.rep_id);
        setRepName(requestData.rep_name);
        //setRepEmail(requestData.rep_email);
        setRepMobile(requestData.rep_contact);
        setAbmContact(requestData.abm_contact);
        setDoctorId(requestData.cdoc_id);
        setDoctorName(requestData.doctor_name);
        setDoctorQualification(requestData.doctor_qualification);
        setPathlab(requestData.pathlab_id);
        setPathlabName(requestData.pathlab_name);
        setPathlabEmail(requestData.pathlab_email);
        setPathlabEmail1(requestData.pathlab_email1);
        setCampVenue(requestData.camp_venue);
        setCampDate(requestData.camp_date1);
        setCampTime(requestData.camp_time);
        setCampPatients(requestData.no_of_patients);
        setRepZone(requestData.zone);
        setRepHq(requestData.hq);
        setRepState(requestData.state);
        setRepCity(requestData.rep_address);
        setMarketingHeadId(requestData.mhid);
        setMarketingHeadEamil(requestData.email);
        // Open the edit modal
        setEditRequestModel(true);
      } else {
        // Handle the case where no data is returned or an error occurred
        toast.error("Failed to fetch details for the camp request.");
        //alert("Failed to fetch details for the camp request.");
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Failed to fetch camp request details:", error);
      toast.error("Error fetching camp request details.");
      //alert("Error fetching camp request details.");
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(`${BASEURL}/campRequest/deleteCampRequest`, {
        campReqId: delId,
      });

      console.log("inside delete", res);
      if (res.data.errorCode == "1") {
        toast.success("Camp Request Deleted Successfully");
        //alert("Camp Request Deleted Successfully");

        await getCampRequestList();
        setDelId("");
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
        //alert(`Failed to delete employee with ID ${delId}`)
      }
    } catch (error) {
      toast.error(error.message);
      //alert(error.message)
    }
  };

  const getCampRequestInfoWithId = async (campReqId) => {
    try {
      const res = await axios.post(
        `${BASEURL}/campRequest/getCampRequestDetails`,
        { campReqId: campReqId }
      );
      if (res?.data?.errorCode == "1") {
        setInfoData(res?.data?.data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };


  //  for showing dashboard list
  const getCampRequestList = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASEURL}/campRequest/getCampRequest?searchName=${filters.searchQuery}`,
        {...filters, userId}
      );

      if (res?.data?.errorCode == "1") {
        setCampRequestList(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false)
    }
  };

  useEffect(() => {

    if(filters.searchQuery){
      let timer =setTimeout(()=>{
        getCampRequestList();
      },2000)
      
      return ()=>{
        clearTimeout(timer)
      }
    }
    else{
      getCampRequestList();
    }
  }, [filters]);

  // for selecting pathlab

  const handelPathlabChange = (event) => {
    if (!event.target.value) {
      setPathlab("");
      setPathlabName("");
      setPathlabEmail("");
      setPathlabEmail1("");
      return;
    }

    const selectedPathlab = pathlabList.find(
      (e) => e.pathlab_id == event.target.value
    );

    if (selectedPathlab) {
      setPathlab(selectedPathlab.pathlab_id);
      setPathlabName(selectedPathlab.pathlab_name);
      setPathlabEmail(selectedPathlab.pathlab_email);
      setPathlabEmail1(selectedPathlab.pathlab_email1)
    }
  };

  // for selecting doctor data

  const handelDoctorChange = (event) => {
    if (!event.target.value) {
      setDoctorId("");
      setDoctorQualification("");
      return;
    }
    const selectedDoctor = doctorList.find(
      (e) => e.cdoc_id == event.target.value
    );
    console.log(selectedDoctor);
    if (selectedDoctor) {
      setDoctorId(selectedDoctor.cdoc_id);
      setDoctorQualification(selectedDoctor.doctor_qualification);
      setDoctorName(selectedDoctor.doctor_name);
    }
  };

  const handelRepresentativeChange = (event) => {
    if (!event.target.value) {
      setRepId("");
      setRepEmail("");
      setRepMobile("");
      setRepHq("");
      setRepState("");
      setRepZone("");
      setRepCity("");
      setRepName("");
      return;
    }
    const selectedRepresentative = representativeList.find(
      (e) => e.rep_id == event.target.value
    );
    console.log("selected representative",selectedRepresentative);
    if (selectedRepresentative) {
      setRepId(selectedRepresentative.rep_id);
      setRepName(selectedRepresentative.rep_name);
      setRepEmail(selectedRepresentative.rep_email);
      setRepMobile(selectedRepresentative.rep_contact);
      setRepHq(selectedRepresentative.hq);
      setRepState(selectedRepresentative.state);
      setRepZone(selectedRepresentative.zone);
      setRepCity(selectedRepresentative.rep_address);
    }
  };

  // for adding data

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    console.log(repState, repMobile, repCity);
    //console.log("inside handel add submit")

    if (
      !campType ||
      !repId ||
      !doctorId ||
      !pathlab ||
      !campVenue ||
      !campDate ||
      !campTime ||
      !campPatients ||
      !abmContact ||
      !repZone ||
      !repHq ||
      // !repState ||
      !marketingHeadEmail
    ) {
      toast.error("Missing Required Field");
      //alert("Missing Required Field");

      return;
    }
    if(!repState || !repMobile || !repCity){

      //console.log(repState, repMobile, repCity);
      toast.error("Missing Representative Data")
      return;
    }
    
 
    setIsLoading(true);

    try {

      // Call the API to update representative data
      const updateRepRes = await axios.post(`${BASEURL}/report/editRepresentativeForAddRequest`, {
        repId: repId,
        state: repState,
        mobile: repMobile,
        city: repCity
      });
      const res = await axios.post(`${BASEURL}/campRequest/sendEmailForAdd`, {
        campTypeId: campType,
        campName: campName,
        repId: repId,
        repName: repName,
        repContact: repMobile,
        repCity: repCity,
        docId: doctorId,
        doctorName: doctorName,
        docDegree: doctorQualification,
        pathLabId: pathlab,
        pathLabName: pathlabName,
        pathLabEmail: pathlabEmail,
        pathLabEmail1:pathlabEmail1,
        campVenue: campVenue,
        campDate: campDate,
        campTime: campTime,
        patientsNo: campPatients,
        zone: repZone,
        state: repState,
        hq: repHq,
        abmContact: abmContact,
        marketingHeadEmail: marketingHeadEmail,
        marketingHeadId: marketingHeadId,
        userId: userId,
        userMail
      });

      if (res?.data?.errorCode == "1") {
        toast.success("Camp Request Added Successfully");

        await getCampRequestList();
        setCampType("");
        setCampName("");
        setRepId("");
        setRepName("");
        setRepMobile("");
       // setRepEmail("");
        setDoctorId("");
        setDoctorName("");
        setDoctorQualification("");
        setPathlab("");
        setPathlabName("");
        setPathlabEmail("");
        setPathlabEmail1("")
        setCampVenue("");
        setCampDate("");
        setCampTime("");
        setCampPatients("");
        setRepZone("");
        setRepHq("");
        setRepState("");
        setRepCity("");
        setAbmContact("");
        setMarketingHeadEamil("");
        setMarketingHeadId("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in creating camp request");
    } finally {
      setIsLoading(false);
      setAddRequestModel(false); // Stop loading
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (
      !campType ||
      !repId ||
      !doctorId ||
      !pathlab ||
      !campVenue ||
      !campDate ||
      !campTime ||
      !campPatients ||
      !abmContact ||
      !repZone ||
      !repHq ||
      //!repState ||
      !marketingHeadEmail
    ) {
      toast.error("Missing Required Field");
      //alert("Missing Required Field")
      return;
    }
    if(!repState || !repMobile || !repCity){

      //console.log(repState, repMobile, repCity);
      toast.error("Missing Representative Data")
      return;
    }
    if(!userComment){
      toast.error("Enter Reason for edit");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASEURL}/campRequest/sendEmailForUpdate`,
        {
          campTypeId: campType,
          campName: campName,
          repId: repId,
          repName: repName,
          repContact: repMobile,
          repCity: repCity,
          docId: doctorId,
          doctorName: doctorName,
          docDegree: doctorQualification,
          pathLabId: pathlab,
          pathLabName: pathlabName,
          pathLabEmail: pathlabEmail,
          pathLabEmail1: pathlabEmail1,
          campVenue: campVenue,
          campDate: campDate,
          campTime: campTime,
          patientsNo: campPatients,
          zone: repZone,
          state: repState,
          hq: repHq,
          abmContact: abmContact,
          marketingHeadEmail: marketingHeadEmail,
          marketingHeadId: marketingHeadId,
          userComment:userComment,
          userId: userId,
          userMail,
          campReqId: editId,
        }
      );

      if (res?.data?.errorCode == "1") {
        toast.success("Camp Request Updated Successfully");
        //alert("Camp Request Updated Successfully");
        setEditRequestModel(false);
        await getCampRequestList();
        setCampType("");
        setCampName("");
        setRepId("");
        setRepName("");
        setRepMobile("");
        // setRepEmail("");
        setDoctorId("");
        setDoctorName("");
        setDoctorQualification("");
        setPathlab("");
        setPathlabName("");
        setPathlabEmail("");
        setPathlabEmail1("");
        setCampVenue("");
        setCampDate("");
        setCampTime("");
        setCampPatients("");
        setRepZone("");
        setRepHq("");
        setRepState("");
        setRepCity("")
        setAbmContact("");
        setMarketingHeadEamil("");
        setMarketingHeadId("");
        setUserComment('');
      }
    } catch (error) {
      alert("Error In Updating Camp Request");
      console.log(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  // pagination logic

  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(campRequestList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };
 

  const handelReportDownload = () => {
    // Define custom column headers
    console.log(campRequestList);
    const headers = [
      "Camp Request Id",
      "Doctor UIN Number",
      "Doctor Name",
      "PathLab Name",
      "Camp Name",
      "Camp Date",
      "Camp Venue",
      "Representative Name",
      "Contact",
      "City",
      "State",
      "Hq",
      "Zone",
      

    ];

    const mappedData = campRequestList.map((item) => ({
      "Camp Request Id":item.camp_req_id,
      "Doctor UIN Number":item.uin_number,
      "Doctor Name": item.doctor_name,
      "PathLab Name": item.pathlab_name,
      "Camp Name":item.camp_name,
      "Camp Date": item.camp_date,
      "Camp Venue": item.camp_venue,
      "Representative Name": item.rep_name,
      "Contact": item.rep_contact,
      "City" :item.rep_address,
      "State" : item.state,
      "Hq":item.hq,
      "Zone":item.zone
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const rn = Math.floor(Math.random() * 1000) + 1
    XLSX.writeFile(wb, `Lupin_AllRequest_${rn}.xlsx`);
  };
  return loading ? <Loader/> : (
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
                    name="searchQuery"
                    onChange={handelSetFilterValue}
                     value={filters.searchQuery}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
              <div className="dropdown mt-4" style={{ marginLeft: "1%" }}>
                <select
                  className="form-control selectStyle"
                  name="filterBy"
                  onChange={handelSetFilterValue}
                  value={filters.filterBy}
                >
                  <option value="">Select filter</option>
                  <option value="month">Month Wise</option>
                  <option value="week">Week Wise</option>
                </select>
              </div>
              <div className="form-group ml-2" style={{ marginLeft: "1%" }}>
                <label htmlFor="fromDate">From Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="fromDate"
                  placeholder="Select From Date"
                  value={filters.startDate}
                  name="startDate"
                  onChange={handelSetFilterValue}
                />
              </div>
              <div className="form-group ml-2" style={{ marginLeft: "1%" }}>
                <label htmlFor="toDate">To Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="toDate"
                  placeholder="Select To Date"
                  value={filters.endDate}
                  name="endDate"
                  onChange={handelSetFilterValue}
                />
              </div>

              <div className="dropdown ml-3 mt-4" style={{ marginLeft: "1%" }}>
                <select
                  className="form-control selectStyle"
                  onChange={(e) => {
                    setListCampType(e.target.value);
                  }}
                  value={listCampType}
                >
                  <option value="">All Camp</option>
                  {campList.map((e) => (
                    <option key={e.camp_id} value={e.camp_id}>
                      {e.camp_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="m-3">
                    <button
                      type="button"
                      className="btn btn-success mt-2"
                      onClick={handelAddRequest}
                    >
                      <i className="bx bx-plus"></i> New Request
                    </button>
                    <button
                      type="button"
                      className="btn btn-success ml-1 mt-2"
                      onClick={handelReportDownload}
                    >
                      <i className="bx bx-cloud-download"></i> Download Request Report
                    </button>
                  </div>
                  <hr />
                  <div className="tbst">
                    <table className="table table-hover newcss">
                      <thead>
                        <tr>
                          <th scope="col">Request Id</th>
                          <th scope="col">Doctor UIN</th>
                          <th scope="col">Doctor Name</th>
                          <th scope="col">Rep Name</th>
                          <th scope="col">Pathlab Name</th>
                          <th scope="col">Camp Date</th>
                          <th scope="col">Camp Venue</th>
                      
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campRequestList &&
                          campRequestList.length > 0 &&
                          campRequestList
                            .slice(page * PageCount - PageCount, page * PageCount)
                            .map((e) => (
                              <tr key={e.camp_req_id}>
                                <td>{e.camp_req_id}</td>
                                <td>{e.uin_number}</td>
                                <td>{e.doctor_name}</td>
                                <td>{e.rep_name}</td>
                                <td>{e.pathlab_name}</td>
                                <td>{e.camp_date}</td>
                                <td>{e.camp_venue}</td>
          
                                <td>
                                  <button
                                    className="btn btn-info rounded-pill ml-1 mb-1"
                                    title="Info"
                                    onClick={() => handelInfo(e.camp_req_id)}
                                  >
                                    <i className="ri-information-2-line"></i>
                                  </button>
                                  <button
                                    className="btn btn-info rounded-pill ml-1 mb-1"
                                    title="Remark"
                                    onClick={() => handelRemarkInfo(e.camp_req_id)}
                                  >
                                    <i className="ri-file-info-fill"></i>
                                  </button>
                                  <button
                                    className="btn btn-dark rounded-pill ml-1 mb-1"
                                    title="Edit"
                                    onClick={() => handleEdit(e.camp_req_id)}
                                  >
                                    <i className="ri-edit-2-fill"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger rounded-pill ml-1 mb-1"
                                    title="Delete"
                                    onClick={() => handelDelete(e.camp_req_id)}
                                  >
                                    <i className="ri-delete-bin-2-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>

                  {campRequestList && campRequestList.length > 0 && (
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
                            <Pagination reportList={campRequestList}
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

     {infoRequestModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <form className="row g-3">
                    <div className="col-md-4 did-floating-label-content">
                     
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Type"
                        value={infoData && infoData.camp_name}
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
                        placeholder="Pathlab Name"
                        value={infoData && infoData.pathlab_name}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Name of Pathlab</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Representative Name"
                        value={infoData && infoData.rep_name}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Name of Representative</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Contact No"
                        value={infoData && infoData.rep_contact}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Contact No Of Rep</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="City"
                        value={infoData && infoData.rep_address}
                        readOnly
                      />
                      <label className="form-label did-floating-label">City</label>
                    </div>
                     <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="State"
                        value={infoData && infoData.state}
                        readOnly
                      />
                      <label className="form-label did-floating-label">State</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Zone"
                        value={infoData && infoData.zone}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Zone</label>
                    </div>
                   
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Hq"
                        value={infoData && infoData.hq}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Hq</label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Name"
                        value={infoData && infoData.doctor_name}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Name of Doctor</label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Degree"
                        value={infoData && infoData.doctor_qualification}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Degree of Doctor</label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Date"
                        value={infoData && infoData.camp_date}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Date of Camp</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="time"
                        className="form-control did-floating-input"
                        placeholder="Camp Time"
                        value={infoData && infoData.camp_time}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Time of Camp</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Venue"
                        value={infoData && infoData.camp_venue}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Camp Venue</label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Patient No"
                        value={infoData && infoData.no_of_patients}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        No. of Patients Expected
                      </label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Contact No"
                        value={infoData && infoData.abm_contact}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Contact No. of ABM</label>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     {remarkInfoRequestModel && (
        <div className="addusermodel ">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl radd-model">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Remark</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseRemarkInfoModel}
                  ></button>
                </div>
                <div className="modal-body p-4">
                 
                    <div className="tbst">
                    {remarkInfoData && remarkInfoData.length>0 ?
                     <table  className="table table-hover newcss"
                    >
                         <thead>
                           <tr>
                            <th>Comment By</th>
                            <th>Comment</th>
                            <th>Comment Date</th>
                           </tr>
                          
                         </thead>
                         <tbody>
                            {remarkInfoData.map((e)=>(
                              <tr key={e.id}>
                              <td>{e.edit_by}</td>
                              <td>{e.comment}</td>
                              <td>{e.modified_date}</td>
                            </tr>
                            ))
                            }
                         </tbody>
                    </table>: <div>Data not found</div>}
                     </div>
               
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    
     {addRequestModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Request</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form className="row g-3" onSubmit={handleAddSubmit}>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={(event) => {
                          setCampName(
                            event.target.options[
                              event.target.selectedIndex
                            ].getAttribute("data-campname")
                          );
                          setCampType(event.target.value);
                        }}
                        value={campType}
                      >
                        <option value="">Select...</option>
                        {campList.map((e) => (
                          <option
                          data-campname={e.camp_name}
                          key={e.camp_id}
                          value={e.camp_id}
                          >
                            {e.camp_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Type of Camp</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        

                        onChange={handelPathlabChange}
                        value={pathlab}
                      >
                        <option value="">Select...</option>
                        {pathlabList.map((e) => (
                          <option key={e.pathlab_id} value={e.pathlab_id}>
                            {e.pathlab_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Pathlab</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      
                      <select
                        className="form-control did-floating-select"
                        onChange={(e) => {
                          setMarketingHeadEamil(
                            e.target.options[
                              e.target.selectedIndex
                            ].getAttribute("data-email")
                          );

                          setMarketingHeadId(e.target.value);
                        }}
                        value={marketingHeadId}
                      >
                        <option value="">Select...</option>
                        {marketingHeadList.map((e) => (
                          <option
                            data-email={e.email}
                            key={e.mhid}
                            value={e.mhid}
                          >
                            {e.name}
                          </option>
                        ))}
                      </select>
                      <label className="form-label did-floating-label">
                        Marketing
                      </label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelRepresentativeChange}
                        value={repId}
                      >
                        <option value="">Select...</option>
                        {representativeList.map((e) => (
                          <option key={e.rep_id} value={e.rep_id}>
                            {e.rep_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Representative</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="contact"
                        inputMode="numeric"
                        pattern="\d*"
                        onChange={(e)=>{
                          
                          const value = e.target.value;
                         
                          if (/^\d{0,10}$/.test(value)) {
                            console.log("isn",value)
                            setRepMobile(value);
                          }
                          //setRepMobile(e.target.value);
                        }}
                        value={repMobile ? repMobile : ""}
                      />
                      <label className="form-label did-floating-label">Contact No. Of Representative</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="City"
                      
                        onChange={(e)=>{
                           setRepCity(e.target.value);
                        }}
                        value={repCity ? repCity : ""}
                      />
                      <label className="form-label did-floating-label">City</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="state"
                        onChange={(e) => {
                          setRepState(e.target.value);
                        }}
                        value={repState ? repState : ""}
                      />
                        <label className="form-label did-floating-label">State</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="zone"
                        onChange={(e) => {
                          setRepZone(e.target.value);
                        }}
                        value={repZone}
                      />
                        <label className="form-label did-floating-label">Zone</label>
                    </div>
                    
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setRepHq(e.target.value);
                        }}
                        placeholder="hq"
                        value={repHq}
                      />
                        <label className="form-label did-floating-label">Hq</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelDoctorChange}
                        value={doctorId}
                      >
                        <option value="">Select...</option>
                        {doctorList.map((e) => (
                          <option key={e.cdoc_id} value={e.cdoc_id}>
                            {e.doctor_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Doctor</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Degree"
                        value={doctorQualification}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Degree of Doctor</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="date"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampDate(e.target.value);
                        }}
                        placeholder="Camp Date"
                        value={campDate}
                      />
                        <label className="form-label did-floating-label">Date of Camp</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="time"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampTime(e.target.value);
                        }}
                        placeholder="Camp Time"
                        value={campTime}
                      />
                        <label className="form-label did-floating-label">Time of Camp</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampVenue(e.target.value);
                        }}
                        placeholder="Camp Venue"
                        value={campVenue}
                      />
                      <label className="form-label did-floating-label">Camp Venue</label>

                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                   
                      <input
                        type="number"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampPatients(e.target.value);
                        }}
                        placeholder="Patients No."
                        value={campPatients}
                      />
                      <label className="form-label did-floating-label">
                        No. of Patients Expected
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Contact No."
                        onChange={(e) => {
                          const value = e.target.value;
                         
                          if (/^\d{0,10}$/.test(value)) {
                            setAbmContact(value);
                          }
                         // setAbmContact(e.target.value);
                        }}
                        value={abmContact}
                      />
                        <label className="form-label did-floating-label">Contact No of ABM</label>
                    </div>
                  
                    <div className="text-center">
                      {isLoading ? (
                        <ThreeDots
                          visible={true}
                          height="80"
                          width="80"
                          color="#4fa94d"
                          radius="9"
                          ariaLabel="three-dots-loading"
                          wrapperStyle={{ justifyContent: "center" }}
                          wrapperClass="mx-auto"
                        />
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-success mx-auto"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     
      {editRequestModel && (
        <div className="addusermodel">
          <div
            className="modal fade show"
            style={{ display: "block" }}
            id="ExtralargeModal"
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Request</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form className="row g-3" onSubmit={handleEditSubmit}>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={(event) => {
                          setCampType(event.target.value);
                          setCampName(
                            event.target.options[
                              event.target.selectedIndex
                            ].getAttribute("data-campname")
                          );
                        }}
                        value={campType}
                      >
                        <option value="">Select...</option>
                        {campList.map((e) => (
                          <option
                          data-campname={e.camp_name}
                          key={e.camp_id}
                          value={e.camp_id}
                          >
                            {e.camp_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Type of Camp</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        //  onChange={(e)=>{
                        //   setPathlab(e.target.value)
                        // }}
                        onChange={handelPathlabChange}
                        value={pathlab}
                      >
                        <option value="">Select...</option>
                        {pathlabList.map((e) => (
                          <option key={e.pathlab_id} value={e.pathlab_id}>
                            {e.pathlab_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Pathlab</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      
                      <select
                        className="form-control did-floating-select"
                        onChange={(e) => {
                          setMarketingHeadEamil(
                            e.target.options[
                              e.target.selectedIndex
                            ].getAttribute("data-email")
                          );

                          setMarketingHeadId(e.target.value);
                        }}
                        value={marketingHeadId}
                      >
                        <option value="">Select...</option>
                        {marketingHeadList.map((e) => (
                          <option
                            data-email={e.email}
                            key={e.mhid}
                            value={e.mhid}
                          >
                            {e.name}
                          </option>
                        ))}
                      </select>
                      <label className="form-label did-floating-label">
                        Marketing
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelRepresentativeChange}
                        value={repId}
                      >
                        <option value="">Select...</option>
                        {representativeList.map((e) => (
                          <option key={e.rep_id} value={e.rep_id}>
                            {e.rep_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Representative</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="contact"
                        value={repMobile ? repMobile : ""}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Contact No Of Representative</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="City"
                        value={repCity ? repCity : ""}
                        readOnly
                      />
                      <label className="form-label did-floating-label">City</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="state"
                        // onChange={(e) => {
                        //   setRepState(e.target.value);
                        // }}
                        value={repState ? repState : ""}
                        readOnly
                      />
                        <label className="form-label did-floating-label">State</label>
                    </div>
                   

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="zone"
                        onChange={(e) => {
                          setRepZone(e.target.value);
                        }}
                        value={repZone}
                      />
                        <label className="form-label did-floating-label">Zone</label>
                    </div>
                    
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setRepHq(e.target.value);
                        }}
                        placeholder="Hq"
                        value={repHq}
                      />
                        <label className="form-label did-floating-label">Hq</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelDoctorChange}
                        value={doctorId}
                      >
                        <option value="">Select...</option>
                        {doctorList.map((e) => (
                          <option key={e.cdoc_id} value={e.cdoc_id}>
                            {e.doctor_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Name of Doctor</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Degree"
                        value={doctorQualification}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Degree of Doctor</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="date"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampDate(e.target.value);
                        }}
                        placeholder="Camp Date"
                        value={campDate}
                      />
                        <label className="form-label did-floating-label">Date of Camp</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="time"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampTime(e.target.value);
                        }}
                        placeholder="Camp Time"
                        value={campTime}
                      />
                        <label className="form-label did-floating-label">Time of Camp</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampVenue(e.target.value);
                        }}
                        placeholder="Camp Venue"
                        value={campVenue}
                      />
                        <label className="form-label did-floating-label">Camp Venue</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      
                      <input
                        type="number"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setCampPatients(e.target.value);
                        }}
                        placeholder="Patients No."
                        value={campPatients}
                      />
                      <label className="form-label did-floating-label">
                        No. of Patients Expected
                      </label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Contact No."
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,10}$/.test(value)) {
                            setAbmContact(value);
                          }
                        }}
                        value={abmContact}
                      />
                        <label className="form-label did-floating-label">Contact No of ABM</label>
                    </div>
                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        onChange={(e) => {
                          setUserComment(e.target.value);
                        }}
                        placeholder="Comment"
                        value={userComment}
                      />
                        <label className="form-label did-floating-label">Reason For Edit</label>
                    </div>
                    <div className="text-center">
                      {isLoading ? (
                        <ThreeDots
                          visible={true}
                          height="80"
                          width="80"
                          color="#4fa94d"
                          radius="9"
                          ariaLabel="three-dots-loading"
                          wrapperStyle={{ justifyContent: "center" }}
                          wrapperClass="mx-auto"
                        />
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-success mx-auto"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Camp Request?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default Request;
