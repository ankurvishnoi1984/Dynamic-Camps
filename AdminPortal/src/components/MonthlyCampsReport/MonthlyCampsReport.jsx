
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL2, DEPTID } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./MonthlyCampsReport.css"
import Loader from "../utils/Loader";
import MonthlyCImgDownload from "./MonthlyCImgDownload";

const MonthlyCampsReport = () => {

    const empcode = sessionStorage.getItem('empcode')
    const userId = sessionStorage.getItem('userId');
     const [show,setShow]= useState(false);
    const [myCampDetails, setMyCampDetails] = useState([]);


    const [allReportData, setAllReportData] = useState([]);
    const [loading, setLoading] = useState(false)
    const [myCampType, setMyCampType] = useState([]);
  
  const deptId = DEPTID

    const [filters, setFilters] = useState({
        userId: userId,         // you will probably get this from logged-in user
        searchKeyword: "",
        //   fromDate: "",
        //   toDate: "",
        campId: ""
    });

    const handleChangeDr = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    const handleChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            campId: e.target.value,
        }));
    };

  const handleOpenModal = (action, crid) => {

  setShow(true);
};
   const handleCloseModal = () => {
  setShow(false);
 
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
        GetDetiledData();
        getMyCampsType();
    }, [filters,deptId])


    useEffect(() => {
        if (filters.campId) {
            getMyCampDetailsByEmpcode();
        }
    }, [filters.campId,deptId]);

   

    const getMyCampDetailsByEmpcode = async () => {
        setLoading(true)
        const payload = {
            searchKeyword: filters.searchKeyword.trim() || null,
            campId: filters.campId,
            empcode:empcode,
            deptId:deptId,
        };

        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/monthlyCampsAdminReports`, payload)
            setMyCampDetails(res.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const getMyCampsType = async () => {
        if(!deptId)return
        setLoading(true);
        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampsNavListAdmin`,
                {deptId:deptId}
            );
            const camps = res.data.data || [];
            setMyCampType(camps);

            // ✅ Automatically set the first campId (if not already set)
            if (camps.length > 0 && !filters.campId) {
                setFilters((prev) => ({
                    ...prev,
                    campId: camps[0].camp_id, // or camps[0].id based on your DB field name
                }));
            }
        } catch (error) {
            console.error("Error fetching camps:", error);
        } finally {
            setLoading(false);
        }
    };



    async function GetDetiledData() {
        // check if deptid needed
        const payload = {
            empcode: filters.empcode,
            searchKeyword: filters.searchKeyword.trim() || null,
            fromDate: filters.fromDate || null,
            toDate: filters.toDate || null,
            campType: filters.campType || null,
            deptId,
        };
        try {
            const res = await axios.post(`${BASEURL2}/admin/getMyCampsSheetReport`, payload);
            setAllReportData(res.data.data)
        } catch (error) {
            console.log(error)
        }
    }




    const handelReportDownloadDetailed = () => {
        if (!myCampDetails || myCampDetails.length === 0) {
            alert("No data to export");
            return;
        }

        // Prepare headers
        const dynamicHeaders = myCampDetails[0].field_values?.map(fv => fv.field_label) || [];
        const headers = [
            ...dynamicHeaders,
            "Status",
            "Submitted At",
        ];

        // Map data
        const mappedData = myCampDetails.map(item => {
            // Dynamic fields
            const dynamicValues = {};
            item.field_values?.forEach(fv => {
                dynamicValues[fv.field_label] = fv.field_type === "image" ? "🖼️ Image" : fv.value || "-";
            });

            // Prescriptions summary
            const presSummary = item.prescriptions && item.prescriptions.length > 0
                ? item.prescriptions.map(p => `${p.brand_name} — ${p.prescription_count}`).join(", ")
                : "-";

            return {
                ...dynamicValues,
                "Status": item.status === "Y" ? "Active" : "Inactive",
                "Submitted At": new Date(item.submitted_at).toLocaleString(),
                // "Brands (Prescriptions)": presSummary
            };
        });

        // Create worksheet and workbook
        const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CampsReport");
        XLSX.writeFile(wb, "CampsReport.xlsx");
    };



    return loading ? <Loader /> : (
        <div className="container-fluid">
            {/* Content Row */}


            <div className="d-sm-flex align-items-start justify-content-end mb-4">


                {/* <div className="form-group ml-2">
                    <label htmlFor="searchKeyword" >Doctor Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="searchKeyword"
                        name="searchKeyword"
                        placeholder="Search by Doctor Name"
                        value={filters.searchKeyword}
                        onChange={handleChangeDr}
                    />
                </div> */}

                <div className="dropdown ml-2">
                 <label htmlFor="campType" >Select Camp:</label>
                  
                    <select
                        className="form-control selectStyle"
                        name="campType"
                        id="campType"
                        value={filters.campId}
                        onChange={handleChange}
                    >
                        {myCampType && myCampType.map((e) => (
                            <option key={e.camp_id} value={e.camp_id}>
                                {e.camp_name}
                            </option>
                        ))}
                    </select>

                </div>

                {/* <div className="form-group ml-2">
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
                </div> */}

            </div>
            {/* Content Row */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">

                    <button onClick={handelReportDownloadDetailed} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2">
                        <i className="fas fa-download fa-sm text-white-50"></i> Download Report</button>
                        
                    {/* <button onClick={() => {
                        handleOpenModal();
                    }} className="d-none m-1 d-sm-inline-block btn btn-sm btn-facebook shadow-sm">
                        <i className="fas fa-images fa-sm text-white-50"></i> Download Images
                    </button> */}
                </div>

                <MonthlyCImgDownload
                    show={show}
                    handelCloseModal={handleCloseModal}
                />
                
                <div className="card-body">
                    <div className="table-responsive">
                    <table
  className="table table-bordered"
  id="dataTable"
  width="100%"
  cellSpacing="0"
>
  {myCampDetails && myCampDetails.length > 0 ? (
    <>
      <thead>
        <tr>
          {myCampDetails[0].field_values?.map((fv, idx) => (
            <th key={idx}>{fv.field_label}</th>
          ))}
          <th>Submitted At</th>
        </tr>
      </thead>

      <tbody>
        {myCampDetails.map((e, i) => (
          <tr key={i}>
            {e.field_values?.map((fv, idx) => (
              <td key={idx}>
                {fv.field_type === "image" ? (
                  <span>Image</span>
                ) : (
                  fv.value || "-"
                )}
              </td>
            ))}
            <td>{new Date(e.submitted_at).toLocaleString()}</td>
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
            🚫 No records found.
          </div>
        </td>
      </tr>
    </tbody>
  )}
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

export default MonthlyCampsReport