import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASEURL } from "../constant/constant";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import { jsPDF } from "jspdf";

export const Poster = () => {
  const { id } = useParams();
  const [catList, setCatList] = useState([]);
  const [catId, setCatId] = useState(1);

  const [langList, setLangList] = useState([]);
  const [langId, setLangId] = useState(1);
  const [loading, setLoading] = useState(false);

  const [posterName, setPosterName] = useState("");

  const getCatLit = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getPosterCategory`);
      if (res?.data?.errorCode == 1) {
        setCatList(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLanguageList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getLanguage`);
      if (res?.data?.errorCode == 1) {
        setLangList(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCatLit();
    getLanguageList();
  }, []);

  // const handelLangChange = (e) => {
  //   let lid = e.target.value;
  //   setLangId(lid);
  //   handelPosterGenrate(lid);
  // };

  // const handelPosterGenrate = async (lid) => {
  //   if (!id || !lid || !catId) {
  //     toast.error("Missing data");
  //     return;
  //   }
  //   setLoading(true)
  //   try {
  //     console.log("inside add poster...")
  //     const res = await axios.post(`${BASEURL}/addPoster`, {
  //       docId: id,
  //       langId: lid,
  //       catId,
  //     });
  //     if (res.data.errorCode == 1) {
  //       getPoster(lid);
  //     }
  //     else if (res.data.errorCode == 3) {
  //       toast.error(res.data.message)
  //       return;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   finally{
  //       setLoading(false)
  //   }
  // };


  const handelPosterGenerate = async () => {
    if (!id || !langId || !catId) {
      toast.error("Missing data");
      return;
    }
    setLoading(true)
    try {
      console.log("inside add poster...")
      const res = await axios.post(`${BASEURL}/addPoster`, {
        docId: id,
        langId,
        catId,
      });
      if (res.data.errorCode == 1) {
        getPoster(langId);
      }
      else if (res.data.errorCode == 3) {
        toast.error(res.data.message)
        return;
      }
    } catch (error) {
      console.log(error);
    }
    finally{
        setLoading(false)
    }
  };


  const getPoster = async (lid) => {


    if (!id || !lid || !catId) {
      toast.error("Missing data poserte");
      return;
    }

    //setLoading(true)
    try {
      const res = await axios.post(`${BASEURL}/doc/getPoster`, {
        docId: id,
        langId: lid,
        catId,
      });

      if (res.data.errorCode == 1) {
        setPosterName(res.data.data[0].poster_name);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
        setLoading(false)
    }
  };
  let  rn = Math.floor(Math.random() * 100) + 1;
  
  const handleDownload = async () => {
    if (!posterName) return;
  
    try {
      const imageUrl = `${BASEURL}/${posterName}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `poster-${id}-${rn}.jpg`); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed", error);
    }
  };
   
  const handlePdfDownload = async () => {
    if (!posterName) return;
  
    try {
      const imageUrl = `${BASEURL}/${posterName}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
  
      const reader = new FileReader();
      reader.readAsDataURL(blob);
  
      reader.onloadend = function () {
        const base64data = reader.result;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
  
        const imgProps = pdf.getImageProperties(base64data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
        pdf.addImage(base64data, 'JPG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`poster-${id}-${rn}.pdf`);
      };
    } catch (error) {
      console.error("PDF download failed", error);
    }
  };
  useEffect(()=>{
    //handelPosterGenrate(langId)
    handelPosterGenerate(catId,langId)
  },[catId,langId])
  return loading ? <Loader/> : (
    <div>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            <div className="d-sm-flex align-items-center justify-content-end mb-4">
              <div className="dropdown ml-3 mt-4" style={{ marginLeft: "1%" }}>
                <select
                  className="form-control selectStyle"
                  onChange={(e) => {
                    setCatId(e.target.value);
                  }}
                  value={catId}
                >
                  {/* <option value="">All Category</option> */}
                  {catList.map((e) => (
                    <option key={e.pcat_id} value={e.pcat_id}>
                      {e.cat_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown ml-3 mt-4" style={{ marginLeft: "1%" }}>
                <select
                  className="form-control selectStyle"
                  onChange={(e)=>{
                     setLangId(e.target.value);
                  }}
                  value={langId}
                >
                  {/* <option value="">All Language</option> */}
                  {catId &&
                    langList.map((e) => (
                      <option key={e.lang_id} value={e.lang_id}>
                        {e.langvalue}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card bg-card  ml-3">
                <div className="card-body ">
                  {posterName && (
                    <div className="text-center">
                      <div className="text-center mt-3">
                        <img
                      className="pt-0 poster-image1 mx-auto"
                          src={`${BASEURL}/${posterName}?${rn}`}
                          alt="camp poster"
                        />
                      </div>
                      <button className="m-3 btn btn-primary" title="Download Image" onClick={handleDownload}>
                      <i className="bi bi-file-earmark-arrow-down-fill"></i>Image</button>
                      <button className="m-3 btn btn-danger" title="Download Pdf" onClick={handlePdfDownload}>
                      <i className="bi bi-filetype-pdf"></i>PDF</button>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
