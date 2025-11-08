
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL, BASEURL2 } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./MonthlyCampsReport.css"
import Loader from "../utils/Loader";
import MonthlyCImgDownload from "./MonthlyCImgDownload";

const MonthlyCampsReport = () => {

    const empcode = sessionStorage.getItem('empcode')
    const userId = sessionStorage.getItem('userId');
    const [show, setShow] = useState(false);
    const [myCampDetails, setMyCampDetails] = useState([]);


    const [allReportData, setAllReportData] = useState([]);
    const [loading, setLoading] = useState(false)
    const [myCampType, setMyCampType] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [clientId, setClientId] = useState("");
    const [deptList, setDeptList] = useState([]);
    const [deptId, setDeptId] = useState("");

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
  // run when searchKeyword changes or when deptId changes
  if (filters.searchKeyword) {
    let timer = setTimeout(() => {
      getMyCampDetailsByEmpcode();
      GetDetiledData();
    }, 1000);
    return () => clearTimeout(timer);
  }
  getMyCampDetailsByEmpcode();
  GetDetiledData();
  getMyCampsType();
}, [filters.searchKeyword, deptId]);

// separate effect to run when campId changes
useEffect(() => {
  if (filters.campId) {
    getMyCampDetailsByEmpcode();
  }
}, [filters.campId]);

    useEffect(() => {
        getClientList();
    }, [])


    const getClientList = async () => {
        setLoading(true)

        try {
            const res = await axios.post(`${BASEURL2}/client/getClientDetails`)
            const clients = res.data.data;
            setClientList(res.data.data)
            // Auto-select first client and load its departments
            if (clients && clients.length > 0) {
                const firstClientId = clients[0].client_id;
                setClientId(firstClientId);
                await getDepartmentList(firstClientId);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const getDepartmentList = async (clientId) => {
  setLoading(true)
  try {
    const res = await axios.post(`${BASEURL2}/department/getDepartmentDetails`,
      { clientId }
    )
    const departments = res.data.data || [];
    setDeptList(departments);

    if (departments.length > 0) {
      const newDeptId = departments[0].dept_id;
      setDeptId(newDeptId);

      // Clear previous camp selection so the camp list can set the correct one
      setFilters(prev => ({ ...prev, campId: "" }));
    }
  } catch (error) {
    console.log(error)
  } finally {
    setLoading(false);
  }
}



    const getMyCampDetailsByEmpcode = async () => {
        setLoading(true)
        const payload = {
            searchKeyword: filters.searchKeyword.trim() || null,
            campId: filters.campId,
            empcode: empcode,
            deptId,
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
  if (!deptId) return;
  setLoading(true);
  try {
    const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampsNavListAdmin`,
      { deptId }
    );
    const camps = res.data.data || [];
    setMyCampType(camps);

    // Always set campId to first camp of the new dept (if exists)
    if (camps.length > 0) {
      setFilters(prev => ({
        ...prev,
        campId: camps[0].camp_id
      }));
    } else {
      // no camps for this dept
      setFilters(prev => ({ ...prev, campId: "" }));
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
            campType: filters.campType || null
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

                <div className="dropdown ml-2">
                      <label htmlFor="searchKeyword" >Select Client:</label>
                    <select
                        className="form-control selectStyle"
                        name="clientId"
                        id="clientId"
                        value={clientId}
                        onChange={(e) => { setClientId(e.target.value), getDepartmentList(e.target.value) }}
                    >
                        {clientList && clientList.map((e) => (
                            <option key={e.client_id} value={e.client_id}>
                                {e.client_name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="dropdown ml-2">
                 <label htmlFor="searchKeyword" >Select Dept:</label>
                    <select
                        className="form-control selectStyle "
                        name="deptId"
                        id="deptId"
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                    >
                        {deptList && deptList.map((e) => (
                            <option key={e.dept_id} value={e.dept_id}>
                                {e.dept_name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="form-group ml-2">
                    <label htmlFor="searchKeyword" >Search:</label>
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

                <div className="dropdown ml-2">
                      <label htmlFor="searchKeyword" >Select Camp:</label>
                    <select
                        className="form-control selectStyle "
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
            🚫 No records found for this report.
          </div>
        </td>
      </tr>
    </tbody>
  )}
</table>
            
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonthlyCampsReport