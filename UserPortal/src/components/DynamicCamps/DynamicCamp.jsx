import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL, BASEURL2, ImageLimit, PageCount } from "../constant/constant";
import ConfirmationPopup from "../popup/Popup";
import Select from "react-select";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import * as XLSX from "xlsx/xlsx.mjs";
import useCampList from "../CustomHook/useCampList";
import AddBccModal from "../Modals/AddBccModal";
import "./DynamicCamp.css"
import { BsThreeDotsVertical } from "react-icons/bs";


const DynamicCamp = () => {
  const userId = sessionStorage.getItem("userId");
 const [openActionId, setOpenActionId] = useState(null);
  const [campList] = useCampList();
  const [brandList, setBrandList] = useState([]);

  const [brandMapping, setBrandMapping] = useState([])
  const empId = sessionStorage.getItem("empId");


  const [campType, setCampType] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [doctorName, setDoctorName] = useState("");
  const [speciality,setSpeciality] = useState("");
  const [isBccDistributed,setBccDistributed] = useState("N");
  const [isPrescriptionGen,setisPrescriptionGen] = useState("N");

  const [screenedCount, setScreenedCount] = useState(null);
  const [rxCount, setRxCount] = useState(null);
  const [therapyDay,setTherapyDay]= useState(null);


  const [campVenue, setCampVenue] = useState("");
  const [campDate, setCampDate] = useState("");
  const [campTime, setCampTime] = useState("");
  const [campPatients, setCampPatients] = useState("");


  const [listCampType, setListCampType] = useState("");
  const [campReportList, setCampReportList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");


  const [addRequestModel, setAddRequestModel] = useState(false);
  const [infoReportModel, setInfoReportModel] = useState(false);
  const [editRequestModel, setEditRequestModel] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const handleClosePreview = () => {
    setPreviewImg(null);
  };

  const [infoData, setInfoData] = useState({});
  const [campImages, setCampImages] = useState([]);

  // for delete

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [editId, setEditId] = useState("");
  const [crid, setCrid] = useState("");
    const [filters, setFilters] = useState({
      campTypeId: "",
      searchQuery: "",
      // filterBy: "",
      // startDate: "",
      // endDate: "",
    });


  // for brand input adding 
    // brand row adding logic
    const [brandInputs, setBrandInputs] = useState([
      { brand: "", sku: "", therapyDay: "" },
    ]);
    

  // for file upload

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

   const [doctorList, setDoctorList] = useState([]);
   const [doctorId,setDoctorId] =useState('')
  // for camp request data

  const [loading, setLoading] = useState(false);

  const handelAddReport = () => {
    setAddRequestModel(true);
  };
 
  const handelCloseModel = async () => {
    setAddRequestModel(false);
    await getCampReportList();
  };

  const handelCloseEditModel = async () => {
    setEditRequestModel(false);
    await getCampReportList();
    setCampType("");
    setCampVenue("");
    setCampDate("");
    setScreenedCount("");
    setRxCount("");
    setBrandId("");
    setCampPatients("");
    setDoctorName("");
    setSpeciality("");
    setDoctorId('')
    setBrandInputs([{ brand: "", sku: "", therapyDay: "" },]);
    
    
  };

  const handelInfo = async (campReportId) => {
    const infoData = campReportList.find((e)=>e.crid === campReportId);
    setInfoData(infoData);
    // await getCampReportImages(campReportId);
    // await getBrandMapping(campReportId)
    setInfoReportModel(true);
    setOpenActionId(false)
  };
  const handelCloseInfoModel = () => {
    setInfoReportModel(false);
    setInfoData({});
  };

  const handelDelete = (campReportId) => {
    setShowDeleteConfirmation(true);
    setDelId(campReportId);
  };
  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(`${BASEURL}/report/deleteReportWithId`, {
        crId: delId,
      });

      if (res.data.errorCode == "1") {
        toast.success("Camp Report Deleted Successfully");
        await getCampReportList();
        setDelId("");
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const getCampReportInfoWithId = async (crid) => {
  //   try {
  //     const res = await axios.post(`${BASEURL}/report/getReportInfoWithId`, {
  //       crId: crid,
  //     });
  //     if (res?.status === 200) {
  //       setInfoData(res?.data[0]);
  //     }
  //   } catch (error) {
  //   }
  // };

  const getCampReportImages = async (crid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/getImages`, {
        crId: crid,
      });
      if (res?.status === 200) {
        setCampImages(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrandMapping = async (crid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/getBrandMapping`, {
        crId: crid,
      });
      if (res?.status === 200) {
        setBrandMapping(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBrandMapping1 = async (crid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/getBrandMapping`, {
        crId: crid,
      });
      if (res?.status === 200) {

        const editData = res?.data?.data;
        const preFilledData = editData.map((data) => ({
          mappingId:data.bmid,
          brand: data.brand, 
          sku: data.sku, 
          therapyDay: data.therapyDay
        }));
       setBrandInputs(preFilledData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //  for showing dashboard list
  const getCampReportList = async () => {
    setLoading(true)
    try {
      const res = await axios.post(
        `${BASEURL2}/dashboard/getCampReportListWithImage?searchName=${searchQuery}`,
        { ...filters, userId,activityId:'2' }
      );
      if (res?.data?.errorCode == "1") {
         console.log("CampReportList",res?.data?.data);
        setCampReportList(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if(searchQuery){
      let timer =setTimeout(()=>{
        getCampReportList();
      },1000)
      
      return ()=>{
        clearTimeout(timer)
      }
    }
    else{
      getCampReportList();
    }
  }, [listCampType, searchQuery]);

  // for get camp type

  const getCampList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getCampType`);
      // setCampList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getBrandList = async()=>{
    setLoading(true);
    try {
      let res;
      res = await axios.get(`${BASEURL2}/basic/getBrandsList`);
      if(res?.data?.errorCode === 1){
        setBrandList(res.data.data)
      }
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  }

  const handleImageClick = (imgUrl) => {
    setPreviewImg(imgUrl);
  };

    const getDoctorList = async () => {
      try {
        const res = await axios.post(`${BASEURL2}/doc/getDoctorList`,{empcode:empId});
        setDoctorList(res?.data?.data);
      } catch (error) {
        console.log(error);
      }
    };

  const handelReportDownload = () => {

    // New headers for camp report
    const headers = [
      "Doctor Name",
      "Speciality",
      "Camp Type",
      "Camp Date",
      "No of kits given",
    ];

    const mappedData = (campReportList || []).map((item) => ({
      "Doctor Name": item.doctor_name,
      "Speciality": item.speciality,
      "Camp Type": item.camp_type_name,
      "Camp Date": item.camp_date1,
      "No of kits given": item.no_of_kits_given

    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camp Reports");
    const rn = Math.floor(Math.random() * 1000) + 1;
    XLSX.writeFile(wb, `BCC_Distribution_Reports_${rn}.xlsx`);

  };  



  useEffect(() => {
    // getCampList();
    getBrandList();
    getDoctorList();
  }, []);

  // for search

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

 

  const handleAddSubmit = async () => {
    if (
      !campType ||
      !doctorId ||
      !speciality ||
      !campDate ||
      !selectedFiles
    ) {
      toast.error("Missing Required Field");
      return;
    }
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
    let brandsArr = []
    brandInputs.map((el)=>{
      brandsArr.push(el.brand)
    })
    formData.append("brandIds",brandsArr)
    formData.append("campType", campType);
    formData.append("doctorId", doctorId);
    formData.append("date", campDate);
    formData.append("userId",userId)
    // activityId 2 for Bcc distribution
    formData.append("activityId",2)
    formData.append("isPrescriptionGenerated",isPrescriptionGen)
    formData.append("isBccDistributed",isBccDistributed)
    let res;

    try {
       res = await axios.post(`${BASEURL2}/camp/createCamp`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(res.status === 500){
        toast.error("Error uploading images");
      }
    } catch (error) {
      console.error("Error submitting the report:", error);
      toast.error("Error submitting the report");
    } finally {
      setSelectedFiles([]);
      setPreviewUrls([]);
      setAddRequestModel(false);
      await getCampReportList();
    }

  }
  

  const handelBrandMapping = async(reportId)=>{
      
    try {
        const res = await axios.post(`${BASEURL}/report/addBrandMapping`,{
          crId:reportId,
          userId,
          data:brandInputs
        })
        
    } catch (error) {
       console.log("error in adding brand mapping",error);
       toast.error('Error doctor mapping data'); 
    }
    
}

const handelUpdateBrandMapping = async(reportId)=>{
      
  try {
      const res = await axios.post(`${BASEURL}/report/updateBrandMapping`,{
        crId:reportId,
        userId,
        data:brandInputs
      })
  } catch (error) {
     console.log("error in adding brand mapping",error);
     toast.error('Error doctor mapping data'); 
  }
  
}

  const handleEdit = async (campReportId) => {
    setEditId(campReportId);

    const infoData = campReportList.find((e)=>e.crid === campReportId);

   
    if(infoData){
      setCampType(infoData.camp_type_id);
      //setDoctorName(infoData.doctor_name);
      setDoctorId(infoData.doctor_id);
      setSpeciality(infoData.speciality);
      setCampDate(infoData.camp_date2);
      setCampTime(infoData.camp_time1)
      setCampVenue(infoData.camp_venue);
      setCampPatients(infoData.patient_count);
      setScreenedCount(infoData.screen_count);
      setRxCount(infoData.rx_count);
      setTherapyDay(infoData.therapy_day);
      setBrandId(infoData.brand_id);
    }
    await getBrandMapping1(campReportId)
    await getCampReportImages(campReportId);
    setEditRequestModel(true);
  };

  useEffect(() => {
    // Convert comma-separated string to an array of selected options
    if (brandId) {
      const selectedValues = brandId.split(",").map(Number);
      const selectedOptions = brandList
        .filter((brand) => selectedValues.includes(brand.brand_id))
        .map((brand) => ({ value: brand.brand_id, label: brand.item_name }));
      setSelectedBrands(selectedOptions);
    } else {
      setSelectedBrands([]);
    }
  }, [brandId]);

  const handleEditSubmit = async () => {
    if (
      !campType ||
      !doctorId ||
     // !doctorName ||
     // !speciality ||
     // !campDate ||
     // !campVenue ||
      !campPatients ||
     // !therapyDay ||
      !screenedCount ||
      !rxCount 
    ) {
      toast.error("Missing Required Field");
      return;
    }

    // const hasEmptyBrandInput = brandInputs.some(input =>
    //   !input.brand.trim() || !input.sku.trim() || !input.therapyDay.toString().trim()
    // );
  
    // if (hasEmptyBrandInput) {
    //   toast.error("Please fill all Brand, SKU, and Therapy Day fields.");
    //   return;
    // }
    // if (selectedFiles.length + campImages.length === 0) {
    //   toast.error("No files selected");
    //   //alert("No Selected File")
    //   return;
    // }

    //const myStr = selectedBrands?.map((item) => item.value).join(",");

    try {
      const reportResponse = await axios.post(`${BASEURL}/report/updateReportWithInfo`, {
          campType,
          doctorId,
         // brandId:myStr,
         // campDate,
         // campVenue,
         // speciality,
        //  doctorName,
          patientCount:campPatients,
          screenCount:screenedCount,
          rxCount:rxCount,
          userId,
          crId: editId   
      });

      if (reportResponse?.data?.errorCode == 1) {
        toast.success("Camp Report updated Successfully");
        //await getCampReportList();
        
        await handelUpdateBrandMapping(editId)
      
        setScreenedCount("");
        setRxCount("");
        setCampType("");
        setCampVenue("");
        setCampDate("");
        setCampPatients("");
        setDoctorName("");
        setSpeciality("");
        setDoctorId('')
        setBrandInputs([{ brand: "", sku: "", therapyDay: "" },]);
        if(selectedFiles && selectedFiles.length > 0){
          const formData = new FormData();
          selectedFiles.forEach((file) => {
          formData.append("images", file);
        });
        formData.append("crId", editId);
        formData.append("userId", userId);

        try {
          // Second API call: Upload images
          const imageUploadResponse = await axios.post(
            `${BASEURL}/report/updateImages`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
           
          if (imageUploadResponse.status === 200) {
            
            setSelectedFiles([]);
            setPreviewUrls([]);
          } else {
            toast.error("Failed to upload images");
          }
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Error uploading images");
        }
        }
        
      } else {
        toast.error("Error in submitting the report");
      }
    } catch (error) {
      toast.error("Server error in updating report");
    } finally {
      setEditRequestModel(false);
      await getCampReportList();
    }
  };

  

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    //const files = event.target.files;
    if (files.length + selectedFiles.length > ImageLimit) {
      toast.error(`You can only upload up to ${ImageLimit} images`);
      //alert('You can only upload up to 3 images')
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
  };

  const handleEditFileChange = (event) => {
    const files = Array.from(event.target.files);
    //const files = event.target.files;
    if (files.length + selectedFiles.length + campImages.length > ImageLimit) {
      toast.error(`You can only upload up to ${ImageLimit} images`);
      //alert('You can only upload up to 3 images');
      return;
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index) => {
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newSelectedFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handelDeleteCampImage = async (imgid) => {
    try {
      const res = await axios.post(`${BASEURL}/report/deleteSingalImg`, {
        crimgid: imgid,
      });
      if (res?.data?.errorCode == "1") {
        //toast.success("Image Deleted")
        //alert('Image Deleted')
        await getCampReportImages(editId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBrandChange = (selectedOptions) => {
    setSelectedBrands(selectedOptions);
  };

  const brandOptions = brandList?.map((brand) => ({
    value: brand.brand_id,
    label: brand.item_name,
  }));

  // for select camp request
  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(campReportList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };


  const renderPageNumbers = () => {
    const totalPages = Math.ceil(campReportList.length / PageCount);
    const pageNumbers = [];
    const maxPageNumbersToShow = PageCount - 10;

    if (totalPages <= maxPageNumbersToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(2, page - 2);
      const endPage = Math.min(totalPages - 1, page + 2);

      pageNumbers.push(1); // Always show the first page
      
      if (startPage > 2) {
        pageNumbers.push("..."); // Ellipsis before startPage if there's a gap
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("..."); // Ellipsis after endPage if there's a gap
      }

      pageNumbers.push(totalPages); // Always show the last page
    }

    // Fix for the duplicate key issue by using a combination of index and pageNum
    return pageNumbers.map((pageNum, index) =>
      pageNum === "..." ? (
        <li className="page-item" key={`ellipsis-${index}`}>
          <span className="page-link">{pageNum}</span>
        </li>
      ) : (
        <li
          className={`page-item ${page === pageNum ? "active" : ""}`}
          onClick={() => selectPageHandler(pageNum)}
          key={`page-${pageNum}`} // Ensure unique key for page numbers
        >
          <span className="page-link">{pageNum}</span>
        </li>
      )
    );
  };


  const handelDoctorChange = (event)=>{
    let docId = event.target.value
    if(docId){
      setDoctorId(docId)
      const doctor =  doctorList.find((e)=> e.doctor_id == docId);
       setSpeciality(doctor.speciality);
       setCampDate(doctor.camp_date);
       setCampTime(doctor.camp_time1);
       setCampVenue(doctor.camp_venue);
    }
    else{
      setDoctorId('')
       setSpeciality('');
       setCampDate('');
       setCampTime('');
       setCampVenue('');
    }
    
  }


  const handleChange = (index,field,value)=>{
      const updated = [...brandInputs];
      brandInputs[index][field] = value;
      setBrandInputs(updated);
  }
  
  const addBrandSet = ()=>{
    if(brandInputs.length<6){
      setBrandInputs([...brandInputs,{ brand: "", sku: "", therapyDay: "" }])
    }
    else{
      toast.error("Maximum 5 selection allowed.")
    }
  }
  const groupedImages = infoData.images?.reduce((acc, img) => {
  if (!acc[img.itemName]) {
    acc[img.itemName] = {
      itemName: img.itemName,
      count: img.image_prescription_count,
      images: [],
    };
  }
  acc[img.itemName].images.push(img.prescriptionImage);
  return acc;
}, {});
  const removeBrandSet = () => {
    if (brandInputs.length > 1) {
      setBrandInputs(prevInputs => prevInputs.slice(0, -1));
    } else {
      toast.error("At least one brand is required.");
    }
  };

  const removeUpdateBrandSet = async () => {
    if (brandInputs.length > 1) {
      const lastItem = brandInputs[brandInputs.length - 1];
  
      if (lastItem.mappingId) {
        try {
          // Call your backend API to delete this record
          let res = await axios.post(`${BASEURL}/report/deleteBrandMapping`,{mappingId:lastItem.mappingId});
          // After successful deletion from backend, update state
          setBrandInputs(prevInputs => prevInputs.slice(0, -1));
          toast.success("Brand deleted successfully.");
        } catch (error) {
          console.error("Error deleting brand mapping:", error);
          toast.error("Failed to delete brand from server.");
        }
      } else {
        // No mappingId, just remove from UI state
        setBrandInputs(prevInputs => prevInputs.slice(0, -1));
      }
    } else {
      toast.error("At least one brand is required.");
    }
  };

  return loading ? <Loader/> : (
    <>
      <main id="main" className="main">
        <section className="section dashboard">
          <div className="row">
            <div className="d-sm-flex align-items-center justify-content-end mb-4">
              <form className="d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group mt-4">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search."
                    aria-label="Search."
                    aria-describedby="basic-addon2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                <small className="msgnote mt-2">*Scroll left for other column of table</small>
                  <div className="m-3 d-flex justify-content-between align-items-end" >
                    <button
                      type="button"
                      className="btn btn-download mt-2"
                      onClick={handelReportDownload}
                    >
                      <i className="bx bx-cloud-download"></i> Download Report
                    </button>
                    <button
                      type="button"
                      className="btn btn-success mt-2"
                      onClick={handelAddReport}
                    >
                      <i className="bi bi-plus"></i> Add New Camp
                    </button>
                  </div>
                  <hr />
                  <div className="tbst">
                    <table className="table table-hover newcss">
                      <thead>
                        <tr>
                          <th scope="col">Doctor Name</th>
                          <th scope="col">Speciality</th>
                          <th scope="col">Doctor Garnet Code</th>
                          <th scope="col">Camp Date</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {""}
                        {campReportList &&
                          campReportList.length > 0 &&
                          campReportList
                            .slice(page * PageCount - PageCount, page * PageCount)
                            .map((e) => (
                              <tr key={e.crid}>
        
                                <td>{e.doctor_name}</td>
                                <td>{e.speciality}</td>
                                <td>{e.garnet_code}</td>
                                <td>{e.camp_date1}</td>
                                {/* <td>{e.camp_venue}</td> */}
                                <td>
                                  {/* <button
                                    className="btn btn-info btn-circle rounded-pill ml-1 mb-1"
                                    title="Info"
                                    onClick={() => handelInfo(e.crid)}
                                  >
                                    <i className="ri-information-2-line"></i>
                                  </button> */}

      <div className="action-wrapper">
       <button
         className="btn btn-sm btn-primary btn-circle border-0"
         onClick={(event) => {
           event.stopPropagation();
           setOpenActionId((prev) => (prev === e.crid ? null : e.crid));
         }}
       >
         <BsThreeDotsVertical />
       </button>
   
       {openActionId === e.crid && (
         <div className="action-dropdown">
           <button onClick={() => handelInfo(e.crid)}>View Info</button>
         </div>
       )}
     </div>
                                  {/* <button
                                    className="btn btn-dark rounded-pill ml-1 mb-1"
                                    title="Edit"
                                    onClick={() => handleEdit(e.crid)}
                                  >
                                    <i className="ri-edit-2-fill"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger rounded-pill ml-1 mb-1"
                                    title="Delete"
                                    onClick={() => handelDelete(e.crid)}
                                  >
                                    <i className="ri-delete-bin-2-fill"></i>
                                  </button> */}
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>

                  {campReportList && campReportList.length > 0 && (
                    <div>
                      <div className="m-2 float-end">
                        {/* <h5 className="card-title">Pagination with icon</h5> */}

                        <nav aria-label="Page navigation example">
                          <ul className="pagination pcur">
                            <li
                              className="page-item"
                              onClick={() => selectPageHandler(page - 1)}
                            >
                              <span className="page-link" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                              </span>
                            </li>
                            {renderPageNumbers()}
                          
                            <li
                              className="page-item"
                              onClick={() => selectPageHandler(page + 1)}
                            >
                              <span className="page-link" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                              </span>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {infoReportModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Camp Report Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Existing form fields */}
                  <form className="row g-3">
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Type"
                        value={infoData && infoData.camp_type_name}
                        readOnly
                      />
                      <label className="form-group form-label did-floating-label">
                        Type of Camp
                      </label>
                    </div>
                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Doctor Name"
                        value={infoData && infoData.doctor_name}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Doctor Name
                      </label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Speciality"
                        value={infoData && infoData.speciality}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Speciality
                      </label>
                    </div>

                    <div className="col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="Camp Date"
                        value={infoData && infoData.camp_date1}
                        readOnly
                      />
                      <label className="form-label did-floating-label">
                        Date of Camp
                      </label>
                    </div>
                  </form>

                  {/* === Images + Brand Mappings Table === */}
                  <div className="mt-4">
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            {/* <th>Brand Name</th> */}
                            <th>Prescription Count</th>
                            <th>Images</th>
                          </tr>
                        </thead>
                       <tbody>
  {groupedImages && Object.values(groupedImages).length > 0 ? (
    Object.values(groupedImages).map((group, idx) => (
      <tr key={idx}>
        <td className="fw-semibold">{group.itemName}</td>
        <td>{group.count}</td>
        <td>
          <div className="d-flex flex-wrap gap-2">
            {group.images.map((image, i) => (
              <img
                key={i}
                src={image}
                alt={group.itemName}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center">
        No prescription images or brand mappings found.
      </td>
    </tr>
  )}
</tbody>
                      </table>
                    </div>
                  </div>
                  {/* === End of section === */}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

         {previewImg && (
  <div className="image-preview-overlay" onClick={handleClosePreview}>
    <span className="close-btn">&times;</span>
    <img src={previewImg} alt="Preview" className="preview-img" />
  </div>
)} 


     

      {addRequestModel && 
      <AddBccModal
      handelCloseModel={handelCloseModel}
      />
      }


      {editRequestModel && (
        <div className="addusermodel">
          <div
            className="modal fade show"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Report</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <form className="row g-3">
                    
                  <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={(event) => {
                          setCampType(event.target.value);
                        }}
                        value={campType}
                      >
                        <option value="">Select...</option>
                        {campList.map((e) => (
                          <option
                          
                          key={e.basic_id}
                          value={e.basic_id}
                          >
                            {e.description}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Type of Camp</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <select
                        className="form-control did-floating-select"
                        onChange={handelDoctorChange}
                        value={doctorId}
                      >
                        <option value="">Select...</option>
                        {doctorList.map((e) => (
                          <option
                          
                          key={e.doctor_id}
                          value={e.doctor_id}
                          >
                            {e.doctor_name}
                          </option>
                        ))}
                      </select>
                        <label className="form-label did-floating-label">Doctor Name</label>
                    </div>

                    <div className="form-group col-md-4 did-floating-label-content">
                      <input
                        type="text"
                        className="form-control did-floating-input"
                        placeholder="speciality"
                        value={speciality}
                        // onChange={(e)=>{
                        //   setSpeciality(e.target.value)
                        // }}
                        readOnly
                      />
                      <label className="form-label did-floating-label">Speciality</label>
                    </div>
                      

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          // onChange={(e) => {
                          //   setCampDate(e.target.value);
                          // }}
                          placeholder="Camp Date"
                          value={campDate}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Date of Camp
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                        
                          type="text"
                          className="form-control did-floating-input"
                          // onChange={(e) => {
                          //   setCampDate(e.target.value);
                          // }}
                          placeholder="Camp Time"
                          value={campTime}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Time of camp
                        </label>
                      </div>
                     
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          // onChange={(e) => {
                          //   setCampVenue(e.target.value);
                          // }}
                          placeholder="Address"
                          value={campVenue}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Address
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setCampPatients(e.target.value);
                          }}
                          placeholder="Patients No."
                          value={campPatients}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          No. of Patients in camp
                        </label>
                      </div>
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setScreenedCount(e.target.value);
                          }}
                          placeholder="Patients Screened No."
                          value={screenedCount}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          No. of Patients Screened
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setRxCount(e.target.value);
                          }}
                          placeholder="Patients Rx No."
                          value={rxCount}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          No. of Rx generated
                        </label>
                      </div>


                      {brandInputs.map((input,index)=>(
                      <React.Fragment key={index}>
                       
                       <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            handleChange(index, "brand", e.target.value)
                          }}
                          placeholder="Brand"
                          value={input.brand}
                        />
                        <label className="form-label did-floating-label">
                          Brand
                        </label>
                      </div>
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            handleChange(index, "sku", e.target.value)
                          }}
                          placeholder="SKU"
                          value={input.sku}
                        />
                        <label className="form-label did-floating-label">
                          SKU
                        </label>
                      </div>
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            handleChange(index, "therapyDay", e.target.value)
                          }}
                          placeholder="Therapy Days"
                          value={input.therapyDay}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Therapy Days
                        </label>

                      </div>
                      
                      {/* <div className="form-group col-md-2 text-end">
        <button
          type="button"
          className="btn btn-danger"
          //onClick={() => handleRemove(index)}
        >
          ❌
        </button>
                      </div> */}
                     
                      </React.Fragment>
                     ))}

                    <div className="col-12 mt-3">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addBrandSet}
                          disabled={brandInputs.length >= 5}
                        >
                          Add Brand
                        </button>
                        {brandInputs.length>1 && <button
                          type="button"
                          className="btn btn-danger m-2"
                          onClick={removeUpdateBrandSet}
                          disabled={brandInputs.length == 1}
                        >
                          Remove Brand
                        </button>}
                        
                      </div>

              
                    <div className="form-group col-md-4 did-floating-label-content">
                      <label
                        htmlFor="fileInput"
                        className={`form-label  ${selectedFiles.length + campImages.length >= ImageLimit ?"custom-file-label1":"custom-file-label"}`}
                        // style={{
                        //   pointerEvents:
                        //     selectedFiles.length + campImages.length >= 3
                        //       ? "none"
                        //       : "auto",
                        // }}
                      >
                        {" "}
                        Upload Camp Images
                      </label>
                      <br />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        id="fileInput"
                        className="file-input"
                        onChange={handleEditFileChange}
                        disabled={selectedFiles.length + campImages.length >= ImageLimit}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap:'wrap',
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {campImages &&
                        campImages.length > 0 &&
                        campImages.map((img) => (
                          <div
                            key={img.crimgid}
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              crossOrigin="anonymous"
                              src={`${BASEURL}/uploads/report/${img.imgpath}`}
                              alt="Report Image"
                              style={{ width: "100px", height: "130px" }}
                            />
                            <button
                              type="button"
                              onClick={() => handelDeleteCampImage(img.crimgid)}
                              style={{
                                position: "absolute",
                                top: "0",
                                right: "0",
                                background: "#07070742",
                                color: "white",
                                border: "none",
                                padding: "0px 4px",
                                cursor: "pointer",
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}

                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={url}
                            alt="Preview"
                            style={{ width: "100px", height: "130px" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: "absolute",
                              top: "0",
                              right: "0",
                              background: "#07070742",
                              color: "white",
                              border: "none",
                              padding: "0px 4px",
                              cursor: "pointer",
                            }}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </form>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success mx-auto"
                      //onClick={handleImageUpload}
                      onClick={handleEditSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Camp Report?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default DynamicCamp;
