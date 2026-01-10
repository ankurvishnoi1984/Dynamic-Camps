import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Preview.css";
import axios from "axios";
import Loader from "../../utils/Loader";
import toast from "react-hot-toast";
import { DeptId, BASEURL } from "../../constant/constant";
//import { toast } from "react-toastify";

const Preview = () => {

    const empId = sessionStorage.getItem("userId");
    const catId = sessionStorage.getItem("catId");
    const subCatId = sessionStorage.getItem("subCatId")
    const [singalDocData, setSinglDocData] = useState({});

    let { id } = useParams();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetDoctorById();

    }, []);


    async function GetDoctorById() {
        try {
            const req = { docId: id, deptId: DeptId, subCatId: 1 }
            let response = await axios.post(`${BASEURL}/poster/getPosterByDoctorId`, req);
            console.log("response, ", response)
            setSinglDocData(response.data.result[0]);
        } catch (error) {
            console.log(error);
        }
    }
    const handleDownload = (posterName) => {
        const filename = posterName.split("/").pop();
        window.open(
            `${BASEURL}/poster/download-poster/${filename}`,
            "_blank"
        );
    };

    return (
        <>
            <main id="main" className="main">
                <section className="section dashboard">
                    <div className="row ">
                        <div className="col-sm-6 col-md-4 col-lg-3">

                            <div className="card shadow-sm">

                                {/* Poster Image Preview */}
                                <div className="card-body p-2">
                                    <img
                                        src={`${BASEURL}/${singalDocData.poster_name}`}
                                        alt="Doctor Poster"
                                        className="img-fluid rounded"
                                        style={{ cursor: "pointer" }}
                                    />
                                </div>

                                {/* Download Button */}
                                <div className="card-footer bg-white border-0 pt-0"
                                onClick={()=>handleDownload(singalDocData.poster_name)}>
                                    <a
                                        // href={`${BASEURL}/download-poster/${singalDocData.poster_name?.split("/").pop()}`}
                                        className="btn btn-danger btn-sm w-100"
                                    >
                                        <i className="bi bi-download me-1"></i>
                                        Download Image
                                    </a>
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
