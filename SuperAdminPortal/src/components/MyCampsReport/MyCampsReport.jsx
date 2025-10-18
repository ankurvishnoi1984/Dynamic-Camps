
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL, BASEURL2 } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./MyCampsReport.css"
import Loader from "../utils/Loader";

const SummaryReport = () => {

  
  
    const [subCatData, SetSubCatData]= useState([]);
    const empcode = sessionStorage.getItem('empcode')
    
    const [myCampDetails,setMyCampDetails] = useState([]);

    const [subCatId, setSubCatId] = useState("");
  
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");

    const [reportNumberWise,setReportNumberWise] = useState([])

    const [allReportData, setAllReportData]= useState([]);
    const [loading,setLoading] = useState(false)
    const [myCampType,setMyCampType] = useState([]);

    const [filters, setFilters] = useState({
      empcode: empcode,         // you will probably get this from logged-in user
      searchKeyword: "",
      fromDate: "",
      toDate: "",
      campType: ""
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

    useEffect(()=>{
        if (filters.searchKeyword){
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
    
    },[filters])

   

  useEffect(()=>{
    getNumberWiseReport()
  },[subCatId])

  console.log("filters : ",filters)
 
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
      campType: filters.campType || null
    };

      try {
        const res = await axios.post(`${BASEURL2}/admin/getMyCampDetailsByEmpcode`,payload)
        setMyCampDetails(res.data.data)
      } catch (error) {
        console.log(error)
      }finally{
        setLoading(false);
      }
    }

    const getMyCampsType = async()=>{
       setLoading(true)
      try {
         const res = await axios.get(`${BASEURL2}/basic/getAllMyCampType`)
        setMyCampType(res.data.data)
        console.log("res.data.data",res.data)
      } catch (error) {
        console.log(error)
      }
      finally{
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

    async function GetDetiledData(){
       const payload = {
      empcode: filters.empcode,
      searchKeyword: filters.searchKeyword.trim() || null,
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
      campType: filters.campType || null
    };
      try {
          const res = await axios.post(`${BASEURL2}/admin/getMyCampsSheetReport`,payload);
          console.log("empanorm sheet",res.data.data,)
          setAllReportData(res.data.data)
      } catch (error) {
         console.log(error) 
      }
  }


   

  const handelReportDownloadDetailed = () => {
    const headers = [
      'Rank',
      'BO Name',
      'Employee ID',
      'Region', 'Area',
      'Zone',
      'HQ',
      'Doctor Name',
      'Doctor Speciality'
      , 'Doctor Garnet Code',
      'Is RPS',
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

      'Camp Type',
      'Is Bcc Distributed',
      'Status',
      'Date of Camp',
      'No. of Camps',
      'Patient Screened',
      'Hypertension Kit Utilized',
      'Jupiros Diet Care Kit Utilized',
      'Glucometer Kits'
    ];

    const mappedData = allReportData.map(item => ({
      'Rank': item.Rank || item.rank || '',
      'BO Name': item.BO_Name || item.employee_name || '',
      'Employee ID': item.Employee_ID || item.empcode || '',
      'Region': item.Region || item.region || '',
      'Area': item.Area || item.area || '',
      'Zone': item.Zone || item.zone || '',
      'HQ': item.HQ || item.hq || '',

      'Doctor Name': item.Doctor_Name || item.doctor_name || '',
      'Doctor Speciality': item.Doctor_Speciality || item.speciality || '',
      'Doctor Garnet Code': item.Doctor_Garnet_Code || item.garnet_code || '',

      'Is RPS': item.Is_RPS === "N" ? "Non RPS" : "RPS",

      'TSARTTrio': item.TSARTTrio_count || 0,
      'TSARTAM': item.TSARTAM_count || 0,
      'TSARTMCL': item.TSARTMCL_count || 0,
      'TSART': item.TSART_count || 0,
      'Jupiros': item.Jupiros_count || 0,
      'JupirosGold': item.JupirosGold_count || 0,
      'JupirosF': item.JupirosF_count || 0,
      'JupirosCV': item.JupirosCV_count || 0,
      'Ticavic': item.Ticavic_count || 0,
      'Apixapil': item.Apixapil_count || 0,
      'JupiorosCv20': item.JupirosCV20_count || 0,
      'Bisokem': item.Bisokem_count || 0,
      'Bisokem AM': item.BisokemAM_count || 0,
      'Empanorm': item.Empanorm_count || 0,
      'Empanorm Duo': item.EmpanormDuo_count || 0,
      'Empanorm L': item.EmpanormL_count || 0,
      'Empanorm M': item.EmpanormM_count || 0,
      'Jupiros EZ': item.JupirosEZ_count || 0,
      'Empanorm 25 mg': item.Empanorm25mg_count || 0,
      'Empanorm Trio': item.EmpanormTrio_count || 0,
      'Others': item.Others_count || 0,

      'Camp Type': item.Camp_Type || item.camp_type || '',
      'Is Bcc Distributed': item.Camp_Type === "Bcc Distribution"
        ? (item.is_bcc1_distributed === "Y" ? "Yes" : "No")
        : '',
      'Status': item.Status === "Y" ? "executed" : "not executed",
      'Date of Camp': item.Date_of_Camp || item.camp_date || '',
      'No. of Camps': item.No_of_Camps || 1,
      'Patient Screened': item.Patient_Screened || item.patient_screened || 0,
      'Hypertension Kit Utilized': item.Camp_Type === "Hypertension" ? item.Hypertension_Kit_Utilized : 0,
      'Jupiros Diet Care Kit Utilized': item.Camp_Type === "Lipid" ? item.Jupiros_Diet_Care_Kit_Utilized : 0,
      'Glucometer Kits': item.Camp_Type === "Diabetes Detection" ? item.Glucometer_Kits : 0,
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CampsReport');
    XLSX.writeFile(wb, 'CampsReport.xlsx');
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
  
       const handelSingalReportDownload = (empcode)=>{
        // Define custom column headers
      
        const filterData = reportNumberWise.filter((e)=>{
            return e.empcode===empcode
          })
        const headers = [
            'Employee Code',
            'Employee Name',
            'Total Camps',
            'Total Doctor',
            'Patient Screened',
            'Patient Diagnosed',
            'Prescription Generated'
          ];

          
           //console.log("filterdata",filterData)
          // Map the data to match the custom column headers
          const mappedData = filterData.map(item => ({
          'Employee Code': item.empcode,
          'Employee Name': item.name,
          'Total Camps': item.TotalCampCount,
          'Total Doctor': item.TotalDoctorCount,
          'Patient Screened': item.TotalPatientScaneed,
          'Patient Diagnosed': item.TotalPatientDiagnosed,
          'Prescription Generated':item.TotalPrescribe,
          }));
          
          //console.log(mappedData);
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'employee');
          XLSX.writeFile(wb, 'employee.xlsx');
        
       }  
   
  return  loading ? <Loader/> : (
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

      <div className="dropdown ml-2">
      
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

        </div>
    
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
                            <th>Camp Name</th>
                            <th>Status</th>
                            {/* <th>Action</th> */}
                            
                        </tr>
                    </thead>
                    {console.log("Mycamps data",myCampDetails)}
                    <tbody>
                        {/* Repeat this row structure for each table row */}
                        {myCampDetails && myCampDetails
                        .filter(e => e.name !== "Admin")
                        .map((e)=>{
                            return(
                           <tr key={e.empcode}>
                            <td>{e.employee_name}</td>
                            <td>{e.doctor_name}</td>
                            <td>{e.speciality}</td>
                            <td>{e.garnet_code}</td>
                            <td>{e.camp_type}</td>
                            <td>{e.is_executed === "N" ? "Planned":"Executed"}</td>

                            {/* <td><button onClick ={()=>handelSingalReportDownload(e.empcode)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td> */}
                           
                        </tr>
                            )
                        })}
                        
                        {/* Repeat this row structure for each table row */}
                    </tbody>
                </table>
                {/* <div
                   className="textdiv"
                  >
                    <div>
                      {" "}
                      Showing {startingEntry} to {endingEntry} of {reportData && pagelength}{" "}
                      entries
                    </div>
                    <div className="resdiv">
                      <button className="btn btn-light pag-but" onClick={handelPrevious}>
                        Previous
                      </button>
                      <button className="btn btn-light pag-but pag-but-bg">
                        {currentPage}
                      </button>
                      <button className="btn btn-light pag-but" onClick={handelNext}>
                        Next
                      </button>
                    </div>
                  </div> */}
            </div>
        </div>
    </div>
</div>
  )
}

export default SummaryReport