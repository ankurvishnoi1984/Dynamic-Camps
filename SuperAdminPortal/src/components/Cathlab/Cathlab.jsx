
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL, BASEURL2 } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./cathlab.css"
import Loader from "../utils/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import CathlabComment from "../Modals/CathlabComment";
import CustomPopup from "../Modals/CustomPopup";

const Cathlab = () => {

  
  
    const [subCatData, SetSubCatData]= useState([]);
    const empcode = sessionStorage.getItem('empcode')
    const role = sessionStorage.getItem("role")
    const designation = sessionStorage.getItem("designation")
    
    const [myCampDetails,setMyCampDetails] = useState([]);

    const [subCatId, setSubCatId] = useState("");
  
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");

    const [reportNumberWise,setReportNumberWise] = useState([])

    const [allReportData, setAllReportData]= useState([]);
    const [loading,setLoading] = useState(false)
    const [openActionId, setOpenActionId] = useState(null);
    const [show,setShow]= useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
const [selectedCrid, setSelectedCrid] = useState(null);
    const [myCampType,setMyCampType] = useState([]);
    // const [popup, setPopup] = useState({ show: false, type: "", message: "" });
const [popup, setPopup] = useState("");

useEffect(() => {
  if (popup) {
    alert(popup); // ✅ show alert on close
    setPopup(""); // reset after showing
  }
}, [popup]);

    const [filters, setFilters] = useState({
      empcode: empcode,         // you will probably get this from logged-in user
      searchKeyword: "",
      fromDate: "",
      toDate: "",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

 

  const getApprovalStatus = (e) => {
    // if any is Reconsider → show Reconsider
    if (e.camp_type !== "Cathlab") {
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


  const handleOpenModal = (action, crid) => {
  setSelectedAction(action);
  setSelectedCrid(crid);
  setShow(true);
};
   const handleCloseModal = () => {
  setShow(false);
  setSelectedAction(null);
  setSelectedCrid(null);
};


  useEffect(() => {
    if (filters.searchKeyword) {
      let timer = setTimeout(() => {
        getMyCampDetailsByEmpcode();
        GetDetiledData();
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
    GetSubCatInfo();
    GetDetiledData();
    getMyCampDetailsByEmpcode();
    getMyCampsType();

  }, [filters])
   

  useEffect(()=>{
    getNumberWiseReport()
  },[subCatId])

      const getMyCampsType = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${BASEURL2}/basic/getAbmCampType`)
        setMyCampType(res.data.data)
        console.log("res.data.data", res.data)
      } catch (error) {
        console.log(error)
      }
      finally {
        setLoading(false);
      }
    }


 
  const handelSearchDate = ()=>{
    if(sDate && eDate){
      getNumberWiseReport()
    }
    else{
      alert("Please Select Date")
    }
  }

   

    async function getNumberWiseReport(){
     setLoading(true)
      
      try {
        let res
        if(!subCatId){
          res = await axios.post(`${BASEURL}/admin/getReportNumberWise?startDate=${sDate}&endDate=${eDate}&subCatId=${0}&empcode=${empcode}`)

        }else{

          res = await axios.post(`${BASEURL}/admin/getReportNumberWise?startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&empcode=${empcode}`)
        }
        console.log("REsponse : ",res)
        setReportNumberWise(res.data.data)
      } catch (error) {
        console.log(error)
      }
      finally{
        setLoading(false);
      }
    }

    const getMyCampDetailsByEmpcode = async()=>{
     setLoading(true)

     const payload = {
      empcode: filters.empcode,
      searchKeyword: filters.searchKeyword.trim() || null,
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
    };

      try {
        const res = await axios.post(`${BASEURL2}/admin/getCathlabReportByEmpcode`,payload)
        setMyCampDetails(res.data.data)
      } catch (error) {
        console.log(error)
      }finally{
        setLoading(false);
      }
    }


    async function GetSubCatInfo(){
        try {
            const res = await axios.get(`${BASEURL}/admin/subCatInfo`);
            SetSubCatData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }


  async function GetDetiledData() {
   const payload = {
        empcode: filters.empcode,
        searchKeyword: filters.searchKeyword.trim() || null,
        fromDate: filters.fromDate || null,
        toDate: filters.toDate || null,
      };
    try {
      const res = await axios.post(`${BASEURL2}/admin/getCathlabSheetReport`, payload);
      console.log("empanorm sheet", res.data.data,)
      setAllReportData(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }




   
    
  const handelReportDownloadDetailed = () => {
    const headers = [
      'Rank',
      'ABM Name',
      'Employee ID',
      'Region',
      'Area',
      'Zone',
      'HQ',
      'Doctor Name',
      'Doctor Speciality',
      'Doctor Garnet Code',
      'Is Ticavic',
      'TSARTTrio',
      'TSARTAM',
      'TSARTMCL',
      'TSART',
      'Jupiros',
      'JupirosGold',
      'JupirosF',
      'JupirosCV',
      'Ticavic',
      'Apixapil',
      'JupiorosCv20',
      'Bisokem',
      'Bisokem AM',
      'Empanorm',
      'Empanorm Duo',
      'Empanorm L',
      'Empanorm M',
      'Jupiros EZ',
      'Empanorm 25 mg',
      'Empanorm Trio',
      'Others',
      'Camp / Meeting Type',
      'Status',
      'Date of Camp',
      'No. of Camps',
      'Patient Screened / Number of Attendees',
      // 'Hypertension Kit Utilized',
      'Doctor Names',
      'Hospital Name',
      'Current Business',
      'Expected Business',
      'Number of PAX',
      'Number of Angioplasty',
      'Total Ticagrelor Potential'
    ];

    const mappedData = allReportData.map(item => ({
      'Rank': item.rank || item.level || '',
      'ABM Name': item.ABM_Name || item.employee_name || item.username || '',
      'Employee ID': item.Employee_ID || item.employee_empcode || item.empcode || '',
      'Region': item.Region || item.employee_region || item.region || '',
      'Area': item.Area || item.employee_area || item.area || '',
      'Zone': item.Zone || item.employee_zone || item.zone || '',
      'HQ': item.HQ || item.employee_hq || item.hq || '',

      'Doctor Name': item.Doctor_Name || item.doctor_name || '',
      'Doctor Speciality': item.Doctor_Speciality || item.speciality || '',
      'Doctor Garnet Code': item.Doctor_Garnet_Code || item.garnet_code || '',

      'Is Ticavic': item.Is_Ticavic=== "Y"?"Yes":"No" ?? item.is_ticavic_avl=== "Y"?"Yes":"No"  ?? item.is_ticavic=== "Y"?"Yes":"No"  ?? '',

      // brand counts (map to procedure aliases, with fallbacks)
      'TSARTTrio': item.TSARTTrio_count || item.TSARTTrio || 0,
      'TSARTAM': item.TSARTAM_count || item.TSARTAM || 0,
      'TSARTMCL': item.TSARTMCL_count || item.TSARTMCL || 0,
      'TSART': item.TSART_count || item.TSART || 0,
      'Jupiros': item.Jupiros_count || item.Jupiros || 0,
      'JupirosGold': item.JupirosGold_count || item.JupirosGold || 0,
      'JupirosF': item.JupirosF_count || item.JupirosF || 0,
      'JupirosCV': item.JupirosCV_count || item.JupirosCV || 0,
      'Ticavic': item.Ticavic_count || item.Ticavic || 0,
      'Apixapil': item.Apixapil_count || item.Apixapil || 0,
      // note: header spells 'JupiorosCv20', procedure used JupirosCV20_count — try both
      'JupiorosCv20': item.JupirosCV20_count || item.JupiorosCv20 || item.JupirosCV20 || 0,

      'Bisokem': item.Bisokem_count || item.Bisokem || 0,
      'Bisokem AM': item.BisokemAM_count || item.BisokemAM || 0,
      'Empanorm': item.Empanorm_count || item.Empanorm || 0,
      'Empanorm Duo': item.EmpanormDuo_count || item.EmpanormDuo || 0,
      'Empanorm L': item.EmpanormL_count || item.EmpanormL || 0,
      'Empanorm M': item.EmpanormM_count || item.EmpanormM || 0,
      'Jupiros EZ': item.JupirosEZ_count || item.JupirosEZ || 0,
      'Empanorm 25 mg': item.Empanorm25mg_count || item.Empanorm25mg || 0,
      'Empanorm Trio': item.EmpanormTrio_count || item.EmpanormTrio || 0,
      'Others': item.Others_count || item.Others || 0,

      'Camp / Meeting Type': item.Camp_Meeting_Type || item.camp_type || item.camp_name || '',
      'Status': item.Status === "Y"?"executed":"not executed",
      'Date of Camp': item.Date_of_Camp || item.camp_date || '',
      'No. of Camps': item.No_of_Camps != null ? item.No_of_Camps : (item.no_of_camps || 1),

      'Patient Screened / Number of Attendees': item.Patient_Screened_Number_of_Attendees || item.patient_screened || item.attendees || 0,
      // 'Hypertension Kit Utilized': item.Hypertension_Kit_Utilized || item.no_of_kits_utilised || 0,

      'Doctor Names': item.Doctor_Names || item.Doctor_Name || item.doctor_name || '',
      'Hospital Name': item.Hospital_Name || item.hospital_name || '',
      'Current Business': item.Current_Business || item.current_business || '',
      'Expected Business': item.Expected_Business || item.expected_business || '',
      'Number of PAX': item.Number_of_PAX || item.pax_count || 0,
      'Number of Angioplasty': item.Number_of_Angioplasty || item.angioplasty_count || 0,
      'Total Ticagrelor Potential': item.Total_Ticagrelor_Potential || item.total_ticagrelor_potential || 0
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cathlab');
    XLSX.writeFile(wb, 'CathlabReport.xlsx');
  };





       const handelReportDownloadNumberWise =()=>{
        const headers = [
          'Employee Code',
          'Employee Name',
          'Total Camps',
          'Total Doctor',
          'Patient Screened',
          'Patient Diagnosed',
          'Prescription Generated',
         
        ];

        
    
        // Map the data to match the custom column headers
        const mappedData = reportNumberWise.map(item => ({
          'Employee Code': item.empcode,
          'Employee Name': item.name,
          'Total Camps': item.TotalCampCount,
          'Total Doctor': item.TotalDoctorCount,
          'Patient Screened': item.TotalPatientScaneed,
          'Patient Diagnosed': item.TotalPatientDiagnosed,
          'Prescription Generated':item.TotalPrescribe,
        }));
    
        const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'CampReportDataHierarchy.xlsx');
       }
  
      
       const handleApproval = async(action,crid)=>{
        try {
          const res = await axios.post(`${BASEURL2}/admin/approveCathlabRequest`,{
            designation,role,crid,action
          });
          console.log("handleApproval",res.data)
          if(Number(res.data.errorCode) === 1){
            // alert("Camp Updated successfully")
            getMyCampDetailsByEmpcode();
          }

        } catch (error) {
          console.log(error)
        }
       }

  const handleDisableBtn = (e) => {
    if ((e.approved_by_admin === "Approved" || (e.approved_by_rm === "Approved" && e.approved_by_dsm === "Approved" && e.approved_by_nsm === "Approved"))) {
      return true;
    }
    else if (Number(role) === 3 && e.approved_by_rm === "Approved") {
      return true;
    } else if (Number(role) === 2 && e.approved_by_dsm === "Approved") {
      return true;
    } else if (Number(role) === 1 && e.approved_by_nsm === "Approved") {
      return true;
    }

    if (Number(role) === 2 && e.approved_by_rm !== "Approved"){
      return true;
    }
    if(Number(role) ===1 && e.approved_by_dsm!== "Approved"){
      return true;
    }

  }
   
  return  loading ? <Loader/> : (<>
    <div className="container-fluid">
    {/* Content Row */}
       
   
    <div className="d-sm-flex align-items-start justify-content-end mb-4">

        <div className="form-group ml-2">
          <label htmlFor="searchKeyword" >Doctor Name:</label>
          <input
            type="text"
            className="form-control"
            id="searchKeyword"
            name="searchKeyword"
            placeholder="Search by Doctor Name"
            value={filters.searchKeyword}
            onChange={handleChange}
          />
        </div>

        {/* <div className="dropdown ml-2">

          <select
            className="form-control selectStyle selecCamp"
            name="campType"
            id="campType"
            value={filters.campType}
            onChange={handleChange}
          >
            <option value="">Select Camp</option>
            {myCampType && myCampType.map((e) => (
              <option key={e.basic_id} value={e.description}>
                {e.description}
              </option>
            ))}
          </select>

        </div> */}

        <div className="form-group ml-2">
          <label htmlFor="fromDate">From Date:</label>
          <input
            type="date"
            className="form-control"
            id="fromDate"
            name="fromDate"   // ✅ added
            placeholder="Select From Date"
            value={filters.fromDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group ml-2">
          <label htmlFor="toDate">To Date:</label>
          <input
            type="date"
            className="form-control"
            id="toDate"
            name="toDate"    // ✅ added
            placeholder="Select To Date"
            value={filters.toDate}
            onChange={handleChange}
          />
        </div>

      </div>
    {/* Content Row */}
    <div className="card shadow mb-4">
        <div className="card-header py-3">

                {/* <button onClick={handelReportDownloadNumberWise} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm">
                <i className="fas fa-download fa-sm text-white-50"></i>Report Hierarchy</button> */}
            <button onClick={handelReportDownloadDetailed} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Report</button>
        </div>
        
        <div className="card-body">
            <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Doctor Name</th>
                            <th>Doctor Speciality</th>
                            <th>Doctor Garnet Code</th>
                            <th>Approval Status</th>
                            <th>Remark by RM</th>
                            <th>Remark by DSM</th>
                            <th>Remark by NSM</th>
                            <th>Action</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {/* Repeat this row structure for each table row */}
                        {myCampDetails && myCampDetails
                        // .filter(e => e.name !== "Admin")
                        .map((e)=>{
                            return(
                           <tr key={e.crid}>
                            <td>{e.employee_name}</td>
                            <td>{e.doctor_name}</td>
                            <td>{e.speciality}</td>
                            <td>{e.garnet_code}</td>
                            <td>{getApprovalStatus(e)}</td>
                            <td>{e.comment_by_rm}</td>
                            <td>{e.comment_by_dsm}</td>
                            <td>{e.comment_by_nsm}</td>

                                <td>
                                  <div className="action-wrapper">
                                    <button
                                      className="btn btn-sm btn-primary btn-circle border-0"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenActionId(prev => (prev === e.crid ? null : e.crid));
                                      }}
                                      disabled={Number(role) === 4 || handleDisableBtn(e)}
                                      title={Number(role) !== 4 && getApprovalStatus(e) === "Approved" ? "Already approved" : "Actions"}
                                    >
                                      <BsThreeDotsVertical />
                                    </button>

                                    {openActionId === e.crid && (
                                      <div className="action-dropdown">
                                        { (
                                          <button
                                            className="dropdown-item text-success"
                                            onClick={() => {
                                              // handleApproval(1,e.crid)
                                              setOpenActionId(null);
                                              handleOpenModal(1, e.crid);
                                            }}
                                          >
                                            Approve
                                          </button>
                                        )}
                                        { (
                                          <button
                                            className="dropdown-item text-danger"
                                            onClick={() => {
                                              // handleApproval(2,e.crid)
                                              setOpenActionId(null);
                                             handleOpenModal(2, e.crid);

                                            }}
                                          >
                                            Reject
                                          </button>
                                        )}
                                         { (
                                          <button
                                            className="dropdown-item text-warning"
                                            onClick={() => {
                                              // handleApproval(3,e.crid)
                                              setOpenActionId(null);
                                              handleOpenModal(3, e.crid);
                                            }}
                                          >
                                            Reconsider
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                     {Number(empcode) !== 10000 && selectedCrid && selectedAction && (
  <CathlabComment
    crid={selectedCrid}
    actionType={selectedAction}
    campReportList={myCampDetails}
    show={show}
    handelCloseModal={handleCloseModal}
    getMyCampDetailsByEmpcode={getMyCampDetailsByEmpcode}
    setPopup={setPopup}   
  />
)}


                           
                        </tr>
                            )
                        })}
                        
                        {/* Repeat this row structure for each table row */}
                    </tbody>
                </table>
               {popup.show && (
  <CustomPopup
    type={popup.type}
    message={popup.message}
    onClose={() => setPopup({ show: false, type: "", message: "" })}
  />
)}
            </div>
        </div>
    </div>
</div>                 
  </>)
}

export default Cathlab