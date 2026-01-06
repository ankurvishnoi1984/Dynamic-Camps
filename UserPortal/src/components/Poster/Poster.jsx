import "./Poster.css";
import { FiEye, FiInfo, FiEdit, FiPlus } from "react-icons/fi";
import { AddDoctorModal } from "./AddDoctorModal";
import { useState } from "react";
const doctors = [
  {
    id: 1,
    name: "Dr. Amit",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Dr. Amit S",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 3,
    name: "Dr. Mohit",
    image: "https://randomuser.me/api/portraits/men/64.jpg",
  },
  {
    id: 4,
    name: "Dr. Rajesh",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: 5,
    name: "Dr. Rajesh Mishra",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
  },
];

export const Poster = () => {
  const [openModal, setOpenModal] = useState(false);

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
                  {doctors.map((doc) => (
                    <div className="doctor-card" key={doc.id}>
                      <div className="avatar">
                        <img src={doc.image} alt={doc.name} />
                      </div>

                      <h3>{doc.name}</h3>

                      <div className="card-actions">
                        <button title="View">
                          <FiEye size={18} />
                        </button>
                        <button title="Info">
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
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

