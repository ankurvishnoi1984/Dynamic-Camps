import "./Poster.css";
import { FiEye, FiInfo, FiEdit, FiPlus } from "react-icons/fi";
import { AddDoctorModal } from "./AddDoctor/AddDoctorModal";
import { useEffect, useState } from "react";
import { DeptId, BASEURL2, BASEURL } from "../constant/constant"
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import { InfoDoctorModal } from "./Info/InforDoctorModal";
import { UpdateDoctorModal } from "./UpdateDoctor/UpdateDoctorModal";


export const Poster = () => {
  const [openModal, setOpenModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = sessionStorage.getItem("userId");
  const [infoModal, setInfoModal] = useState(false);
  const [infoData, setInfoData] = useState({});
  const [updateModal, setUpdateModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("")

  const getDoctorsList = async () => {
    if (!selectedCategory)return
    setLoading(true)
    const req = { deptId: DeptId, userId, subCatId: selectedSubCategory,searchText }

    try {
      const res = await axios.post(`${BASEURL2}/poster/getAllPosterDoctorsByEmp`, req)
      setDoctorsList(res.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/poster/getCategory`, {
        deptId: DeptId,
      });

      if (res.data?.errorCode === 1 && res.data.data.length > 0) {
        const list = res.data.data;
        setCategories(list);

        // 👇 AUTO SELECT FIRST CATEGORY
        setSelectedCategory(list[0].category_id);
        sessionStorage.setItem("catId",list[0].category_id)
      }
    } catch (err) {
      console.error("Category fetch error", err);
    }
  };

  const handleOpenInfoModal = (doc) => {
    setInfoData(doc);
    setInfoModal(true);
  }
  const handleOpenUpdateModal = (doc) => {
    setInfoData(doc);
    setUpdateModal(true)
  }

  useEffect(() => {
    fetchCategories();
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory]);
    
  // useEffect(() => {
  //   if (selectedSubCategory) {
  //     getDoctorsList();
  //   }
  // }, [selectedSubCategory]);



    useEffect(() => {
    if (searchText) {
      let timer = setTimeout(() => {
        getDoctorsList();

      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }
    else if(selectedSubCategory) {
      getDoctorsList();
    }
  }, [searchText,selectedSubCategory]);


  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await axios.post(
        `${BASEURL}/poster/getSubCategory`,

        {
          deptId: DeptId,
        },

      );

      if (res.data?.errorCode === 1 && res.data.data.length > 0) {
        const list = res.data.data;
        setSubcategories(list);

        // 👇 AUTO SELECT FIRST SUBCATEGORY
        setSelectedSubCategory(list[0].subcategory_id);
        sessionStorage.setItem("subCatId",list[0].subcategory_id)
      } else {
        setSubcategories([]);
        setSelectedSubCategory("");
        sessionStorage.removeItem("subCatId")
      }
    } catch (err) {
      console.error("Subcategory fetch error", err);
    }
  };


  return (
    <>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            <div>
              <div className="poster-page">
                {/* Header */}
                <div className="poster-header">
                  <div className="filter-group">

                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="search-input"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />

                    {/* Category */}
                    <select
                      className="filter-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option
                          key={cat.category_id}
                          value={cat.category_id}
                        >
                          {cat.category_name}
                        </option>
                      ))}
                    </select>

                    {/* Subcategory */}
                    <select
                      className="filter-select"
                      value={selectedSubCategory}
                      onChange={(e) => {setSelectedSubCategory(e.target.value),sessionStorage.setItem("subCatId",e.target.value)}}
                      disabled={!selectedCategory}
                    >
                      <option value="">All Subcategories</option>
                      {subcategories.map((sub) => (
                        <option
                          key={sub.subcategory_id}
                          value={sub.subcategory_id}
                        >
                          {sub.subcategory_name}
                        </option>
                      ))}
                    </select>

                  </div>
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
                        <button title="Edit" onClick={() => handleOpenUpdateModal(doc)}>
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
      <UpdateDoctorModal
        doctorData={infoData}
        open={updateModal}
        onClose={() => setUpdateModal(false)}
      />
    </>
  );
};

