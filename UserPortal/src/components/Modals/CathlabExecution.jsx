import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import "./CustomCss.css";
import Popup from "./Popup";


const CathlabExecution = ({ crid, show, handelCloseEditModal, campReportList }) => {
    const campData = campReportList.find(
        (el) => Number(el.crid) === Number(crid)
    );

    const [brandOptions, setBrandOptions] = useState([]); // options for react-select
    const [selectedBrands, setSelectedBrands] = useState([]); // array of {value,label}
    const [brandData, setBrandData] = useState({}); // {brandName: {count,file}}
    const [isPrescriptionGen, setisPrescriptionGen] = useState("")
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const doctorOptions = doctorsList.map(d => ({
        value: d.doctor_id,
        label: d.doctor_name
    }));
  const [popup, setPopup] = useState(null);
  const empId = sessionStorage.getItem("empId");



    const userId = sessionStorage.getItem("userId");

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
                console.log("brands res", res)
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

    const getDoctorList = async () => {
        try {
            const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId });
            setDoctorsList(res?.data?.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getBrandList();
        getDoctorList();
    }, []);


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
        if (!isPrescriptionGen || !selectedDoctors || !userId) {
            setPopup({
                type: "error",
                message: "Please fill all required fields.",
            });
            return;
        }
        const transformedDoctorsData = selectedDoctors.map(d => ({
            id: d.value,
            name: d.label
        }));
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
           
            const res1 = await axios.post(`${BASEURL2}/camp/executeCathlabCamp`, {
                campId: crid,
                userId: userId,
                isPrescriptionGen: isPrescriptionGen,
                noOfAttendees: transformedDoctorsData,
            });

            if (Number(res1.data.errorCode) !== 1) {
                setPopup({ type: "error", message: res1.data.message || "Error executing camp" });
                return;
            }

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

            if (res2.data.errorCode !== 1) {
                setPopup({ type: "error", message: res2.data.message || "Error saving image" });
                return;
            }

            // handelCloseEditModal();
            setPopup({ type: "success", message: "My Camp added successfully!" });
        } catch (error) {
            console.error(error);
            setPopup({ type: "error", message: "Something went wrong while submitting camp" });
        }
    };


    if (!show) return null;

    return (<>
        <div className="addusermodel">
            <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Start Execution</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handelCloseEditModal}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <form className="row g-3">
                                {/* doctor */}
                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        value={campData.doctor_name}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Doctor Name
                                    </label>
                                </div>

                                {/* speciality */}
                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        value={campData.speciality}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Speciality
                                    </label>
                                </div>
                                 <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        value={campData.garnet_code}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                      Garnet Code
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        value={campData.hospital_name}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Hospital Name*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        value={campData.angioplasty_count}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Number of Angioplasty*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        value={campData.total_ticagrelor_potential}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Total Ticagrelor Potential*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        value={campData.pax_count}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Number of Pax*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        value={campData.current_business}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Current Business*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        value={campData.expected_business}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Expected Business*
                                    </label>
                                </div>

                                {/* camp date */}
                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="Camp Date"
                                        value={campData.camp_date1}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Camp Meeting Date*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="Camp Date"
                                        value={campData.is_ticavic_avl === "Y" ? "Yes" : "No"}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Is Ticavic Available?*
                                    </label>
                                </div>

                                <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="Camp Date"
                                        value={campData.hospital_type === "Y" ? "Discounted" : "Non discounted"}
                                        readOnly
                                    />
                                    <label className="form-label did-floating-label">
                                        Hospital Type*
                                    </label>
                                </div>

                                <div className="form-group col-md-6">
                                    <Select
                                        isMulti
                                        options={doctorOptions}
                                        value={selectedDoctors}
                                        onChange={setSelectedDoctors}
                                        placeholder="Number of Attendees...*"
                                        menuPosition="fixed"
                                    />
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

                                {/* Select Brands with react-select */}
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

                                </div>}
                            </form>
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

                            <div className="text-center mt-4">
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
        handelCloseEditModal();
      }
    }}
  />
)}
        </>
    );
};

export default CathlabExecution;
