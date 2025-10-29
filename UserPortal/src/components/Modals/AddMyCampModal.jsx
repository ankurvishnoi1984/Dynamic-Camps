import { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import useCampList from "../CustomHook/useCampList";
import Popup from "./Popup";
import Select from "react-select";

const AddMyCampModal = ({ handelCloseModel }) => {

  const [campList] = useCampList();
  const [campType, setCampType] = useState("");
  const [doctorId, setDoctorId] = useState('');
  const [doctorList, setDoctorList] = useState([]);
  const [isRps, setIsRps] = useState("");
  const [campDate, setCampDate] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [popup, setPopup] = useState(null);
  const [campImage, setCampImage] = useState(null);
  const empId = sessionStorage.getItem("empId");
  const [garnetCode, setGarnetCode] = useState("");

  // bcc variables
  const [isBccDistributed, setBccDistributed] = useState("");
  const [isPrescriptionGen, setisPrescriptionGen] = useState("");
  const [brandOptions, setBrandOptions] = useState([]); // options for react-select
  const [selectedBrands, setSelectedBrands] = useState([]); // array of {value,label}
  const [brandData, setBrandData] = useState({}); // {brandName: {count,file}}
  const [selectedBCCItem, setSelectedBCCItem] = useState(null);
  const [bccOptions, setBccOptions] = useState([])
  const [bccData, setBCCData] = useState({});

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleDateChange = (e) => {
    const selected = e.target.value;

    if (campType === "Bcc Distribution") {
      if (selected < thirtyDaysAgo || selected > today) {
        alert("Please select a date within the last 30 days.");
        return;
      }
    } else {
      if (selected < today) {
        setPopup({ type: "error", message: "You cannot select a date before today." });
        return;
      }
    }

    setCampDate(selected);
  };

  const handleBCCInputChange = (value, key, file) => {
    setBCCData((prev) => ({
      ...prev,
      [value]: {
        ...prev[value],
        [key]: file,
      },
    }));
  };


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

    const getBccList = async () => {
    axios
      .get(`${BASEURL2}/basic/getBccItemsList`) // this hits your SQL above
      .then((res) => {
        // convert your API result into react-select options
        const options = (res.data.data || []).map((b) => ({
          value: b.brand_id,      // use your brand_id for value
          label: b.item_name,    // show brand_name in dropdown
          brand_name: b.item_name // keep original name if you want later
        }));
        setBccOptions(options);
      })
      .catch((err) => console.log(err));
  }


  const userId = sessionStorage.getItem("userId");


  const getDoctorList = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId });
      setDoctorList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorList();
    getBrandList();
    getBccList();
  }, []);

  const handelDoctorChange = (event) => {
    let docId = event.target.value
    if (docId) {
      setDoctorId(docId)
      const doctor = doctorList.find((e) => e.doctor_id == docId);
      setSpeciality(doctor.speciality);
       setGarnetCode(doctor.garnet_code)
    }
    else {
      setDoctorId('')
      setSpeciality('');
      setCampDate('');
    }

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

  const handleSubmit = async () => {

    if (!campType || !doctorId || !campDate) {
      setPopup({
        type: "error",
        message: "Please fill all required fields (Type, Doctor, Date).",
      });
      return;
    }

    try {
      const res1 = await axios.post(`${BASEURL2}/camp/addMyCamp`, {
        campType: campType,
        doctorId: doctorId,
        date: campDate,
        isRPS: isRps,
        userId: userId,
      });


      if (!res1.data.success) {
        setPopup({ type: "error", message: res1.data.message || "Error adding camp" });
        return;
      }


      const campId = res1.data.data.insertId;

      if (campImage) {
        const formData = new FormData();
        formData.append("campId", campId);
        formData.append("userId", userId);
        formData.append("campImage", campImage); // 👈 our single image field

        // call your existing upload API
        const res2 = await axios.post(`${BASEURL2}/camp/saveCampImage`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res2.data.errorCode !== 1) {
          setPopup({ type: "error", message: res2.data.message || "Error saving camp image" });
          return;
        }
      }
      // handelCloseModel();
      setPopup({ type: "success", message: "My Camp added successfully!" });

    } catch (error) {
      console.error(error);
      setPopup({ type: "error", message: "Something went wrong while submitting camp" });
    }
  };

   const handleSubmitBcc = async () => {

    if (!doctorId || !campDate || !isPrescriptionGen || !isBccDistributed) {
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

      // 1️⃣ Create the camp first
      const campRes = await axios.post(`${BASEURL2}/camp/createBccCamp`, {
        campType,
        doctorId,
        date: campDate,
        isPrescriptionGen,
        isBccDistributed,
        userId,
      });

      if (campRes.data.errorCode !== 1) {
        setPopup({ type: "error", message: campRes.data.message || "Error saving camp image" });
        return;
      }

      // get back the campId (if your API returns it)
      const newCampId = campRes.data.data.insertId || campRes.data.data.camp_id;

      // 2️⃣ Prepare FormData for brand + BCC uploads
      const formData = new FormData();
      formData.append("campId", newCampId);
      formData.append("userId", userId);

      // brands
// ✅ Collect all brands + BCC images in one go
      const brandsMeta = [];

      // --- Prescription brand section (same as before)
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

      // --- ✅ NEW: Treat BCC image like a brand upload
      if (selectedBCCItem && bccData[selectedBCCItem.value]?.file) {
        const bccFile = bccData[selectedBCCItem.value].file;
        const bccId = selectedBCCItem.value;

        // push fake meta entry so backend inserts it
        brandsMeta.push({
          brandId: bccId, // backend only knows 'brandId'
          prescriptionCount: 1, // single image = count 1
          fileNames: [bccFile.name],
        });

        // append file under same pattern
        formData.append(`files_${bccId}[]`, bccFile);
      }

      formData.append("brandsMeta", JSON.stringify(brandsMeta));


      // 3️⃣ Upload images
      const uploadRes = await axios.post(
        `${BASEURL2}/camp/saveBrandImages`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (uploadRes.data.errorCode !== 1) {
        setPopup({ type: "error", message: uploadRes.data.message || "Error saving camp image" });
        return;
      }

      setPopup({ type: "success", message: "Camp created & images saved successfully!" });
      // handelCloseModel();
    } catch (err) {
      console.error(err);
      setPopup({ type: "error", message: "Something went wrong while submitting camp" });

    }
  };

  const handleSubmitCamp = () => {
    if (campType === "Bcc Distribution") {
      handleSubmitBcc();
    } else {
      handleSubmit();
    }
  };

  // if (!show) return null;

  return (
    <>
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
                    onChange={(event) => {
                      setCampType(event.target.value);
                    }}
                    value={campType}
                  >
                    <option value="">Select...</option>
                    {campList.map((e) => (
                      <option

                        key={e.basic_id}
                        value={e.description}
                      >
                        {e.description}
                      </option>
                    ))}
                  </select>
                  <label className="form-label did-floating-label">Type of Camp*</label>
                </div>

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

                  {campType !== "TSART Trio BP Monitor Investment" && <div className="form-group col-md-4 did-floating-label-content">
                    <select
                      className="form-control did-floating-select"
                      value={isRps}
                      onChange={(e) => setIsRps(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                    <label className="form-label did-floating-label">
                      Is Doctor Rps*
                    </label>
                  </div>}

                    {/* for bcc dist. validation will be different */}
                  <div className="form-group col-md-4 did-floating-label-content">
                    <input
                      type="date"
                      className="form-control did-floating-input"
                      onChange={handleDateChange}
                      placeholder="Camp Date"
                      value={campDate}
                      min={campType === "Bcc Distribution" ? thirtyDaysAgo : today}
                      max={campType === "Bcc Distribution" ? today : undefined}
                    />
                    <label className="form-label did-floating-label">
                      {campType === "Bcc Distribution" ? "Date of Prescription*" : "Date of Camp*"}
                    </label>
                  </div>
                  {/* <div className="form-group col-md-4 did-floating-label-content">
                    <input
                      type="date"
                      className="form-control did-floating-input"
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        const today = new Date().toISOString().split("T")[0];
                        if (selectedDate < today) {
                          setPopup({ type: "error", message: "You cannot select a date before today." });
                          return;
                        }
                        setCampDate(selectedDate);
                      }}

                      placeholder="Camp Date"
                      value={campDate}
                      // 🔴 disable dates before today:
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <label className="form-label did-floating-label">
                      Date of Camp*
                    </label>
                  </div> */}

                  {campType === "Bcc Distribution" && <div className="form-group col-md-4 did-floating-label-content">
                    <select
                      className="form-control did-floating-select"
                      value={isBccDistributed}
                      onChange={(e) => setBccDistributed(e.target.value)}
                    >
                      <option value="">Select...</option>

                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                    <label className="form-label did-floating-label">
                      Is BCC-1 Distributed*
                    </label>
                  </div>}

                  {campType === "Bcc Distribution" && <div className="form-group col-md-4 did-floating-label-content">
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

                  {campType === "Bcc Distribution" && isPrescriptionGen === "Y" && <div className="form-group col-md-6 did-floating-label-content">
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

                  {campType === "Bcc Distribution" && isPrescriptionGen === "Y" && selectedBrands.map((b) => {
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

                  {campType === "Bcc Distribution" && (
                    <div className="form-group col-md-6 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        value={selectedBCCItem?.value || ""}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          if (!selectedValue) return setSelectedBCCItem(null);
                          const selectedOption = bccOptions.find(
                            (opt) => String(opt.value) === String(selectedValue)
                          );
                          console.log("selectedOption:", selectedOption);
                          setSelectedBCCItem(selectedOption || null);
                        }}
                      >
                        <option value="">Select BCC Item...</option>
                        {bccOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="form-label did-floating-label">
                        BCC Input Distribution Images*
                      </label>
                    </div>
                  )}

                  {console.log("selectedBCCItem , : ",selectedBCCItem)}
                  {campType === "Bcc Distribution" && selectedBCCItem && (
                    <div className="row mt-3 align-items-center">
                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Upload Image for {selectedBCCItem.label}
                        </label>
                        <div className="custom-file-input-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            id={`bcc-file-${selectedBCCItem.value}`}
                            className="custom-file-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleBCCInputChange(selectedBCCItem.value, "file", file);
                              e.target.value = ""; // reset
                            }}
                          />
                          <label
                            htmlFor={`bcc-file-${selectedBCCItem.value}`}
                            className="custom-file-label"
                          >
                            {bccData[selectedBCCItem.value]?.file
                              ? bccData[selectedBCCItem.value].file.name
                              : "Choose Image..."}
                          </label>
                        </div>
                      </div>

                      <div className="col-md-8 d-flex flex-wrap">
                        {bccData[selectedBCCItem.value]?.file && (
                          <div className="preview-container me-2 mb-2">
                            <img
                              src={URL.createObjectURL(bccData[selectedBCCItem.value].file)}
                              alt="Preview"
                              className="preview-img"
                            />
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() =>
                                handleBCCInputChange(selectedBCCItem.value, "file", null)
                              }
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}




                {/* {campType === "TSART Trio BP Monitor Investment" && <div className="col-md-4">
                  <label className="form-label did-floating-label">
                    Upload Camp Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setCampImage(e.target.files[0])} // store File object']
                    placeholder="Choose file*"
                  />
                </div>} */}


              </form>

              <div className="text-center">

                <button
                  type="button"
                  className="btn btn-success mx-auto"
                  onClick={handleSubmitCamp}
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

export default AddMyCampModal;