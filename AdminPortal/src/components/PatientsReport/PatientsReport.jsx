
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./PatientsReport.css"
import Loader from "../utils/Loader";

const PatientsReport = () => {

  
  
    const [subCatData, SetSubCatData]= useState([]);
    const [subCatId, setSubCatId] = useState("");
  
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");


    const [patientsList, setAllPatientsList]= useState([]);
    const [loading,setLoading] = useState(false)
    const empcode = sessionStorage.getItem('empcode')

    console.log(sDate,eDate)

    useEffect(()=>{
        
        GetSubCatInfo();
        GetPatientsData()
    },[])


     useEffect(()=>{
        GetPatientsData()
    },[subCatId, sDate, eDate])
   

 




   

   


    async function GetSubCatInfo(){
        try {
            const res = await axios.get(`${BASEURL}/admin/subCatInfo`);
            SetSubCatData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetPatientsData(){
      try {
          const res = await axios.post(`${BASEURL}/admin/getPatientsList`,{
            catId :subCatId, 
            startDate : sDate, 
            endDate:eDate,
            empcode:empcode

          });
          setAllPatientsList(res.data.data)
      } catch (error) {
         console.log(error) 
      }
  }


   
    
    const handelReportDownloadDetailed = ()=>{
        // Define custom column headers
        const headers = [
                          'Employee Name',
                        //   'Patients Name',
                          'Age',
                          'Gender',
                          'SBP',
                          'DBP',
                          'Hypertensive',
                          'TC',
                          'TG',
                          'HDL',
                          'LDL',
                          'HDL/LDL',
                          'Non HDL'
                        ];
          
      
          const mappedData = patientsList.map(item => ({
                      'Employee Name': item.empname,
                    //   'Patients Name': item.name,
                      'Age': item.age,
                      'Gender': item.gender,
                      'SBP': item.sbp,
                      'DBP': item.dbp,
                      'Hypertensive': item.isHypertensive,
                      'TC': item.tc,
                      'TG': item.tg,
                      'HDL': item.hdl,
                      'LDL': item.ldl,
                      'HDL/LDL': item.ldlhdl,
                      'Non HDL': item.nonhdl
                    }));
      
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, 'PatientsDetails.xlsx');
        
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
            {e.subcategory_name}
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


    </div>
    {/* Content Row */}
    <div className="card shadow mb-4">
        <div className="card-header py-3">

               
            <button onClick={handelReportDownloadDetailed} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Report</button>
        </div>
        
        <div className="card-body">
            <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            {/* <th>Patients Name</th> */}
                            <th>Age</th>
                            <th>Gender</th>
                            <th>SBP</th>
                            <th>DBP</th>
                            <th>Hypertensive</th>
                            <th>TC</th>
                            <th>TG</th>
                            <th>HDL</th>
                            <th>LDL</th>
                            <th>HDL/LDL</th>
                            <th>Non HDL</th>
                        </tr>
                    </thead>

                    <tbody>
                        
                        {patientsList && patientsList.map((e)=>{
                            return(
                           <tr key={e.pa_id}>
                            <td>{e.empname}</td>
                            {/* <td>{e.name}</td> */}
                            <td>{e.age}</td>
                            <td>{e.gender}</td>
                            <td>{e.sbp}</td>
                            <td>{e.dbp}</td>
                            <td>{e.isHypertensive}</td>
                            <td>{e.tc}</td>
                            <td>{e.tg}</td>
                            <td>{e.hdl}</td>
                            <td>{e.ldl}</td>
                           <td>{e.ldlhdl}</td>
                           <td>{e.nonhdl}</td>                          
                        </tr>
                            )
                        })}
                        
                        
                    </tbody>
                </table>
               
            </div>
        </div>
    </div>
</div>
  )
}

export default PatientsReport