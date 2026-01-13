import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Preview.css";
import axios from "axios";
import Loader from "../../utils/Loader";
import toast from "react-hot-toast";
import { DeptId, BASEURL } from "../../constant/constant";
//import { toast } from "react-toastify";

const Preview = () => {
    const [singalDocData, setSinglDocData] = useState({});
    const userId = sessionStorage.getItem("userId")
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");


    let { id } = useParams();

    const [loading, setLoading] = useState(false);




    async function GetDoctorById() {
        try {
            const req = { docId: id, deptId: DeptId, subCatId: selectedSubCategory }
            let response = await axios.post(`${BASEURL}/poster/getPosterByDoctorId`, req);
            console.log("getPosterByDoctorId response, ", response)
            setSinglDocData(response.data.result[0]);
        } catch (error) {
            console.log(error);
        }
    }
    const handleDownload = (posterName) => {
        const filename = posterName.split("/").pop();
        window.open(
            `${BASEURL}/poster/download-poster/${filename}?userId=${userId}&deptId=${DeptId}`,
            "_blank"
        );
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        GetDoctorById();
    }, [selectedSubCategory, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await axios.post(`${BASEURL}/poster/getCategory`,
                { deptId: DeptId },
            );

            if (res.data?.errorCode === 1 && res.data.data.length > 0) {
                setCategories(res.data.data);
                setSelectedCategory(res.data.data[0].category_id); // auto select
            }
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchSubCategories = async (categoryId) => {
        try {
            const res = await axios.post(
                `${BASEURL}/poster/getSubCategory`,
                {
                    deptId: DeptId,
                    categoryId,
                }
            );

            if (res.data?.errorCode === 1 && res.data.data.length > 0) {
                setSubcategories(res.data.data);
                setSelectedSubCategory(res.data.data[0].subcategory_id); // auto select
            } else {
                setSubcategories([]);
                setSelectedSubCategory("");
            }
        } catch (err) {
            console.error(err);
        }
    };



    return (
        <>
            <main id="main" className="main">
                <section className="section dashboard">

                    {/* Filters */}
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                disabled={!selectedCategory}
                            >
                                {subcategories.map((sub) => (
                                    <option key={sub.subcategory_id} value={sub.subcategory_id}>
                                        {sub.subcategory_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Poster Card */}
                    <div className="row">
                        <div className="col-sm-6 col-md-4 col-lg-3">
                            <div className="card shadow-sm">

                                <div className="card-body p-2">
                                    <img
                                        src={`${BASEURL}/${singalDocData.poster_name}`}
                                        alt="Doctor Poster"
                                        className="img-fluid rounded"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            window.open(`${BASEURL}/${singalDocData.poster_name}`, "_blank")
                                        }
                                    />
                                </div>

                                <div
                                    className="card-footer bg-white border-0 pt-0"
                                    onClick={() => handleDownload(singalDocData.poster_name)}
                                >
                                    <button className="btn btn-danger btn-sm w-100">
                                        <i className="bi bi-download me-1"></i>
                                        Download Image
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                </section>
            </main>
        </>



    );
};

export default Preview;
