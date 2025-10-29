import { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import useAbmCampList from "../CustomHook/useAbmCampList";
import Popup from "./Popup";

const AddMyCampAbmModal = ({ handelCloseModel }) => {

    const [campList] = useAbmCampList();
    const [campType, setCampType] = useState("");
    const [doctorId, setDoctorId] = useState('');
    const [doctorList, setDoctorList] = useState([]);
    const [campDate, setCampDate] = useState("");
    const [speciality, setSpeciality] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [angioplastyCount, setAngioplastyCount] = useState("");
    const [tPotential, setTPotentail] = useState("");
    const [currentBusiness, setCurrentBusiness] = useState("");
    const [expBusiness, setExpBusiness] = useState("");
    const [isTicavicAvl, setTicavicAvl] = useState("N");
    const [hospitalType, setHospitalType] = useState("");
    const [paxCount, setPaxCount] = useState("");
    const [popup, setPopup] = useState(null);
    const empId = sessionStorage.getItem("empId");



    console.log("campList",campList);


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
    }, []);

    const handelDoctorChange = (event) => {
        let docId = event.target.value
        if (docId) {
            setDoctorId(docId)
            const doctor = doctorList.find((e) => e.doctor_id == docId);
            setSpeciality(doctor.speciality);
            setCampDate(doctor.camp_date);
        }
        else {
            setDoctorId('')
            setSpeciality('');
            setIsRps("")
            setCampDate('');
        }

    }

    const handleSubmit = async () => {

         if (!campType || !doctorId || !campDate
         ) {
      setPopup({
        type: "error",
        message: "Please fill all required fields (Type, Doctor, Date).",
      });
      return;
    }

        try {
            let url = "";
            let payload = {
                doctorId,
                date: campDate,
                userId,
            };

            if (campType === "ABPM") {
                url = `${BASEURL2}/camp/addAbpmCamp`;
            } else if (campType === "HbA1c") {
                url = `${BASEURL2}/camp/addHba1cCamp`;
            } else if (campType === "Cathlab") {
                url = `${BASEURL2}/camp/addCathlabCamp`;

                // append Cathlab-specific fields
                payload = {
                    ...payload,
                    hospitalName,
                    angioplastyCount,
                    paxCount,
                    tPotential,
                    currentBusiness,
                    expectedBusiness: expBusiness, // ensure expBusiness is your state variable
                    isTicavicAvl,
                    hospitalType,
                };
            }

            const res = await axios.post(url, payload);
console.log("res.data",res.data);

            // ✅ adjust to your backend’s success code
            if (res.data.status !== "SUCCESS") {
                setPopup({ type: "error", message: res.data.message || "Error creating camp" });
                return;
            }

            // handelCloseModel(); // rename accordingly
            setPopup({ type: "success", message: "My Camp added successfully!" });
        } catch (error) {
            console.error(error);
             setPopup({ type: "error", message: "Something went wrong while submitting camp" });

        }
    };

    const isFormValid = () => {
        // basic required fields
        if (!doctorId || !campDate || !userId) return false;

        if (campType === "Cathlab") {
            // check for empty string/null/undefined on text fields
            const isHospitalNameValid = hospitalName !== "" && hospitalName !== null && hospitalName !== undefined;
            const isHospitalTypeValid = hospitalType !== "" && hospitalType !== null && hospitalType !== undefined;
            const isTicavicAvlValid = isTicavicAvl !== "" && isTicavicAvl !== null && isTicavicAvl !== undefined;

            // check for NaN on numeric fields
            const isAngioplastyCountValid = angioplastyCount !== "" && angioplastyCount !== null && !isNaN(angioplastyCount);
            const isPaxCountValid = paxCount !== "" && paxCount !== null && !isNaN(paxCount);
            const isTPotentialValid = tPotential !== "" && tPotential !== null && !isNaN(tPotential);
            const isCurrentBusinessValid = currentBusiness !== "" && currentBusiness !== null && !isNaN(currentBusiness);
            const isExpBusinessValid = expBusiness !== "" && expBusiness !== null && !isNaN(expBusiness);

            return (
                isHospitalNameValid &&
                isAngioplastyCountValid &&
                isPaxCountValid &&
                isTPotentialValid &&
                isCurrentBusinessValid &&
                isExpBusinessValid &&
                isTicavicAvlValid &&
                isHospitalTypeValid
            );
        }

        // for ABPM / HbA1c, etc.
        return true;
    };




    // if (!show) return null;

    return ( <>
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
                                        onChange={(event) => setCampType(event.target.value)}
                                        value={campType}
                                    >
                                        <option value="">Select...</option>
                                        {Array.isArray(campList) &&
                                            campList.map((e) => (
                                                <option key={e.basic_id} value={e.description}>
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
                                        {Array.isArray(doctorList) &&
                                            doctorList.map((e) => (
                                                <option key={e.doctor_id} value={e.doctor_id}>
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

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="text"
                                        className="form-control did-floating-input"
                                        placeholder="Hospital Name*"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Hospital Name*</label>
                                </div>}

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        placeholder="Number of Angioplasty*"
                                        value={angioplastyCount}
                                        onChange={(e) => setAngioplastyCount(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Number of Angioplasty*</label>
                                </div>}

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        placeholder="Total Ticagrelor Potential*"
                                        value={tPotential}
                                        onChange={(e) => setTPotentail(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Total Ticagrelor Potential*</label>
                                </div>}

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        placeholder="Number of Pax*"
                                        value={paxCount}
                                        onChange={(e) => setPaxCount(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Number of Pax*</label>
                                </div>}

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        placeholder="Current Business*"
                                        value={currentBusiness}
                                        onChange={(e) => setCurrentBusiness(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Current Business*</label>
                                </div>}

                                {campType === "Cathlab" && <div className="form-group col-md-4 did-floating-label-content">
                                    <input
                                        type="number"
                                        className="form-control did-floating-input"
                                        placeholder="Expected Business*"
                                        value={expBusiness}
                                        onChange={(e) => setExpBusiness(e.target.value)}
                                    />
                                    <label className="form-label did-floating-label">Expected Business*</label>
                                </div>}


                                <div className="form-group col-md-4 did-floating-label-content">
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
                                          min={new Date().toISOString().split("T")[0]}
                                    />
                                    <label className="form-label did-floating-label">
                                        {campType === "Cathlab" ? "Cathlab Meeting Date*" : "Camp Date*"}
                                    </label>
                                </div>

                                {campType === "Cathlab" &&
                                    <div className="form-group col-md-4 did-floating-label-content">
                                        <select
                                            className="form-control did-floating-select"
                                            value={isTicavicAvl}
                                            onChange={(e) => setTicavicAvl(e.target.value)}
                                        >
                                             <option value="">Select...</option>
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                        <label className="form-label did-floating-label">
                                            Is Ticavic available?*
                                        </label>
                                    </div>
                                }

                                {campType === "Cathlab" &&
                                    <div className="form-group col-md-4 did-floating-label-content">
                                        <select
                                            className="form-control did-floating-select"
                                            value={hospitalType}
                                            onChange={(e) => setHospitalType(e.target.value)}
                                        >
                                             <option value="">Select...</option>
                                            <option value="Y">Discounted</option>
                                            <option value="N">Non-Discounted</option>
                                        </select>
                                        <label className="form-label did-floating-label">
                                            Hospital Type*
                                        </label>
                                    </div>
                                }

                            </form>

                            <div className="text-center">

                                {/* <button
                                    type="button"
                                    className="btn btn-success mx-auto"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button> */}

                                <button
                                    onClick={handleSubmit}
                                  
                                    className={'btn btn-success mx-auto'}
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

export default AddMyCampAbmModal;