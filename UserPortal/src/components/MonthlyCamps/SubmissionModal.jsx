import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { BASEURL2,DeptId } from "../constant/constant";
import "./submissionModal.css";
import Popup from "../Modals/Popup";
import { useParams } from "react-router-dom";
// import Popup from "./Popup";


const SubmissionModal = ({ handelCloseModel }) => {

    const [doctorId, setDoctorId] = useState('');
    const [doctorList, setDoctorList] = useState([]);
    const [campDate, setCampDate] = useState("");
    const [speciality, setSpeciality] = useState("");
    const [isPrescriptionGen, setisPrescriptionGen] = useState("");
    const [garnetCode, setGarnetCode] = useState("");
    const [brandOptions, setBrandOptions] = useState([]); // options for react-select
    const [selectedBrands, setSelectedBrands] = useState([]); // array of {value,label}
    const [brandData, setBrandData] = useState({}); // {brandName: {count,file}}
    const [popup, setPopup] = useState(null);
    const empId = sessionStorage.getItem("empId");
    const [fieldDetails, setFieldDetails] = useState([]);
    const { campId } = useParams();
    const [formData, setFormData] = useState({});
    const [isDoctorFieldReq,setDrFieldReq] = useState("");
    const [isPrescFieldReq,setPresFieldReq] = useState("");






    const userId = sessionStorage.getItem("userId");


    const getDoctorList = async () => {
        try {
            const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId,deptId:DeptId });
            setDoctorList(res?.data?.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getCampFieldDetails = async () => {
        // setLoading(true)
        console.log("field details triggered")
        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampFieldDetails`, { campId,deptId:DeptId })
            setFieldDetails(res.data.data)
            setDrFieldReq(res?.data.is_doctor_required)
            setPresFieldReq(res?.data.is_prescription_required)
            console.log("Field details data",res.data)
        } catch (error) {
            console.log(error)
        } finally {
            // setLoading(false);
        }
    }


    const getBrandList = async () => {
        axios
            .post(`${BASEURL2}/basic/getBrandsList`,{deptId:DeptId}) // this hits your SQL above
            .then((res) => {
                // convert your API result into react-select options
                const options = (res.data.data || []).map((b) => ({
                    value: b.brand_id,      // use your brand_id for value
                    label: b.brand_name,    // show brand_name in dropdown
                    brand_name: b.brand_name // keep original name if you want later
                }));
                setBrandOptions(options);
            })
            .catch((err) => console.log(err));
    }

    const handleBrandInputChange = (brand, field, value) => {
        setBrandData((prev) => ({
            ...prev,
            [brand]: {
                ...prev[brand],
                [field]: value,
            },
        }));
    };

    const handelDoctorChange = (event) => {
        let docId = event.target.value
        if (docId) {
            setDoctorId(docId)
            const doctor = doctorList.find((e) => e.doctor_id == docId);
            setSpeciality(doctor.speciality);
            setGarnetCode(doctor.garnet_code)
            setCampDate(doctor.camp_date);
        }
        else {
            setDoctorId('')
            setSpeciality('');
            setCampDate('');
        }

    }


    const handleSubmit = async () => {
        if (!campDate) {
            setPopup({ type: "error", message: "Please fill All Fields before submitting." });
            return;
        }

        const missingRequired = fieldDetails.some(
            (f) => f.is_required === "Y" && !formData[f.field_id]
        );

        if (missingRequired) {
            setPopup({ type: "error", message: "Please fill all required fields." });
            return;
        }

        // Prepare field values (for text, dropdown etc.)
        const values = fieldDetails.map((f) => ({
            fieldId: f.field_id,
            value: f.field_type === "image" ? "" : formData[f.field_id] || ""
        }));

        const formDataPayload = new FormData();
        formDataPayload.append("campId", campId);
        formDataPayload.append("userId", userId);
        formDataPayload.append("doctorId", 0);
        formDataPayload.append("status", "Y");
        formDataPayload.append("deptId", DeptId);
        formDataPayload.append("values", JSON.stringify(values));

        // ✅ Add images to FormData using correct keys
        fieldDetails.forEach((f) => {
            if (f.field_type === "image" && formData[f.field_id]?.length > 0) {
                formData[f.field_id].forEach((file) => {
                    formDataPayload.append(`field_${f.field_id}[]`, file);
                });
            }
        });

        try {
            const res = await axios.post(
                `${BASEURL2}/monthlyCamps/submitFormAnswers`,
                formDataPayload,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (Number(res.data.errorCode) !== 1) {
                setPopup({ type: "error", message: res.data.errorDetail || "Error saving camp form" });
                return;
            }

            setPopup({ type: "success", message: "Camp submission saved successfully!" });

        } catch (err) {
            setPopup({ type: "error", message: "Something went wrong while submitting camp" });
        }
    };



    useEffect(() => {
        getCampFieldDetails();
        getDoctorList();
        getBrandList();

    }, []);

    const customStyles = {
        menuList: (provided) => ({
            ...provided,
            maxHeight: 200,
            overflowY: 'auto',
        }),
        valueContainer: (provided) => ({
            ...provided,
            flexWrap: 'wrap',    // allow multiple lines of tags
            overflow: 'hidden',
        }),
        multiValue: (provided) => ({
            ...provided,
            maxWidth: '100%',    // tags fit container width
            flex: '0 1 auto',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            whiteSpace: 'normal', // wrap long names
        }),
    };

    // if (!show) return null;

    return (<>
        <div className="addusermodel">
            <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Camp Report</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handelCloseModel}
                            ></button>
                        </div>
                        <div className="modal-body">

                            <form className="row g-3">
                                {isDoctorFieldReq === "Y"&&<div className="form-group col-md-4 did-floating-label-content">
                                    <select
                                        className="form-control did-floating-select"
                                        onChange={handelDoctorChange}
                                        value={doctorId}
                                    >
                                        <option value="">Select...</option>
                                        {doctorList.map((e) => (
                                            <option

                                                key={e.doctor_id}
                                                value={e.doctor_id}
                                            >
                                                {e.doctor_name}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="form-label did-floating-label">Doctor Name*</label>
                                </div>}

                               {isDoctorFieldReq === "Y"&& <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="speciality"
                                        value={speciality}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">Speciality</label>
                                </div>}
                                {isDoctorFieldReq === "Y"&&<div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="Garnet Code"
                                        value={garnetCode}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">Garnet Code</label>
                                </div>}

                                {isPrescFieldReq === "Y"&&<div className="form-group col-md-4 did-floating-label-content">
                                    <select
                                        className="form-control did-floating-select"
                                        value={isPrescriptionGen}
                                        onChange={(e) => setisPrescriptionGen(e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Y">Yes</option>
                                        <option value="N">No</option>
                                    </select>
                                    <label className="form-label did-floating-label">
                                        Is Prescription Generated*
                                    </label>
                                </div>}
                           

                                {isPrescriptionGen === "Y" && <div className="form-group col-md-6 did-floating-label-content">
                                    <Select
                                        isMulti
                                        options={brandOptions}
                                        value={selectedBrands}
                                        onChange={setSelectedBrands} // react-select automatically adds/removes items
                                        placeholder="Select Brands..."
                                        styles={customStyles}
                                        menuPosition="fixed"
                                    />
                                    {/* <label className="form-label did-floating-label">
                    Select Brands
                  </label> */}
                                </div>}

                                {/* Dynamic brand fields */}
                                {isPrescriptionGen === "Y" && selectedBrands.map((b) => {
                                    const file = brandData[b.value]?.file;
                                    const previewUrl = file ? URL.createObjectURL(file) : null;

                                    return (
                                        <div key={b.value} className="row mt-4 align-items-center">
                                            {/* Prescription Count */}
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold">Prescription Count for {b.label}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min={0}
                                                    onChange={(e) =>
                                                        handleBrandInputChange(b.value, "count", e.target.value)
                                                    }
                                                    value={brandData[b.value]?.count || ""}
                                                />
                                            </div>

                                            {/* Upload Image */}
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold">Upload Image for {b.label}</label>
                                                <div className="custom-file-input-wrapper">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        id={`file-${b.value}`}
                                                        className="custom-file-input"
                                                        onChange={(e) => {
                                                            const newFiles = Array.from(e.target.files || []);
                                                            const prevFiles = brandData[b.value]?.files || [];
                                                            handleBrandInputChange(b.value, "files", [...prevFiles, ...newFiles]); // ✅ append instead of replace
                                                            e.target.value = ""; // reset so same file can be picked again
                                                        }}
                                                    />

                                                    <label htmlFor={`file-${b.value}`} className="custom-file-label">
                                                        {brandData[b.value]?.files
                                                            ? `${brandData[b.value]?.files.length} file(s) selected`
                                                            : "Choose Images..."}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Preview with Remove Button */}
                                            <div className="col-md-4 d-flex flex-wrap">
                                                {brandData[b.value]?.files?.map((file, idx) => {
                                                    const previewUrl = URL.createObjectURL(file);
                                                    return (
                                                        <div key={idx} className="preview-container me-2 mb-2">
                                                            <img src={previewUrl} alt="Preview" className="preview-img" />
                                                            <button
                                                                type="button"
                                                                className="remove-btn"
                                                                onClick={() => {
                                                                    const updated = [...brandData[b.value].files];
                                                                    updated.splice(idx, 1); // remove clicked file
                                                                    handleBrandInputChange(b.value, "files", updated);
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {fieldDetails.map((field) => {
                                    const value = formData[field.field_id] || ""; // formData state keyed by field_id

                                    switch (field.field_type) {
                                        case "text":
                                            return (
                                                <div key={field.field_id} className="form-group col-md-4 did-floating-label-content">
                                                    <input
                                                        type="text"
                                                        className="form-control did-floating-input"
                                                        placeholder={field.label}
                                                        value={value}
                                                        required={field.is_required === "Y"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, [field.field_id]: e.target.value })
                                                        }
                                                    />
                                                    <label className="form-label did-floating-label">{field.label}</label>
                                                </div>
                                            );

                                        case "number":
                                            return (
                                                <div key={field.field_id} className="form-group col-md-4 did-floating-label-content">
                                                    <input
                                                        type="number"
                                                        className="form-control did-floating-input"
                                                        placeholder={field.label}
                                                        value={value}
                                                        required={field.is_required === "Y"}
                                                        min={0}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, [field.field_id]: e.target.value })
                                                        }
                                                    />
                                                    <label className="form-label did-floating-label">{field.label}</label>
                                                </div>
                                            );

                                        case "date":
                                            return (
                                                <div key={field.field_id} className="form-group col-md-4 did-floating-label-content">
                                                    <input
                                                        type="date"
                                                        className="form-control did-floating-input"
                                                        placeholder={field.label}
                                                        value={value}
                                                        required={field.is_required === "Y"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, [field.field_id]: e.target.value })
                                                        }
                                                    />
                                                    <label className="form-label did-floating-label">{field.label}</label>
                                                </div>
                                            );

                                        case "dropdown":
                                            return (
                                                <div key={field.field_id} className="form-group col-md-4 did-floating-label-content">
                                                    <select
                                                        className="form-control did-floating-select"
                                                        value={value}
                                                        required={field.is_required === "Y"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, [field.field_id]: e.target.value })
                                                        }
                                                    >
                                                        <option value="">Select...</option>
                                                        {field.options_json &&
                                                            (field.options_json).map((opt, idx) => (
                                                                <option key={idx} value={opt}>
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <label className="form-label did-floating-label">{field.label}</label>
                                                </div>
                                            );

                                    
                                            case "image":
  return (
    <div key={field.field_id} className="form-group col-md-4">
      <label className="form-label fw-bold">Upload Image for {field.label}</label>

      {/* Hidden file input + visible label/button */}
      <div className="custom-file-input-wrapper">
        <input
          type="file"
          accept="image/*"
          multiple
          id={`file-${field.field_id}`}
          className="custom-file-input"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files || []);

            // Convert to objects containing file + object URL for preview
            const newItems = newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));

            const prevItems = formData[field.field_id] || [];
            // append instead of replace
            setFormData({ ...formData, [field.field_id]: [...prevItems, ...newItems] });

            // reset so same file can be picked again
            e.target.value = "";
          }}
        />

        <label htmlFor={`file-${field.field_id}`} className="custom-file-label">
          {formData[field.field_id] && formData[field.field_id].length
            ? `${formData[field.field_id].length} file(s) selected`
            : "Choose Images..."}
        </label>
      </div>

      {/* Preview area */}
      <div className="col-md-12 d-flex flex-wrap mt-2">
        {(formData[field.field_id] || []).map((item, idx) => (
          <div key={idx} className="preview-container me-2 mb-2" style={{ position: "relative" }}>
            <img
              src={item.url}
              alt="Preview"
              className="preview-img"
              style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
            />
            <button
              type="button"
              className="remove-btn"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                borderRadius: "50%",
                width: 22,
                height: 22,
                lineHeight: "18px",
                cursor: "pointer",
              }}
              onClick={() => {
                const updated = [...(formData[field.field_id] || [])];
                const [removed] = updated.splice(idx, 1);

                // revoke object URL for memory cleanup
                if (removed?.url) URL.revokeObjectURL(removed.url);

                setFormData({ ...formData, [field.field_id]: updated });
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

                                        default:
                                            return null;
                                    }
                                })}
     <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="date"
                                        className="form-control did-floating-input"
                                        onChange={(e) => {
                                            // const selected = new Date(e.target.value);
                                            // const today = new Date();
                                            // const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                                            // if (selected < thirtyDaysAgo || selected > today) {
                                            //     alert("Please select a date within the last 30 days.");
                                            //     return;
                                            // }
                                            setCampDate(e.target.value);
                                        }}

                                        placeholder="Camp Date*"
                                        value={campDate}
                                        // 🔒 restrict to last 30 days:
                                        // min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                        //     .toISOString()
                                        //     .split("T")[0]}
                                        // max={new Date().toISOString().split("T")[0]}
                                    />
                                    <label className="form-label did-floating-label">
                                        Date*
                                    </label>
                                </div>
                            </form>

                            <div className="text-center">

                                <button
                                    type="button"
                                    className="btn btn-success mx-auto"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        {popup && (
            <Popup
                type={popup.type}
                message={popup.message}
                onClose={() => {
                    setPopup(null);
                    // Only close modal if success
                    if (popup.type === "success") {
                        handelCloseModel();
                    }
                }}
            />
        )}
    </>
    );

};

export default SubmissionModal;