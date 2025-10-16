
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./report.css"
import Loader from "../utils/Loader";
import FileSaver from "file-saver";
import JSZip from "jszip";
const Report = () => {

    const [reportData,SetReportData] = useState([]);
    const [downloadreport,setDownloadReport]= useState([])
    const [subCatData, SetSubCatData]= useState([]);
    const [topLineData, SetTopLineData]= useState([]);
    const empLoggedIn = sessionStorage.getItem('empcode')
    const IsAdminLoggedIn = sessionStorage.getItem('IsAdminLoggedIn')
    const [repo, setRepo] = useState(IsAdminLoggedIn==="true"?"10000000":empLoggedIn);
    const loggedInRole = sessionStorage.getItem('role')
    
    const [topLine,SetTopLine] = useState("")
    const [fifthline,SetFifthLine] = useState([])
    const [fourthLine,SetFourthLine] = useState("")
    const [getFourthline,SetgetFourthline] = useState([])
    const [thirdLine,SetThirdLine] = useState("")
    const [getThirdline,SetgetThirdline] = useState([])
    const [secondLine,SetSecondLine] = useState("")
    const [getSecondline,SetgetSecondline] = useState([])

    const [firstLine,SetFirstLine] = useState("")
    const [getFirstline,SetgetFirstline] = useState([])

    const [zeroLine,SetZeroLine] = useState("")
    const [getZeroline,SetgetZeroline] = useState([])
    const [searchQuery, setSearchQuery] = useState('');

    const [subCatId, setSubCatId] = useState("");
    const [rqid1 , setRqid1] = useState("");
    const [rqid2, setRqid2] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagelength,setPageLength] = useState(0)

    const [filter,setFilter] = useState("");
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");

    const [fromTop, setFromTop]= useState([])
    

   
    const [loading,setLoading] = useState(false)


    const handelNext = () => {
        if (currentPage * entriesPerPage < pagelength) {
          setCurrentPage((prev) => prev + 1);
        }
      };
      const handelPrevious = () => {
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      };
     
      const handleSearchChange = event => {
        setSearchQuery(event.target.value);
        setCurrentPage(1)
      };
      
  const entriesPerPage = 20;
  const startingEntry = (currentPage - 1) * entriesPerPage + 1;
  //const endingEntry = 20;
  //const endingEntry = Math.min(startingEntry + entriesPerPage - 1, emplength);
  const endingEntry = Math.min(startingEntry + entriesPerPage - 1, pagelength);

    useEffect(()=>{
        //GetReportData();
        GetSubCatInfo();
        if (IsAdminLoggedIn === "false"){
          GetFifthLine(empLoggedIn)
        }
        GetTopLine();
    },[])
    useEffect(()=>{
        GetReportData();
        // GetDownloadReportData();
    },[repo,subCatId,currentPage,searchQuery,filter])

    useEffect(()=>{
      // GetReportData();
      GetDownloadReportData();
  },[repo,subCatId,filter])


  useEffect(()=>{
    // GetReportData();
    getRepotFromTop()
  
},[repo,subCatId])
 


  // for zip download 
  const handelSearchDate = ()=>{
    if(!filter && sDate && eDate){
      GetDownloadReportData();
      GetReportData();
      getRepotFromTop();
      
    }else if(filter){
      alert("Please Unselect Filter Month/Week Wise")
    }
    else{
      alert("Please Select Date")
    }
  }

  const handelDownloadZip = async (userId)=>{
    const imagData = await getDownloadImageData(userId)

    const zip = new JSZip();

    // Loop through the employee data
    for (const employee of imagData) {
      const { doctor_name,camp_date, images } = employee;

      const employeeFolder = zip.folder(`${doctor_name}_${camp_date}`);

      // Add doctor posters to the employee folder
      for (let i = 0; i < images.length; i++) {
        try {
          const response = await fetch(`${BASEURL}/uploads/report/${images[i].imgpath}`);
          const blob = await response.blob();
          employeeFolder.file(`image_${i + 1}.jpg`, blob, { binary: true });
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    }

    // Generate the zip file
    zip.generateAsync({ type: "blob" }).then((content) => {
      // Save the zip file
      FileSaver.saveAs(content, "camp_images.zip");
    });

  }

  async function getDownloadImageData(userId){
    try {
       
      const res = await axios.get(`${BASEURL}/admin/imageDownload/${userId}`);
      return res.data;
    } catch (error) {
      console.log(error)
    }
  }

  // for FromTopLine 
  async function getRepotFromTop(){
    try {
      let res
      if(repo && !subCatId){
        res = await axios.post(`${BASEURL}/admin/getReportFromTop?empcode=${repo}&startDate=${sDate}&endDate=${eDate}&subCatId=${0}`)

      }else if(repo){

        res = await axios.post(`${BASEURL}/admin/getReportFromTop?empcode=${repo}&startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}`)
      }
      // Might need to change 
      // else{
      //   setFromTop('')
      //   return;
      // }

      setFromTop(res.data[0])
    } catch (error) {
      console.log(error)
    }
  }

    async function GetReportData(){
        try {
            
            let res;
             if(filter && subCatId){
                
             res = await axios.get(`${BASEURL}/admin/getReport?&filter=${filter}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
            else if(sDate && eDate && subCatId){
                
             res = await axios.get(`${BASEURL}/admin/getReport?startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
            else if(sDate && eDate){
                
             res = await axios.get(`${BASEURL}/admin/getReport?startDate=${sDate}&endDate=${eDate}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
             else if(subCatId){

             res = await axios.get(`${BASEURL}/admin/getReportNormal?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);
            }
            else if(filter){
                res = await axios.get(`${BASEURL}/admin/getReport?&filter=${filter}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);
   
               }
            else{

               res = await axios.get(`${BASEURL}/admin/getReportNormal?empcode=${repo}&page=${currentPage}&limit=20&searchName=${searchQuery}`);
              
            }

            SetReportData(res.data.reportData)
            setPageLength(res.data.totalRowCount)
        } catch (error) {
           console.log(error) 
        }
    }

  async function GetDownloadReportData() {
    try {
      setLoading(true);

      let res;
      let branch = ""; // track which condition executed


      if (filter && subCatId) {
        branch = "filter + subCatId";
        res = await axios.get(
          `${BASEURL}/admin/downloadReportFilter?&filter=${filter}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}`
        );
      }
      else if (sDate && eDate && subCatId) {
        branch = "sDate + eDate + subCatId";
        res = await axios.get(
          `${BASEURL}/admin/downloadReportFilter?startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}`
        );
      }
      else if (sDate && eDate) {
        branch = "sDate + eDate";
        res = await axios.get(
          `${BASEURL}/admin/downloadReportFilter?startDate=${sDate}&endDate=${eDate}&empcode=${repo}&searchName=${searchQuery}`
        );
      }
      else if (subCatId) {
        branch = "subCatId only";
        res = await axios.get(
          `${BASEURL}/admin/downloadReport?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}&empcode=${repo}&searchName=${searchQuery}`
        );
      }
      else if (filter) {
        branch = "filter only";
        res = await axios.get(
          `${BASEURL}/admin/downloadReportFilter?&filter=${filter}&empcode=${repo}&searchName=${searchQuery}`
        );
      }
      else {
        branch = "default (empcode + searchName)";
        res = await axios.get(
          `${BASEURL}/admin/downloadReport?empcode=${repo}&searchName=${searchQuery}`
        );
      }

      // 🔍 one place to see which branch was taken

      if (res.status === 200) {
        setDownloadReport(res.data);
      } else {
        alert("error in report data fetching please try again");
      }

    } catch (error) {
      console.error(error);
      alert("error in report data fetching please try again");
    } finally {
      setLoading(false);
    }
  }


   
    // async function GetReportDataForCat(subCatId,rqid1,rqid2){
    //     try {
    //         //const res = await axios.get(`${BASEURL}/admin/getReport?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}`);
    //         
    //         SetReportData(res.data)
    //     } catch (error) {
    //     }
    // }

    async function GetSubCatInfo(){
        try {
            const res = await axios.get(`${BASEURL}/admin/subCatInfo`);
            SetSubCatData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetTopLine(){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode:10000000});
            SetTopLineData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetFifthLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetFifthLine(res.data)
        } catch (error) {
           console.log(error) 
        }
    }
    async function GetFourthLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetgetFourthline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetThirdLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetgetThirdline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetSecondLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetgetSecondline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetFirstLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetgetFirstline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetZeroLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            SetgetZeroline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetBottomLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //SetgetZeroline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }
    
    const handelReportDownload = () => {
  // Define custom column headers
  const headers = [
    'Employee Code',
    'Employee Name',
    'Total Camps',
    'Total Doctor',
    'Patient Screened',
    'Patient Diagnosed',
    'Prescription Generated',
    'Role'
  ];

  // ✅ filter unwanted rows first
  const filteredData = downloadreport.filter(item => {
    if (item.emp_name === "Admin") return false;
    if (item.role === "Top Line" && loggedInRole !== "1") return false;
    return true;
  });

  // Map the data to match the custom column headers
  const mappedData = filteredData.map(item => ({
    'Employee Code': item.emp_code,
    'Employee Name': item.emp_name,
    'Total Camps': item.camp_count,
    'Total Doctor': item.doctor_count,
    'Patient Screened': item.screened_count,
    'Patient Diagnosed': item.diagnosed_count,
    'Prescription Generated': item.prescription_count,
    'Role': item.role
  }));

  // Export to Excel
  const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, 'CampReportData.xlsx');
};


       const handelReportDownloadFromTop = ()=>{
        // Define custom column headers
        
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
          const mappedData = fromTop.map(item => ({
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
          XLSX.writeFile(wb, 'CampAllData.xlsx');
        
       }




      
  
       const handelSingalReportDownload = async(id)=>{
       
     const body = {         
      userId: id        
    };

    const response = await axios.post(
      `${BASEURL}/admin/getSingalReportDetailed`,
      body
    );

    const campReportList = response.data || [];

       const headers = [
            'Camp Report Id',
            'Employee Code',
            'Employee Name',
            'Doctor Name',
            'Doctor Code',
            'Category',
            'Screened Count',
            'Diagnosed count',
            'Prescription Count',
            'Brand Names',
            'Patients Name',
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
            'Non HDL',
            'Created At',
            'Modified At'
          ];

          
      
          // Map the data to match the custom column headers
          const mappedData = campReportList.map(item => ({
            'Camp Report Id':item.crid,
            'Employee Code': item.empcode,
            'Employee Name': item.username,
            'Doctor Name': item.doctor_name,
            'Doctor Code':item.code,
            'Category':item.subcategory_name,
            'Screened Count' : item.screened_count,
            'Diagnosed count' : item.diagnosed_count,
            'Prescription Count': item.prescription_count,
            'Brand Names': item.brand_names,
            'Patients Name': item.name,
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
            'Non HDL': item.nonhdl,
            'Created At':item.created_date,
            'Modified At':item.modified_date
          }));
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'employee');
          XLSX.writeFile(wb, 'employee.xlsx');
        
       }  
    

   function handleCatData(event) {
    const selectedOption = event.target;
    const selectedValues = selectedOption.value.split(',');
  
    // The first value is subcat_id, the second is rqid1, and the third is rqid2
    const selectedSubcatId = selectedValues[0];
    const rqid1 = selectedValues[1];
    const rqid2 = selectedValues[2];
    
    // Handle the values here

    if(selectedSubcatId=='null' || rqid1 === undefined  || rqid2=== undefined){
        setSubCatId("");
        setRqid1("");
        setRqid2("");
        //GetReportData();
        return;
    }
    setSubCatId(selectedSubcatId);
    setRqid1(rqid1);
    setRqid2(rqid2);
    //GetReportDataForCat(selectedSubcatId,rqid1,rqid2)   
    }

   
  return loading ? <Loader/> :  (
    <div className="container-fluid">
    {/* Content Row */}
       
    <div className="d-sm-flex align-items-start justify-content-end mb-4">
        {/* Dropdown for Select Camp */}
        
        

        {IsAdminLoggedIn === "true" ? <select name="topline"
          id="topline"
          className="form-control selectStyle ml-2 mb-2"
          onChange={(e) => {
            SetTopLine(e.target.value)
            setCurrentPage(1)
            if (e.target.value) {
              setRepo(e.target.value)
              GetFifthLine(e.target.value)
            }else {
              setRepo(empLoggedIn)
            }
          }}
          value={topLine}
        >
          <option value="">Select Top Line</option>
          {topLineData && topLineData.map((e) => (
            <option
              key={e.user_id}
              value={e.empcode}
            >
              {e.name}
            </option>
          ))}
        </select> : ""}


        <select
          name=""
          id=""
          className="form-control selectStyle ml-2 mb-2"
          onChange={(e) => {
            SetFourthLine(e.target.value)
            setCurrentPage(1)
            if (e.target.value) {
              GetFourthLine(e.target.value)
              setRepo(e.target.value)
            }
            else if (IsAdminLoggedIn === "false") {
              setRepo(empLoggedIn)
            } else {
              setRepo(topLine)
            }
          }}
          value={fourthLine}
        >
          {(topLine === "" && IsAdminLoggedIn === "true") ? (
            <option value="">Reporting1</option>
          ) : (
            <>
              <option value="">Reporting1</option>
              {fifthline &&
                fifthline.map((e) => (
                  <option key={e.user_id} value={e.empcode}>
                    {e.name}
                  </option>
                ))}
            </>
          )}
        </select>
                <select
                  name=""
                  id=""
                  className="form-control selectStyle ml-2 mb-2"
                  onChange={(e) => {
                    SetThirdLine(e.target.value);
                    setCurrentPage(1)
                    if(e.target.value){
                        GetThirdLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(fourthLine)
                    }
                  }}
                 value={thirdLine}
                >
                  {(topLine === "" && IsAdminLoggedIn ==="true") || fourthLine === "" ? (
                    <option value="">Reporting2</option>
                  ) : (
                    <>
                      <option value="">Reporting2</option>
                      {getFourthline &&
                        getFourthline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetSecondLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetSecondLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(thirdLine)
                    }
                  }}
                  value={secondLine}
                  >
                  {(topLine === "" && IsAdminLoggedIn==="true") || fourthLine === "" || thirdLine === "" ? (
                    <option value="">Reporting3</option>
                  ) : (
                    <>
                      <option value="">Reporting3</option>
                      {getThirdline &&
                        getThirdline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetFirstLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetFirstLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(secondLine)
                    }
                  }}
                  value={firstLine}
                  >
                  {(topLine === "" && IsAdminLoggedIn==="true") || fourthLine === "" || thirdLine === "" || secondLine=="" ? (
                    <option value="">Reporting4</option>
                  ) : (
                    <>
                      <option value="">Reporting4</option>
                      {getSecondline &&
                        getSecondline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetZeroLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetZeroLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(firstLine)
                    }
                  }}
                  value={zeroLine}
                  >
                  {(topLine === "" && IsAdminLoggedIn==="true") || fourthLine === "" || thirdLine === "" || secondLine=="" || firstLine=="" ? (
                    <option value="">Reporting5</option>
                  ) : (
                    <>
                      <option value="">Reporting5</option>
                      {getFirstline &&
                        getFirstline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2"
                 onChange={(e) => {
                   
                    if(e.target.value){
                        GetBottomLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(zeroLine)
                    }
                  }}
                  >
                  {(topLine === "" && IsAdminLoggedIn==="true") || fourthLine === "" || thirdLine === "" || secondLine=="" || firstLine=="" || zeroLine=="" ? (
                    <option value="">Reporting6</option>
                  ) : (
                    <>
                      <option value="">Reporting6</option>
                      {getZeroline &&
                        getZeroline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

        {/* Dropdowns for Select Top Line, Select State Head, Select FLM, and Select MR */}
        {/* You can reuse this structure for each dropdown */}
       

       
        {/* Search Bar */}
    </div>
    <div className="d-sm-flex align-items-start justify-content-end mb-4">
    <div className="dropdown ml-2">
    <select className="form-control selectStyle selecCamp" name="cat" id="cat" value={`${subCatId},${rqid1},${rqid2}`} onChange={handleCatData}>
        <option value="null">Select Camp</option>   
         {subCatData && subCatData.map((e) => (
        <option
            key={e.subcat_id}
            value={`${e.subcat_id},${e.rqid1},${e.rqid2}`}
        >
            {e.subcategory_name} Camp
        </option>
        ))}
      </select>
        </div>
    <div className="dropdown ml-2">
                                
                               
          {/* Dropdown items go here */}
          <select className="form-control selectStyle" style={{ marginTop: "32px" }} value={filter} name="filter" id="filter" onChange={(e) => {
            setFilter(e.target.value)
          }}>
            <option value="">Select Filter</option>
            <option value="monthly">Month Wise</option>
            <option value="weekly">Week Wise</option>
          </select>

                                
        </div>
        <div className="form-group ml-2">
          <label htmlFor="fromDate">From Date:</label>
          <input type="date" className="form-control" id="fromDate" placeholder="Select From Date" value={sDate} onChange={(e) => setSDate(e.target.value)} />
        </div>

        {/* Datepicker for "To" date */}
        <div className="form-group ml-2">
          <label htmlFor="toDate">To Date:</label>
          <input type="date" className="form-control" id="toDate" placeholder="Select To Date" value={eDate} onChange={(e) => setEDate(e.target.value)} />
        </div>

        <button className="btn btn-primary btn-icon-split" style={{ marginTop: "30px", marginLeft: "5px" }} onClick={handelSearchDate}>
          <span className="text">Search</span>
          <span className="icon text-white-60">
            <i className="fas fa-search fa-sm"></i>
          </span>
        </button>

      </div>
      <div className="form-group ml-2 reposerch">
        <div className="input-group">
          <input type="text" className="form-control bg-light border-1 small" value={searchQuery}
            onChange={handleSearchChange} placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
          <div className="input-group-append">
            <button className="btn btn-primary" type="button">
              <i className="fas fa-search fa-sm"></i>
            </button>
          </div>
        </div>
      </div>
        

    {/* Content Row */}
    <div className="card shadow mb-4">
        <div className="card-header py-3">
            <button onClick={handelReportDownload} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Report</button>

                <button onClick={handelReportDownloadFromTop} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Count Wise</button>

               
        </div>
        
        <div className="card-body">
            {/* <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Prescription Generated</th>
                            <th>Download Report</th>
                            <th>Download Zip</th>
                        </tr>
                    </thead>

                    <tbody>
                        
                        {reportData && reportData.map((e)=>{
                            return(
                           <tr key={e.emp_id}>
                            <td>{e.emp_name}</td>
                            <td>{e.camp_count}</td>
                            <td>{e.doctor_count}</td>
                            <td>{e.screened_count}</td>
                            <td>{e.diagnosed_count}</td>
                            <td>{e.prescription_count}</td>

                            <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                            <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                        </tr>
                            )
                        })}
                        
                     
                    </tbody>
                </table>
                <div
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
                  </div>
            </div> */}

            {fromTop && fromTop.length>0 /*&& IsAdminLoggedIn==="true"*/ ?( <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Prescription Generated</th>
                            
                            
                        </tr>
                    </thead>

                    <tbody>
                {/* Repeat this row structure for each table row */}
                {console.log("From Top is shown")}
                {fromTop && fromTop
                  .filter(e => e.name !== "Admin")   // ✅ skip Admin rows
                  .map((e) => (
                    <tr key={e.empcode}>
                      <td>{e.name}</td>
                      <td>{e.TotalCampCount}</td>
                      <td>{e.TotalDoctorCount}</td>
                      <td>{e.TotalPatientScaneed}</td>
                      <td>{e.TotalPatientDiagnosed}</td>
                      <td>{e.TotalPrescribe}</td>

                      {/* <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td> */}
                      {/* <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td> */}
                    </tr>
                  ))}

                        
                        {/* Repeat this row structure for each table row */}
                    </tbody>
                </table>
                
            </div>):(<div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Prescription Generated</th>
                            <th>Download Report</th>
                            <th>Download Images</th>
                        </tr>
                    </thead>

                    <tbody>
                        
                        {reportData && reportData.map((e)=>{
                            return(
                           <tr key={e.emp_id}>
                            <td>{e.emp_name}</td>
                            <td>{e.camp_count}</td>
                            <td>{e.doctor_count}</td>
                            <td>{e.screened_count}</td>
                            <td>{e.diagnosed_count}</td>
                            <td>{e.prescription_count}</td>

                            <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                            <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                        </tr>
                            )
                        })}
                        
                     
                    </tbody>
                </table>
                <div
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
                  </div>
            </div>)}
        </div>
    </div>
</div>
  )
}

export default Report