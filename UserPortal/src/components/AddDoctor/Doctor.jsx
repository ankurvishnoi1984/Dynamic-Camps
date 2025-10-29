import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL, IMG_SIZE, PageCount } from "../constant/constant";
import ConfirmationPopup from "../popup/Popup";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import { Link } from "react-router-dom";
import "./Doctor.css";
import CropImg from "../utils/CropImg";
const Doctor = () => {
  //const [searchQuery, setSearchQuery] = useState("");

  const userId = sessionStorage.getItem("userId");
  const empId = sessionStorage.getItem("empId");
  const role = sessionStorage.getItem("role");
  const [doctorList, setDoctorList] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [campDate, setCampDate] = useState("");
  const [campVenue, setCampVenue] = useState("");
  const[campType,setCampType] = useState("");
  const[campList,setCampList] = useState([]);
  const [hq,setHq] = useState('');
  const [campTime, setCampTime] = useState('')
  const [speciality, setSpeciality] = useState("");
  const [img, setImage] = useState("");
  const [img1, setImage1] = useState("");
  const [wellness , setWellness] = useState("");
  const [warrior, setWarrior] = useState("");

  const [addDoctorModel, setAddDoctorModel] = useState(false);
  const [editDoctorModel, setEditDoctorModel] = useState(false);
  const [editId, setEditId] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cropmodel, setCropmodel] = useState(false);
  const [cropper, setCropper] = useState("");

  const getCropData = async () => {
    if (cropper) {
      const file = await fetch(cropper.getCroppedCanvas().toDataURL())
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], "docimage.png");
        });
      if (file) {
        setImage(file);
      }
    }
    setCropmodel(false);
  };

  const setCropperFun = (cropvalue) => {
    setCropper(cropvalue);
  };

  const handelAddDoctor = () => {
    setAddDoctorModel(true);
  };

  const handelCloseModel = async () => {
    setAddDoctorModel(false);
  };

  const getDoctor = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASEURL}/doc/getDoctorList`, { empcode:empId });
      setDoctorList(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

    const getCampList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getCampType`);
      setCampList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handelAddDoctorData = async (event) => {
    event.preventDefault();
    // Validate required fields
    if (!doctorName || !img || !campDate || !campVenue ||!campTime || !campType) {
      toast.error("Missing Required Field");
      return;
    }

    const fileSize = img.size / (1024 * 1024);
    if (fileSize > IMG_SIZE) {
      toast.error(`File size exceeds ${IMG_SIZE}MB. Please upload a smaller image.`);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("image", img);
      formData.append("doctorName", doctorName);
      formData.append("campDate", campDate);
      formData.append("campTime", campTime);
      formData.append("campVenue", campVenue);
      formData.append("wellness", wellness);
      formData.append("warrior", warrior);
      formData.append("userId", userId);
      formData.append("campType",campType)
      const doctorResponse = await axios.post(
        `${BASEURL}/doc/addDoctor`,
        formData
      );
      if (doctorResponse?.data?.errorCode == 1) {
        setDoctorName("");
        setImage("");
        setCampDate("");
        setCampTime("");
        setCampVenue("");
        setWarrior("");
        setWellness("");
        setCampType("");
        setAddDoctorModel(false);
        getDoctor();
        toast.success("Doctor added successfully");
      }
    } catch (error) {
      console.error("Error in adding doctor:", error);
      toast.error("Error In Adding Doctor");
    }
  };
  useEffect(() => {
    getDoctor();
    getCampList();
  }, []);

  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(`${BASEURL}/report/deleteDoctor`, {
        doctorId: delId,
      });

      if (res.data.errorCode == "1") {
        toast.success("Doctor Deleted Successfully");
        getDoctor();
        setDelId("");
      } else {
        toast.error(`Failed to delete Doctor with ID ${delId}`);
      }
    } catch (error) {
      toast.error("Error in deleting doctor");
      console.log(error.message);
    }
  };

  // const handleSearchChange = (event) => {
  //   setSearchQuery(event.target.value);
  // };

  return loading ? (
    <Loader />
  ) : (
    <>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            {/* <div className="d-sm-flex align-items-center justify-content-end mb-4">
              <form className="d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group mt-4">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search."
                    aria-label="Search."
                    aria-describedby="basic-addon2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
            </div> */}

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="m-3">
                    <button
                      type="button"
                      //className={`btn ${doctorList.length>15 ? "btn-dis":"btn-success"}`}
                      className="btn  btn-success"
                      onClick={handelAddDoctor}
                    >
                      <i className="bx bx-plus"></i> Add Doctor
                    </button>
                  </div>
                  <hr />
                  <div className="row">
                    {doctorList &&
                      doctorList.map((doctor, i) => {
                        return (
                          <DoctorList
                            key={i}
                            uploadFile={""}
                            getDoctor={getDoctor}
                            doctor={doctor}
                            campList = {campList}
                          ></DoctorList>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {addDoctorModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog1">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Doctor</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form id="formlogin" onSubmit={handelAddDoctorData}>
                    <div id="Register" className="AddDocMain text-cente">
                      <div className="docphoto">
                        <div className=" text-center">
                          <img
                            src={
                              img
                                ? URL.createObjectURL(img)
                                : "/images/userimg.png"
                            }
                            alt=""
                            className="avatar1"
                          />
                          <label htmlFor="upload-input">
                            <div className="icon-container">
                              <i className="bi bi bi-pencil-square"></i>
                            </div>
                          </label>
                          <input
                            id="upload-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              setCropmodel(true);
                              setImage1(URL.createObjectURL(e.target.files[0]));
                            }}
                            style={{ display: "none" }}
                          />
                          <p>Doctor Photo</p>
                        </div>
                      </div>
                      <div className="docform">
                        <div className="row">
                          <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              maxLength={25}
                              value={doctorName}
                              onChange={(e) => {
                                setDoctorName(e.target.value);
                              }}
                              placeholder="Doctor Name"
                            />
                            <label className="form-label did-floating-label">
                              Doctor Name
                            </label>
                          </div>

                          <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              value={campVenue}
                                  onChange={(e) => {
                                    setCampVenue(e.target.value);
                                  }}
                              placeholder="Address"    
                            />
                            <label className="form-label did-floating-label">
                              Address
                            </label>
                          </div>

                          <div className="form-group col-md-6 did-floating-label-content">
                            <input
                             onClick={()=> document.getElementById('docDate').showPicker()}
                              id="docDate"
        
                              type="date"
                              className="form-control did-floating-input"
                              value={campDate}
                              onChange={(e) => {
                                setCampDate(e.target.value);
                              }} 
                              placeholder="Camp Date"   
                            />
                            <label className="form-label did-floating-label">
                              Camp Date
                            </label>
                          </div>
                          <div className="form-group col-md-6 did-floating-label-content">
                            <input
                             onClick={()=> document.getElementById('docTime').showPicker()}
                              id="docTime"
        
                              type="time"
                              className="form-control did-floating-input"
                              value={campTime}
                              onChange={(e) => {
                                setCampTime(e.target.value);
                              }} 
                              placeholder="Camp Date"   
                            />
                            <label className="form-label did-floating-label">
                              Camp Time
                            </label>
                          </div>

                           <div className="form-group col-md-6 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={(e) => {
                          setCampType(e.target.value);
                        }}
                        value={campType}
                      >
                        <option value="">Select...</option>
                        {campList.map((e) => (
                          <option
                          
                          key={e.basic_id}
                          value={e.basic_id}
                          >
                            {e.description}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Type of Camp</label>
                    </div>
                         
                         {/* <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              maxLength={25}
                                  value={warrior}
                                  onChange={(e) => {
                                    setWarrior(e.target.value);
                                  }}
                              placeholder="Seizure Warrior"
                            />
                            <label className="form-label did-floating-label">
                             Seizure Warrior
                            </label>
                          </div>

                          <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              value={wellness}
                                  onChange={(e) => {
                                    setWellness(e.target.value);
                                  }}
                              placeholder="Wellness Champion"    
                            />
                            <label className="form-label did-floating-label">
                             Wellness Champion
                            </label>
                          </div> */}
 
                          
                        </div>
                        

                        <div className="text-center mt-3">
                          <input
                            type="submit"
                            value="Submit"
                            id="Login1"
                            className="docbtn btn btn-success"
                          />
                          <span className="error regspan"></span>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#ca1111",
                              textAlign: "left",
                              fontWeight: "700",
                            }}
                          >
                           
                            <br />* Image size should be less than 5 MB
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                  {cropmodel && (
                    <CropImg
                      img1={img1}
                      setCropperFun={setCropperFun}
                      getCropData={getCropData}
                      closePopup={() => setCropmodel(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {showDeleteConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Doctor?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default Doctor;

function DoctorList({ doctor, getDoctor,campList }) {
  const [img, setImage] = useState(null);
  const [doctorName, setDoctorName] = useState(doctor.doctor_name);
  const [campDate, setCampDate] = useState(doctor.camp_date1);
  const [campVenue, setCampVenue] = useState(doctor.camp_venue);
  const[campType,setCampType] = useState(doctor.camp_type || "");
  //const [address, setAddress] = useState(doctor.address);
  //const [hospital, setHospital] = useState(doctor.hospital);
  const [campTime, setCampTime] = useState(doctor.camp_time);
  //const [warrior, setWarrior] = useState(doctor.warrior)

  //const [birthdate1, setBirthdate] = useState(formattedDateStr1);
  //const [qualification, setQualification] = useState(doctor.qualification);
  //const [wellness, setWellness] = useState(doctor.wellness);
  //const [mclcode, setMclcode] = useState(doctor.mclcode);
  const [cropmodel, setCropmodel] = useState(false);
  const [img1, setImage1] = useState("");
  const [cropper, setCropper] = useState("");
  const [loading1, setLoading1] = useState(false);
  const [delId, setDelId] = useState("");
  const [delConfirmation, setDelConfirmation] = useState(false);
  const [infoModel, setInfoModel] = useState(false);
  const [editModel, setEditModel] = useState(false);
  const [editId, setEditId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getCropData = async () => {
    if (cropper) {
      const file = await fetch(cropper.getCroppedCanvas().toDataURL())
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], "docimage.png");
        });
      if (file) {
        setImage(file);
      }
    }
    setCropmodel(false);
  };

  const setCropperFun = (cropvalue) => {
    setCropper(cropvalue);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    //setShowConfirmation(true);
    // setEditId(id)
    setEditModel(true);
  };

  const handleEditConformation = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handelCloseEditModel = () => {
    setEditModel(false);
    setEditId("");
  };

  const handelDelete = async (id) => {
    setDelId(id);
    setDelConfirmation(true);
  };

  const handleConfirmDel = async () => {
    const id = delId;
    try {
      const res = await axios.post(`${BASEURL}/doc/deleteDoctor`, {
        doctorId: id,
      });
      if (res.data.errorCode == 1) {
        toast.success("Doctor delete successfully");
      }
      await getDoctor();
    } catch (error) {
      console.log(error);
    } finally {
      setDelConfirmation(false);
    }
  };

  const  getCampTypeId =(campList, campType)=> {
  const camp = campList.find(item => item.description === campType);
  return camp ? camp.basic_id : null; // return null if not found
}


  const handleConfirm = async (id) => {
    setShowConfirmation(false);
    setLoading1(true);
    try {
      if (
        !doctorName ||
        !campDate ||
        !campVenue ||
        !campTime ||
        !campType
        
      ) {
        toast.error("Missing Required Field");
        return;
      }
      const formData = new FormData();
      formData.append("image", img);
      formData.append("doctorName", doctorName);
      formData.append("campDate", campDate);
      formData.append("campTime", campTime);
      formData.append("campVenue", campVenue);
      // map campType with the campList before appending
      formData.append("campType",getCampTypeId(campList,campType))
      //formData.append("warrior", warrior);
      //formData.append('wellness',wellness);
      formData.append("doctorId", id);
      formData.append("doctorImg", doctor.doctor_img);

      console.log("formdata", formData);
      const doctorPromise = await axios.post(
        `${BASEURL}/doc/updateDoctor`,
        formData
      );
      console.log("doctor promise", doctorPromise);
      await getDoctor();
      toast.success("Doctor Update successfully");
    } catch (error) {
      console.log(error);
    } finally {
      // Hide the loader when the operation is complete
      setLoading1(false);
    }
  };
  const handleCancel = () => {
    // Hide the confirmation popup
    setShowConfirmation(false);
    // Handle cancellation as needed...
  };

  const handleCancelDel = () => {
    // Hide the confirmation popup
    setDelConfirmation(false);
    // Handle cancellation as needed...
  };

  const handelShowInfo = () => {
    setInfoModel(true);
  };

  const handelCloseInfoModel = () => {
    setInfoModel(false);
  };

  return (
    <div className="col-md-2 p-1">
      {loading1 ? (
        <Loader />
      ) : (
        <div className="card doc_card">
          <div style={{ position: "relative" }}>
            <div className="img__wrap text-center">
              <img
                id=""
                src={`${BASEURL}/uploads/profile/${doctor.doctor_img}`}
                width="199"
                height="177"
                className="img__img"
              />

              <div id="outer" className="img__description">
                <div className="inner">
                  <Link to={`/addDoctor/poster/${doctor.doctor_id}`} title="View">
                    <i className="nav-icon bi bi-file-earmark-image"></i>
                  </Link>
                </div>

                <div className="inner">
                  <a title="Info" onClick={handelShowInfo}>
                    <i className="nav-icon bi bi-info-circle"></i>
                  </a>
                </div>

                <div className="inner">
                  <a href="" title="Edit" onClick={handleEdit}>
                    <i className="nav-icon bi bi-pencil-square"></i>
                  </a>
                </div>

                <div className="inner">
                  <a
                    onClick={() => handelDelete(doctor.doctor_id)}
                    title="Delete"
                  >
                    <i className="nav-icon bi bi-trash3"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body ">
            <h5
              className="card-title text-center"
              style={{ fontSize: "1.0rem" }}
            >
              <b>{doctor.doctor_name}</b>
            </h5>
          </div>
        </div>
      )}

      {delConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Doctor?"
          onConfirm={() => handleConfirmDel()}
          onCancel={handleCancelDel}
        />
      )}

      {infoModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog1 modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Doctor Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div id="Register" className="AddDocMain text-cente">
                      <div className="docphoto">
                        <div className=" text-center">
                          <img
                            src={`${BASEURL}/uploads/profile/${doctor.doctor_img}`}
                            alt="doctor-photo"
                            className="avatar1"
                          />
                          <p>Doctor Photo</p>
                        </div>
                      </div>
                      <div className="docform">
                        <div className="row g-3">

                    <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Name"
                        value={doctor.doctor_name}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Doctor Name
                      </label>
                    </div>

                    

                    <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Address"
                        value={doctor.camp_venue}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Address
                      </label>
                    </div>
                          
                    <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Date"
                        value={doctor.camp_date}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Camp Date
                      </label>
                    </div>

                    <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Time"
                        value={doctor.camp_time1}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Camp Time
                      </label>
                    </div>
                     <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Time"
                        value={doctor.camp_type}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Camp Type
                      </label>
                    </div>

                    {/* <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Speciality"
                        value={doctor.warrior}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Seizure Warrior
                      </label>
                    </div> */}

                    {/* <div className="col-md-6 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Hq"
                        value={doctor.wellness}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Wellness Champion
                      </label>
                    </div> */}
                    
                        </div>
    
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog1 modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Doctor</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form id="formlogin" onSubmit={handleEditConformation}>
                    <div id="Register" className="AddDocMain text-cente">
                      <div className="docphoto">
                        <div className=" text-center">
                          <img
                            src={
                              img
                                ? URL.createObjectURL(img)
                                : `${BASEURL}/uploads/profile/${doctor.doctor_img}`
                            }
                            alt=""
                            className="avatar1"
                          />
                          <label htmlFor="upload-input">
                            <div className="icon-container">
                              <i className="bi bi bi-pencil-square"></i>
                            </div>
                          </label>
                          <input
                            id="upload-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              setCropmodel(true);
                              setImage1(URL.createObjectURL(e.target.files[0]));
                            }}
                            style={{ display: "none" }}
                          />
                          <p>Doctor Photo</p>
                        </div>
                      </div>
                      <div className="docform">
                        <div className="row">
                          
                        <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                           
                              value={doctorName}
                                  onChange={(e) => {
                                    setDoctorName(e.target.value);
                                  }}
                              placeholder="Doctor Name"
                            />
                            <label className="form-label did-floating-label">
                              Doctor Name
                            </label>
                        </div>

                        

                        <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                           
                              value={campVenue}
                                  onChange={(e) => {
                                    setCampVenue(e.target.value);
                                  }}
                              placeholder="Address"
                            />
                            <label className="form-label did-floating-label">
                              Address
                            </label>
                        </div>

                        <div className="form-group col-md-6 did-floating-label-content">
                            <input
                            onClick={()=> document.getElementById('editDate').showPicker()}
                              id="editDate"
                              type="date"
                              className="form-control did-floating-input"
                             
                              value={campDate}
                                  onChange={(e) => {
                                    setCampDate(e.target.value);
                                  }}
                              placeholder="Camp Date"
                            />
                            <label className="form-label did-floating-label">
                              Camp Date
                            </label>
                        </div>

                      
                        <div className="form-group col-md-6 did-floating-label-content">
                            <input
                            onClick={()=> document.getElementById('editTime').showPicker()}
                              id="editTime"
                              type="time"
                              className="form-control did-floating-input"
                             
                              value={campTime}
                                  onChange={(e) => {
                                    setCampTime(e.target.value);
                                  }}
                              placeholder="Camp Time"
                            />
                            <label className="form-label did-floating-label">
                              Camp Time
                            </label>
                        </div>

                         <div className="form-group col-md-6 did-floating-label-content">
                          
                      <select
                        className="form-control did-floating-select"
                        onChange={(e) => {
                          setCampType((e.target.value));
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
                        <label className="form-label did-floating-label">Type of Camp</label>
                        {/* <p>{doctor.camp_type}</p> */}
                    </div>
                          
                          {/* <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              
                              value={warrior}
                                  onChange={(e) => {
                                    setWarrior(e.target.value);
                                  }}
                              placeholder="Seizure Warrior"
                            />
                            <label className="form-label did-floating-label">
                              Seizure Warrior
                            </label>
                        </div> */}

                        {/* <div className="form-group col-md-6 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                           
                              value={wellness}
                                  onChange={(e) => {
                                    setWellness(e.target.value);
                                  }}
                              placeholder="Wellness Champion"
                            />
                            <label className="form-label did-floating-label">
                              Wellness Champion
                            </label>
                        </div> */}
                        

                        </div>
                        

                        <div className="text-center mt-3">
                          <input
                            type="submit"
                            value="Submit"
                            id="Login1"
                            className="docbtn btn btn-success"
                          />
                          <span className="error regspan"></span>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#ca1111",
                              textAlign: "left",
                              fontWeight: "700",
                            }}
                          >
                      
                            <br /> Image size should be less than 5 MB
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>

                  {cropmodel && (
                    <CropImg
                      img1={img1}
                      setCropperFun={setCropperFun}
                      getCropData={getCropData}
                      closePopup={() => setCropmodel(false)}
                    />
                  )}

                  {showConfirmation && (
                    <ConfirmationPopup
                      message="Are you sure you want to Edit Doctor?"
                      onConfirm={() => handleConfirm(doctor.doctor_id)}
                      onCancel={handleCancel}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
