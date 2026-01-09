import "./Poster.css";
import { FiEye, FiInfo, FiEdit, FiPlus } from "react-icons/fi";
import { AddDoctorModal } from "./AddDoctorModal";
import { useEffect, useState } from "react";
import { DeptId, BASEURL2 } from "../constant/constant"
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import { InfoDoctorModal } from "./InforDoctorModal";


export const Poster = () => {
  const [openModal, setOpenModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = sessionStorage.getItem("userId");
  const [infoModal, setInfoModal] = useState(false);
  const [infoData, setInfoData] = useState({});

  const getDoctorsList = async () => {
    setLoading(true)
    const req = { deptId: DeptId, userId, subCatId: 1 }

    try {
      const res = await axios.post(`${BASEURL2}/poster/getAllPosterDoctorsByEmp`, req)
      setDoctorsList(res.data.data)
      console.log("getAllPosterDoctorsByEmp", res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const handleOpenInfoModal = (doc) => {
    setInfoData(doc);
    setInfoModal(true);
  }

  useEffect(() => {
    getDoctorsList();
  }, [])

  return (
    <>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            <div>
              <div className="poster-page">
                {/* Header */}
                <div className="poster-header">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="search-input"
                  />

                  <button
                    className="add-btn"
                    onClick={() => setOpenModal(true)}
                  >
                    <FiPlus size={18} />
                    <span>Add Doctor</span>
                  </button>
                </div>

                {/* Cards */}
                <div className="doctor-grid">
                  {doctorsList.map((doc) => (
                    <div className="doctor-card" key={doc.doctor_id}>
                      <div className="avatar">
                        <img src={`${BASEURL2}/uploads/profile/${doc.doctor_img}`} alt={doc.doctor_name} />
                      </div>

                      <h3>{doc.doctor_name}</h3>

                      <div className="card-actions">
                        <button title="View">
                          <Link to={`viewPoster/${doc.doctor_id}`} title="View">
                            <FiEye size={18} />
                          </Link>
                        </button>
                        <button title="Info" onClick={() => handleOpenInfoModal(doc)}>
                          <FiInfo size={18} />
                        </button>
                        <button title="Edit">
                          <FiEdit size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ✅ MODAL MUST BE HERE */}
      <AddDoctorModal
        open={openModal}
        getDoctorList={getDoctorsList}
        onClose={() => setOpenModal(false)}
      />
      <InfoDoctorModal
        infoData={infoData}
        open={infoModal}
        getDoctorList={getDoctorsList}
        onClose={() => setInfoModal(false)}
      />
    </>
  );
};

