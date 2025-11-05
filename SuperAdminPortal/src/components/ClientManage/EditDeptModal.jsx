// Example: EditDepartmentModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import "./editDept.css"

const EditDepartmentModal = ({ show, setShow, editData, onSuccess, userId,clientList }) => {
    const [deptName, setDeptName] = useState("");
    const [clientId, setClientId] = useState("");
    const [coName, setCoName] = useState("");
    const [coContact, setCoContact] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        if (editData) {
            setDeptName(editData.dept_name || "");
            setClientId(editData.client_id || "");
            setCoName(editData.dept_coordinator_name || "");
            setCoContact(editData.dept_coordinator_contact || "");
            setWebsiteUrl(editData.website_url || "");
        }
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("deptId", editData.dept_id);
        formData.append("clientId", clientId);
        formData.append("deptName", deptName);
        formData.append("coName", coName);
        formData.append("coContact", coContact);
        formData.append("websiteUrl", websiteUrl);
        formData.append("userId", userId);
        if (logo) formData.append("logo", logo);

        try {
            const res = await axios.post(`${BASEURL2}/department/updateDepartment`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(res.data.message || "Department updated successfully!");
            setShow(false);
            if (onSuccess) onSuccess(); // refresh parent list
        } catch (err) {
            console.error("Error updating department:", err);
            alert("Failed to update department");
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header bg-primary text-white rounded-top-4">
                            <h5 className="modal-title fw-bold">Edit Department</h5>
                            <button type="button" className="close" onClick={() => setShow(false)}>
                                <span>&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">

                            <div className="mb-3"> <div className="form-group mb-3">
                                <label className="fw-semibold text-secondary">
                                    Select Client Name
                                </label>
                                <select
                                    className="form-select form-control rounded-pill"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {clientList.map((el) =>
                                        <option value={el.client_id}>{el.client_name}</option>
                                    )}
                                </select>
                            </div>
                            </div>

                            <div className="mb-3">
                                <label>Department Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-pill"
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Coordinator Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-pill"
                                    value={coName}
                                    onChange={(e) => setCoName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Coordinator Contact</label>
                                <input
                                    type="tel"
                                    className="form-control rounded-pill"
                                    value={coContact}
                                    onChange={(e) => setCoContact(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Website URL</label>
                                <input
                                    type="url"
                                    className="form-control rounded-pill"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="fw-semibold text-secondary">Department Logo</label>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files[0])}
                                        style={{ display: "none" }}
                                        id="clientLogoInput"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary rounded-pill me-3"
                                        onClick={() =>
                                            document.getElementById("clientLogoInput").click()
                                        }
                                    >
                                        Browse
                                    </button>
                                    <span>
                                        {logo
                                            ? logo.name
                                            : editData?.dept_logo
                                                ? editData.dept_logo
                                                : "No file chosen"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShow(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary rounded-pill">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDepartmentModal;
