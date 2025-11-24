
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
        getMyCampDetailsByEmpcode();
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

    // Prepare headers (exclude image fields)
    const dynamicHeaders = myCampDetails[0].field_values
        ?.filter(fv => fv.field_type !== "image")
        .map(fv => fv.field_label) || [];

    const headers = [
        ...dynamicHeaders,
        "Submitted At",
    ];

    // Map data
    const mappedData = myCampDetails.map(item => {
        // Dynamic fields excluding images
        const dynamicValues = {};
        item.field_values
            ?.filter(fv => fv.field_type !== "image")
            .forEach(fv => {
                dynamicValues[fv.field_label] = fv.value || "-";
            });

        // Prescriptions summary (if needed later)
        const presSummary = item.prescriptions && item.prescriptions.length > 0
            ? item.prescriptions.map(p => `${p.brand_name} — ${p.prescription_count}`).join(", ")
            : "-";

        return {
            ...dynamicValues,
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


        
            {/* Content Row */}
            <div className="card shadow mb-4">
              <h5 className="m-2 font-weight-bold text-primary">Reports</h5>
                        <div className="card-header py-3">
  <div className="d-flex justify-content-between align-items-center">

    {/* left side can hold a title if needed (optional) */}
    <div className="header-left">
      <div className="mr-3 d-flex align-items-center">
        <button
          onClick={handelReportDownloadDetailed}
          className="btn btn-sm btn-info shadow-sm"
        >
          <i className="fas fa-download fa-sm text-white-50 mr-1"></i>
          Download Report
        </button>
      </div>
    </div>

    {/* RIGHT: controls row */}
    <div className="d-flex align-items-center flex-wrap">


      {/* Search */}
      <div className="form-group mr-3 mb-2 control-col">
        <label htmlFor="searchKeyword" className="small mb-1">Search:</label>
        <input
          type="text"
          className="form-control"
          id="searchKeyword"
          name="searchKeyword"
          placeholder="Enter text to search"
          value={filters.searchKeyword}
          onChange={handleChangeDr}
        />
      </div>

      {/* Select Camp */}
      <div className="form-group mr-3 mb-2 control-col">
        <label htmlFor="campType" className="small mb-1">Select Camp:</label>
        <select
          className="form-control selectStyle"
          name="campType"
          id="campType"
          value={filters.campId}
          onChange={handleChange}
        >
          {myCampType?.map((e) => (
            <option key={e.camp_id} value={e.camp_id}>
              {e.camp_name}
            </option>
          ))}
        </select>
      </div>

    </div>
  </div>
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
                        {myCampDetails[0]?.field_values
                          ?.filter((fv) => fv.field_type !== "image")
                          .map((fv, idx) => (
                            <th key={idx}>{fv.field_label}</th>
                          ))}
                        <th>Submitted At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {myCampDetails.map((e, i) => (
                        <tr key={i}>
                          {e.field_values
                            ?.filter((fv) => fv.field_type !== "image") // ✅ ignore image fields here too
                            .map((fv, idx) => (
                              <td key={idx}>{fv.value || "-"}</td>
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