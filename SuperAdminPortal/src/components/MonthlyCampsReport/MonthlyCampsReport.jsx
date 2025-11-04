
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
    }, [filters, deptId])


    useEffect(() => {
        if (filters.campId) {
            getMyCampDetailsByEmpcode();
        }
    }, [filters.campId, deptId]);

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
            setDeptList(res.data.data)
            setDeptId(res.data.data[0].dept_id)
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
        if (!deptId) return
        setLoading(true);
        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampsNavListAdmin`,
                { deptId }
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
                // "Doctor Name": item.doctor_name,
                // "Speciality": item.speciality,
                // "Garnet Code": item.garnet_code,
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
                    <select
                        className="form-control selectStyle selecCamp"
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
                    <select
                        className="form-control selectStyle selecCamp"
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
                </div>

                <div className="dropdown ml-2">
                    <select
                        className="form-control selectStyle selecCamp"
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
                            <thead>
                                <tr>
                                    {/* <th>Doctor Name</th>
                                    <th>Speciality</th>
                                    <th>Garnet Code</th> */}
                                    {/* <th>Status</th> */}

                                    {/* Dynamically render camp-specific fields */}
                                    {myCampDetails.length > 0 &&
                                        myCampDetails[0].field_values?.map((fv, idx) => (
                                            <th key={idx}>{fv.field_label}</th>
                                        ))}
                                    <th>Submitted At</th>

                                    {/* If you want, you can add prescription info */}
                                    {/* <th>Brands (Prescriptions)</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {myCampDetails && myCampDetails.length > 0 ? (
                                    myCampDetails.map((e, i) => (
                                        <tr key={i}>
                                            {/* <td>{e.doctor_name}</td>
                                            <td>{e.speciality}</td>
                                            <td>{e.garnet_code}</td> */}
                                            {/* <td>{e.status === "Y" ? "Submitted" : "Pending"}</td> */}

                                            {/* Dynamic field values */}
                                            {e.field_values?.map((fv, idx) => (
                                                <td key={idx}>
                                                    {fv.field_type === "image" ? (
                                                        <span>🖼️ Image</span>
                                                    ) : (
                                                        fv.value || "-"
                                                    )}
                                                </td>
                                            ))}
                                            <td>{new Date(e.submitted_at).toLocaleString()}</td>

                                            {/* Prescriptions summary */}
                                            {/* <td>
                                                {e.prescriptions && e.prescriptions.length > 0 ? (
                                                    e.prescriptions.map((p, idx2) => (
                                                        <div key={idx2}>
                                                            <strong>{p.brand_name}</strong> — {p.prescription_count}
                                                        </div>
                                                    ))
                                                ) : (
                                                    "-"
                                                )}
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
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

export default MonthlyCampsReport