import { useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import "./Clients.css";
import Loader from "../utils/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect } from "react";
import axios from "axios";
import { BASEURL2, CLIENTID, DEPTID } from "../constant/constant";


const Clients = () => {
    const empcode = sessionStorage.getItem("empcode");
    const [myCampDetails, setMyCampDetails] = useState([]);
    const [campTypeList, setCampTypeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const userId = sessionStorage.getItem("userId");
    const [clientName, setClientName] = useState(null);
      const [clientLogo, setClientLogo] = useState(null);
          const [spokePersonName, setSpokePersonName] = useState(null);
              const [spokePersonContact, setSpokePersonContact] = useState(null);
    const [showEditModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [newStatus, setNewStatus] = useState("Y");

  const [clientDetails,setClientDetails]= useState([]);

  const handleStatusUpdate = (camp)=>{
        setSelectedCamp(camp);
        setNewStatus(camp.is_active === "Y" ? "N" : "Y");
        setShowConfirmModal(true);
  }

  const handleStatusConfirm = () => {
    const payload = {
      userId,
      campId: selectedCamp.camp_id,
      status: newStatus
    }
    const endpoint = `${BASEURL2}/monthlyCamps/manageCampStatus`;
    axios
      .post(endpoint, payload)
      .then((res) => {
        alert(res.data.message || "Status Updated successfully!");
        setShowConfirmModal(false);
        getMonthlyCampDetails(); // refresh list
        setOpenActionId(null);
      })
      .catch((err) => {
        console.error("Error saving camp:", err);
        alert("Error while saving camp");
      });
  }


  const handleEditMonthlyCamp = (camp) => {
    setEditData(camp);
    setEditModal(true);
    setOpenActionId(null);
  };


    const [campName, setCampName] = useState("");
    const [campTypeId, setCampTypeId] = useState("");
    const [fields, setFields] = useState([
        {
            label: "",
            field_type: "text",
            is_required: "Y",
            options_json: null,
            order_index: 1,
        },
    ]);

    const getMonthlyCampDetails = async () => {
        setLoading(true)

        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/getMonthlyCampsList`)
            setMyCampDetails(res.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }


  const getClientDetails = async () => {
    setLoading(true)

    try {
      const res = await axios.post(`${BASEURL2}/client/getClientDetails`)
      setClientDetails(res.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

    const getCampTypeList = async () => {
        setLoading(true)

        try {
            const res = await axios.post(`${BASEURL2}/monthlyCamps/getAllCampType`)
            setCampTypeList(res.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const handleFieldChange = (index, key, value) => {
        const updated = [...fields];
        updated[index][key] = value;

        // Reset options_json if not dropdown
        if (key === "field_type" && value !== "dropdown") {
            updated[index].options_json = null;
        }
        setFields(updated);
    };

    const handleAddField = () => {
        setFields([
            ...fields,
            {
                label: "",
                field_type: "text",
                is_required: "Y",
                options_json: null,
                order_index: fields.length + 1,
            },
        ]);
    };

    const handleRemoveField = (index) => {
        const updated = fields.filter((_, i) => i !== index);
        setFields(updated);
    };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation (optional)
  if (!clientName || !clientLogo || !spokePersonName || !spokePersonContact) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append("clientName", clientName);
    formData.append("coName", spokePersonName);
    formData.append("coContact", spokePersonContact);
    formData.append("userId", userId); // assuming you have it from session/context
    formData.append("logo", clientLogo); // attach the image

    // API call
    const response = await fetch(`${BASEURL2}/client/addNewClient`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.errorCode === 1) {
      alert("Client created successfully!");
      setShowModal(false);
      // Optionally refresh client list
      getClientDetails();
    } else {
      alert(data.details || "Failed to create client");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Something went wrong while creating client");
  }
};



    useEffect(() => {
        getMonthlyCampDetails();
        getCampTypeList();
        getClientDetails();
    }, [])

    return loading ? (
        <Loader />
    ) : (
        <div className="container-fluid">
            <div className="card shadow mb-4">
                <div className="card-header text-right py-3">
                    <button
                        className="d-none d-sm-inline-block btn btn-sm btn-success shadow-sm ml-2"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="fas fa-plus fa-sm text-white-50"></i> Add New Client
                    </button>
                </div>

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
            <th>Client Name</th>
            {/* <th>Website URL</th> */}
            <th>Spoke Person Name</th>
            <th>Spoke Person Contact</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          {console.log("client details",clientDetails)}
          {clientDetails.map((e, i) => (
            <tr key={i}>
              <td>{e.client_name}</td>
              {/* <td>
                <a
                  href={e.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-none"
                >
                  {e.website}
                </a>
              </td> */}
              <td>{e.coordinator_name}</td>
              <td>{e.coordinator_contact}</td>
              <td>
                {new Date(e.created_at).toLocaleDateString("en-GB")} {/* dd/mm/yyyy */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
                    </div>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
  <div
    className="modal fade show d-block "
    tabIndex="-1"
    role="dialog"
     style={{ background: "rgba(0,0,0,0.5)" }}
  >
<div className="modal-dialog modal-lg modal-dialog-centered" role="document">
  <div className="modal-content shadow-lg border-0 rounded-4">
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="modal-header bg-primary text-white rounded-top-4">
        <h5 className="modal-title fw-bold">
          <i className="fas fa-user-tie me-2"></i> Create Client
        </h5>
       <button type="button" className="close" onClick={() => setShowModal(false)} > <span>&times;</span> </button>
      </div>

      {/* Body */}
      <div className="modal-body">
        {/* Client Name */}
        <div className="mb-3">
          <label className="fw-semibold text-secondary">Client Name</label>
          <input
            type="text"
            className="form-control rounded-pill"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name..."
            required
          />
        </div>
        {/* Client Logo */}
        <div className="mb-3">
          <label className="fw-semibold text-secondary">Client Logo</label>
          <div className="d-flex align-items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setClientLogo(e.target.files[0])}
              style={{ display: "none" }}
              id="clientLogoInput"
              required
            />
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill me-3"
              onClick={() => document.getElementById("clientLogoInput").click()}
            >
              Browse
            </button> 
            <span>{clientLogo ? clientLogo.name : "     No file chosen"}</span>
          </div>
        </div>

        {/* Spoke Person Name & Contact */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="fw-semibold text-secondary">Spoke Person Name</label>
            <input
              type="text"
              className="form-control rounded-pill"
              value={spokePersonName}
              onChange={(e) => setSpokePersonName(e.target.value)}
              placeholder="Enter name..."
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold text-secondary">Spoke Person Contact</label>
            <input
              type="tel"
              className="form-control rounded-pill"
              value={spokePersonContact}
              onChange={(e) => setSpokePersonContact(e.target.value)}
              placeholder="e.g +91 9876543210"
              required
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer border-0">
        <button
          type="button"
          className="btn btn-danger rounded-pill px-4"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success rounded-pill px-4">
          <i className="fas fa-save me-2"></i> Create Client
        </button>
      </div>
    </form>
  </div>
</div>


  </div>
)}

    


        </div>
    );
};

export default Clients;
