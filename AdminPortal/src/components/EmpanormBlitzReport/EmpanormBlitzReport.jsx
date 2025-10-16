
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL, BASEURL2 } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./Empanorm.css"
import Loader from "../utils/Loader";

const EmpanormBlitzReport = () => {

  
  
    const [subCatData, SetSubCatData]= useState([]);
    const empcode = sessionStorage.getItem('empcode')
    
    const [myCampDetails,setMyCampDetails] = useState([]);

    const [subCatId, setSubCatId] = useState("");
  
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");

    const [reportNumberWise,setReportNumberWise] = useState([])

    const [allReportData, setAllReportData]= useState([]);
    const [loading,setLoading] = useState(false)

    console.log(sDate,eDate)

    useEffect(()=>{
        
        GetSubCatInfo();
        GetDetiledData();
        getMyCampDetailsByEmpcode();
    
    },[])
   

  useEffect(()=>{
    getNumberWiseReport()
  },[subCatId])


 
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

      try {
        const res = await axios.post(`${BASEURL2}/admin/getEmpanormBlitzDetailsByEmpcode`,{
          empcode:empcode,
          searchKeyword:"",
          campType:""
        })
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

    async function GetDetiledData(){
      const params = {
        empcode:empcode,
          searchKeyword:"",
      }
      try {
          const res = await axios.post(`${BASEURL2}/admin/getEmpanormSheetReport`,params);
          console.log("empanorm sheet",res.data.data,)
          setAllReportData(res.data.data)
      } catch (error) {
         console.log(error) 
      }
  }



   
    
  const handelReportDownloadDetailed = () => {
    // 1️⃣ Define your new headers to match the backend pivot columns:
    const headers = [
      'Employee Name',
      'Employee HQ',
      'Employee Area',
      'Employee Region',
      'Employee Zone',
      'Doctor Name',
      'Doctor Code',
      'Camp Name',
      'No. of Kits Given',
      'Camp Date',
      // brand columns
      'Bisokem',
      'Empanorm',
      'Empanorm25mg',
      'EmpanormDuo',
      'EmpanormL',
      'EmpanormM',
      'EmpanormTrio',
      'Jupiros',
      'JupirosF',
      'JupirosGold',
      'NA',
      'Others',
      'TSART',
      'TSARTAM',
      'TSARTMCL',
      'TSARTTrio'
    ];

    // 2️⃣ Map backend fields to those headers:
    const mappedData = allReportData.map(item => ({
      'Employee Name': item.employee_name || '',
      'Employee HQ': item.employee_hq || item.hq || '',
      'Employee Area': item.employee_area || item.area || '',
      'Employee Region': item.employee_region || item.region || '',
      'Employee Zone': item.employee_zone || item.zone || '',
      'Doctor Name': item.doctor_name || '',
      'Doctor Code': item.garnet_code || item.doctor_code || '',
      'Camp Name': item.camp_type || item.camp_name || '',
      'No. of Kits Given': item.no_of_kits_given || 0,
      'Camp Date': item.camp_date || '',

      // brand counts from backend procedure
      'Bisokem': item.Bisokem_count || 0,
      'Empanorm': item.Empanorm_count || 0,
      'Empanorm25mg': item.Empanorm25mg_count || 0,
      'EmpanormDuo': item.EmpanormDuo_count || 0,
      'EmpanormL': item.EmpanormL_count || 0,
      'EmpanormM': item.EmpanormM_count || 0,
      'EmpanormTrio': item.EmpanormTrio_count || 0,
      'Jupiros': item.Jupiros_count || 0,
      'JupirosF': item.JupirosF_count || 0,
      'JupirosGold': item.JupirosGold_count || 0,
      'NA': item.NA_count || 0,
      'Others': item.Others_count || 0,
      'TSART': item.TSART_count || 0,
      'TSARTAM': item.TSARTAM_count || 0,
      'TSARTMCL': item.TSARTMCL_count || 0,
      'TSARTTrio': item.TSARTTrio_count || 0
    }));

    // 3️⃣ Build and download XLSX:
    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'EmpanormReport.xlsx');
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
    <div className="dropdown ml-2">
    <select className="form-control selectStyle selecCamp" name="cat" id="cat" value={subCatId} onChange={(e)=>{
     setSubCatId(e.target.value)
    }}>
        <option value="">Select Camp</option>   
         {subCatData && subCatData.map((e) => (
        <option
            key={e.subcat_id}
            value={e.subcat_id}
        >
            {e.subcategory_name} Camp
        </option>
        ))}
      </select>
        </div>
    
         <div className="form-group ml-2">
            <label htmlFor="fromDate">From Date:</label>
            <input type="date" className="form-control" id="fromDate" placeholder="Select From Date" value={sDate} onChange={(e)=>setSDate(e.target.value)}/>
        </div>

        {/* Datepicker for "To" date */}
        <div className="form-group ml-2">
            <label htmlFor="toDate">To Date:</label>
            <input type="date" className="form-control" id="toDate" placeholder="Select To Date" value={eDate} onChange={(e)=>setEDate(e.target.value)}/>
        </div>

        <button className="btn btn-primary btn-icon-split" style={{marginTop:"30px", marginLeft:"5px"}} onClick={handelSearchDate}>
                                <span className="text">Search</span>
                                <span className="icon text-white-60">
                                    <i className="fas fa-search fa-sm"></i>
                                </span>
                            </button>

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
                            {/* <th>Status</th> */}
                            <th>Action</th>
                            
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
                            {/* <td>{e.is_executed === "N" ? "Planned":"Executed"}</td> */}

                            <td><button onClick ={()=>handelSingalReportDownload(e.empcode)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                           
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

export default EmpanormBlitzReport