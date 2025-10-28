import { useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import "./monthlycamps.css";
import Loader from "../utils/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect } from "react";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import EditCampTypeModal from "./EditCampTypeModal";

const CampType = () => {
  const empcode = sessionStorage.getItem("empcode");
  const [myCampDetails, setMyCampDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userId = sessionStorage.getItem("userId");
  const [showEditModal,setEditModal] = useState(false)
  const [editData, setEditData] = useState(null);  
  const [clientList,setClientList] = useState([]);
  const [clientId,setClientId] = useState("");
  const [deptList,setDeptList]= useState([]);
  const [deptId,setDeptId]=useState("");

  const [campTypeName, setCampTypeName] = useState("");
  const [fields, setFields] = useState([
    {
      label: "",
      field_type: "text",
      is_required: "Y",
      options_json: null,
      order_index: 1,
    },
  ]);

  const [openActionId, setOpenActionId] = useState(null);

  const handleEditCampType = (campType) => {
    setEditData(campType);
    setEditModal(true);
    setOpenActionId(null);
  };


  const getMonthlyCampDetails = async () => {
    setLoading(true)

    try {
      const res = await axios.post(`${BASEURL2}/monthlyCamps/getCampDetailsAdmin`)
      setMyCampDetails(res.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }
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
        {clientId}
      )
      setDeptList(res.data.data)
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

    try {
      // Step 1: Prepare payload for camp type
      const campTypePayload = {
        campTypeName,
        userId: userId,
      };

      console.log("Creating Camp Type:", campTypePayload);

      // Step 2: API call to create camp type
      const campTypeResponse = await axios.post(
        `${BASEURL2}/monthlyCamps/createCampType`,
        campTypePayload
      );

      if (campTypeResponse.data.errorCode !== 1) {
        console.log(campTypeResponse.data.errorDetail || "Failed to create camp type");
      }

      // Step 3: Get inserted campTypeId from DB insert result
      const campTypeId = campTypeResponse.data.data.insertId;
      console.log("Created campTypeId:", campTypeId);

      // Step 4: Prepare payload for camp config fields
      const fieldsPayload = {
        campTypeId,
        fields: fields.map((f) => ({
          ...f,
          options_json:
            f.field_type === "dropdown" && f.options_json
              ? f.options_json.split(",").map((opt) => opt.trim())
              : null,
        })),
      };

      console.log("Creating Camp Config:", fieldsPayload);

      // Step 5: API call to create camp config
      const campConfigResponse = await axios.post(
        `${BASEURL2}/monthlyCamps/createCampConfig`,
        fieldsPayload
      );

      if (campConfigResponse.data.errorCode !== 1) {
        console.log(campConfigResponse.data.errorDetail || "Failed to create camp config");
      }

      console.log("Camp Config Created Successfully");

      // Step 6: Reset form
      setShowModal(false);
      setCampTypeName("");
      setFields([
        {
          label: "",
          field_type: "text",
          is_required: "Y",
          options_json: null,
          order_index: 1,
        },
      ]);

      alert("Camp Type & Config created successfully!");
      getMonthlyCampDetails()
    } catch (error) {
      console.error("Error in handleSubmit:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(()=>{
    getMonthlyCampDetails();
    getClientList();
  },[])

  return loading ? (
    <Loader />
  ) : (
    <div className="container-fluid">
      <div className="card shadow mb-4">
          <div className="d-sm-flex align-items-start justify-content-end mb-4">
            <div className="dropdown ml-2">
            <select
              className="form-control selectStyle selecCamp"
              name="clientId"
              id="clientId"
              value={clientId}
              onChange={(e)=>{setClientId(e.target.value),getDepartmentList(e.target.value)}}
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
              onChange={(e)=>setDeptId(e.target.value)}
            >
              {deptList && deptList.map((e) => (
                <option key={e.dept_id} value={e.dept_id}>
                  {e.dept_name}
                </option>
              ))}
            </select>

          </div>
          </div>
        <div className="card-header text-right py-3">
          <button
            className="d-none d-sm-inline-block btn btn-sm btn-success shadow-sm ml-2"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus fa-sm text-white-50"></i> Add Camp Type
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
                  <th>Camp Type Name</th>
                  <th>Fields Names</th>
                  <th>Action</th>
                </tr>
              </thead>
                {console.log("myCampDetails : ",myCampDetails)}
                <tbody>
                  {/* Repeat this row structure for each table row */}
                  {myCampDetails && myCampDetails
                    .filter(e => e.name !== "Admin")
                    .map((e) => {
                      return (
                        <tr key={e.camp_type_id}>
                          <td>{e.camp_type_name}</td>
                          <td> <div className="d-flex flex-wrap gap-2">
                            {e.fields.map((el, i) => (
                              <span key={i} className="badge rounded-pill bg-primary-subtle text-primary fw-semibold px-3 py-2 shadow-sm">
                                {el.label}
                              </span>
                            ))}
                          </div></td>
                          <td>
                            <div className="action-wrapper">
                              <button className="btn btn-sm btn-primary btn-circle border-0"
                               onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenActionId(prev => (prev === e.camp_type_id ? null : e.camp_type_id));
                                      }}>
                                <BsThreeDotsVertical />
                              </button>
                               {openActionId === e.camp_type_id && (
                                      <div className="action-dropdown">
                                        { (
                                          <button
                                            className="dropdown-item text-success"
                                            onClick={() => {
                                              handleEditCampType(e)
                                            }}
                                          >
                                            Edit Camp Type
                                          </button>
                                        )}
                                      </div>
                                    )}
                            </div>
                          </td>
                           
                        </tr>
                            )
                        })}
                        
                        {/* Repeat this row structure for each table row */}
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
      <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
        <form onSubmit={handleSubmit}>
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-toolbox me-2"></i> Add Camp Type Configuration
            </h5>
          <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                  >
                    <span>&times;</span>
                  </button>
          </div>

          <div className="modal-body">
            <div className="form-group mb-4">
              <label className="fw-semibold text-secondary">Camp Type Name</label>
              <input
                type="text"
                className="form-control rounded-pill px-3"
                placeholder="Enter camp type name..."
                value={campTypeName}
                onChange={(e) => setCampTypeName(e.target.value)}
                required
              />
            </div>

            <h6 className="mt-3 mb-3 fw-bold text-primary">
              <i className="fas fa-sliders-h me-2"></i> Field Configurations
            </h6>

            {fields.map((field, index) => (
              <div
                key={index}
                className="field-card border rounded-4 p-4 mb-4 bg-light position-relative"
              >
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="fw-semibold text-secondary">Label</label>
                    <input
                      type="text"
                      className="form-control rounded-pill px-3"
                      value={field.label}
                      onChange={(e) =>
                        handleFieldChange(index, "label", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="fw-semibold text-secondary">Field Type</label>
                    <select
                      className="form-select form-control rounded-pill"
                      value={field.field_type}
                      onChange={(e) =>
                        handleFieldChange(index, "field_type", e.target.value)
                      }
                    >
                      <option value="text">Text</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="image">Image</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="fw-semibold text-secondary">Required</label>
                    <select
                      className="form-select form-control rounded-pill"
                      value={field.is_required}
                      onChange={(e) =>
                        handleFieldChange(index, "is_required", e.target.value)
                      }
                    >
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="fw-semibold text-secondary">Order</label>
                    <input
                      type="number"
                      className="form-control rounded-pill text-center"
                      value={field.order_index}
                      onChange={(e) =>
                        handleFieldChange(index, "order_index", e.target.value)
                      }
                    />
                  </div>
                </div>

                {field.field_type === "dropdown" && (
                  <div className="mt-3">
                    <label className="fw-semibold text-secondary">
                      Dropdown Options (comma separated)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-pill px-3"
                      placeholder="e.g. Option1, Option2, Option3"
                      value={field.options_json || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "options_json", e.target.value)
                      }
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm position-absolute rounded-pill"
                  style={{ top: "12px", right: "12px" }}
                  onClick={() => handleRemoveField(index)}
                  disabled={fields.length === 1}
                >
                  <i className="fas fa-trash-alt"></i> Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={handleAddField}
            >
              <i className="fas fa-plus me-2"></i> Add Field
            </button>
          </div>

          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success rounded-pill px-4">
              <i className="fas fa-save me-2"></i> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

        {showEditModal && <EditCampTypeModal
          showEditModal={showEditModal}
          setEditModal={setEditModal}
          editData={editData}
          editMode={!!editData}
          onSuccess={() => getMonthlyCampDetails()}
        />}

    </div>
  );
};

export default CampType;
