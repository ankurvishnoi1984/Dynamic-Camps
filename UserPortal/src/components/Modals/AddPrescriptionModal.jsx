import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import "./CustomCss.css";
import Popup from "./Popup";


const AddPrescriptionModal = ({ handelCloseModel }) => {

  const [doctorId, setDoctorId] = useState('');
  const [doctorList, setDoctorList] = useState([]);
  const [campDate, setCampDate] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [isPrescriptionGen, setisPrescriptionGen] = useState("");
  const [isEmpanormLaunched, setEmpanormLaunched] = useState("");
  const [garnetCode,setGarnetCode] = useState("");
  const [brandOptions, setBrandOptions] = useState([]); // options for react-select
  const [selectedBrands, setSelectedBrands] = useState([]); // array of {value,label}
  const [brandData, setBrandData] = useState({}); // {brandName: {count,file}}
  const [popup, setPopup] = useState(null);
  const empId = sessionStorage.getItem("empId");





  const userId = sessionStorage.getItem("userId");


  const getDoctorList = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId });
      setDoctorList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };



  const getBrandList = async () => {
    axios
      .get(`${BASEURL2}/basic/getMyCampsBrandsList`) // this hits your SQL above
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
     if (!isPrescriptionGen || !doctorId || !campDate || !isEmpanormLaunched) {
      setPopup({
        type: "error",
        message: "Please fill all required fields (Type, Doctor, Date).",
      });
      return;
    }
          if (isPrescriptionGen === "Y") {
    if (!selectedBrands.length) {
      setPopup({
        type: "error",
        message: "Please select at least one brand for prescription.",
      });
      return;
    }

    for (const b of selectedBrands) {
      const brandId = b.value;
      const prescriptionCount = Number(brandData[brandId]?.count || 0);
      const files = brandData[brandId]?.files || [];

      if (!prescriptionCount) {
        setPopup({
          type: "error",
          message: `Please enter prescription count for brand "${b.label}".`,
        });
        return;
      }

      if (!files.length) {
        setPopup({
          type: "error",
          message: `Please upload prescription image for brand "${b.label}".`,
        });
        return;
      }

      if (prescriptionCount !== files.length) {
        setPopup({
          type: "error",
          message: `For brand "${b.label}", prescription count (${prescriptionCount}) must match number of uploaded images (${files.length}).`,
        });
        return;
      }
    }
  }
    try {
   
      const res1 = await axios.post(`${BASEURL2}/camp/prescriptionUpload`, {
        doctorId: doctorId,
        date: campDate,
        isPrescriptionGen: isPrescriptionGen,
        isEmpanormLaunched: isEmpanormLaunched,
        userId: userId
      });

      if (Number(res1.data.errorCode) !== 1) {
       setPopup({ type: "error", message: res1.data.message || "Error executing camp" });
        return;
      }
      const crid = res1.data.data.insertId

      const formData = new FormData();

      formData.append("campId", crid);
      formData.append("userId", userId);

      const brandsMeta = [];

      for (const b of selectedBrands) {
      const brandId = b.value;
      const prescriptionCount = Number(brandData[brandId]?.count || 0);
      const files = brandData[brandId]?.files || [];

      brandsMeta.push({
        brandId,
        prescriptionCount,
        fileNames: files.map((f) => f.name),
      });

      files.forEach((file) => {
        formData.append(`files_${brandId}[]`, file);
      });
    }

      formData.append("brandsMeta", JSON.stringify(brandsMeta));

      // 3️⃣ call saveBrandImages with FormData
      const res2 = await axios.post(`${BASEURL2}/camp/saveBrandImages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (Number(res2.data.errorCode) !== 1) {
         setPopup({ type: "error", message: res2.data.message || "Error saving image" });
          return;
      }

      // handelCloseModel();
       setPopup({ type: "success", message: "My Camp added successfully!" });
    } catch (error) {
      console.error(error);
      setPopup({ type: "error", message: "Something went wrong while submitting camp" });
    }
  };

  useEffect(() => {
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
                <div className="form-group col-md-4 did-floating-label-content">
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
                </div>

                <div className="form-group col-md-4 did-floating-label-content">
                  <input
                    type="text"
                    className="form-control did-floating-input"
                    placeholder="speciality"
                    value={speciality}
                    readOnly
                  />
                  <label className="form-label did-floating-label">Speciality</label>
                </div>
 <div className="form-group col-md-4 did-floating-label-content">
                  <input
                    type="text"
                    className="form-control did-floating-input"
                    placeholder="Garnet Code"
                    value={garnetCode}
                    readOnly
                  />
                  <label className="form-label did-floating-label">Garnet Code</label>
                </div>
                <div className="form-group col-md-4 did-floating-label-content">
                  <input
                    type="date"
                    className="form-control did-floating-input"
                    onChange={(e) => {
                      const selected = new Date(e.target.value);
                      const today = new Date();
                      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                      if (selected < thirtyDaysAgo || selected > today) {
                        alert("Please select a date within the last 30 days.");
                        return;
                      }
                      setCampDate(e.target.value);
                    }}

                    placeholder="Camp Date*"
                    value={campDate}
                    // 🔒 restrict to last 30 days:
                    min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <label className="form-label did-floating-label">
                    Date of Prescription*
                  </label>
                </div>


                <div className="form-group col-md-4 did-floating-label-content">
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
                </div>

                <div className="form-group col-md-4 did-floating-label-content">
                  <select
                    className="form-control did-floating-select"
                    value={isEmpanormLaunched}
                    onChange={(e) => setEmpanormLaunched(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                  <label className="form-label did-floating-label">
                    Empanorm launched*
                  </label>
                </div>

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

export default AddPrescriptionModal;