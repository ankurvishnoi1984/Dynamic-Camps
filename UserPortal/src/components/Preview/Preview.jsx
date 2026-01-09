import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Preview.css";
import axios from "axios";
import Loader from "../utils/Loader";
import toast from "react-hot-toast";
import { DeptId,BASEURL } from "../constant/constant";
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
            const req = {docId:id,deptId:DeptId,subCatId:1}
            let response = await axios.post(`${BASEURL}/poster/getPosterByDoctorId`,req);
            console.log("response, ",response)
            setSinglDocData(response.data.result[0]);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <div
                className="content-header"
                style={{ backgroundColor: "#39a6cf", color: "#fff", height: "50px" }}
            >
                <p className="text-center" style={{ fontSize: "25px" }}>
                    {" "}
                    <Link to="/dashboard" className=" text-left">
                        <button type="button" className="btn btn-primary float-left">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    </Link>{" "}

                </p>

                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6"></div>
                    </div>
                </div>
            </div>



            <section className="content mt-5">
                <div className="container-fluid">
                    <div className="row">

                        <div className="card bg-light ml-3">
                            <div
                                className="card-body pt-0 poster-image1"
                                id="pdiv1"
                                style={{
                                    backgroundImage: `url(/images/doctor2.jpg)`,
                                    fontFamily: 'Montserrat, sans-serif'

                                }}
                            >
                                <div className="row">
                                    <div className=" text-center">
                                        <div className="profile-image1">
                                            <img
                                                src={`${BASEURL}/${singalDocData.poster_name}`}
                                                alt="doctor image"
                                                className="profile-poster1"
                                            />
                                        </div>
                                        <div className={`namediv1 montserrat-fnt`}>
                                            {singalDocData.doctor_name}
                                        </div>
                                        <div className="therapydiv1 montserrat-fnt">
                                            {singalDocData.doctor_qualification}
                                        </div>
                                        <div className="hospitaldiv1 montserrat-fnt">
                                            {singalDocData.camp_venue}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="text-center">
                                    <div
                                        onClick={() =>
                                            handleSave1()
                                        }
                                        className="btn btn-sm btn-danger"
                                    >
                                        <i className="fas fa-download"></i> Image
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </section>
        </div>
    );
};

export default Preview;
