import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASEURL, ImageLimit, PageCount, SelectStyle } from "../constant/constant";
import ConfirmationPopup from "../popup/Popup";
import Select from "react-select";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";

const Prescriber = () => {
  const userId = sessionStorage.getItem("userId");
 
  const [brandList, setBrandList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);


  const [brandId, setBrandId] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [doctorId, setDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [conversionDate, setConversionDate] = useState('');
  const [conversionStatus, setConversionStatus] = useState('');
  const [businessValue, setBusinessValue] = useState('');


  const [prescriberList, setPrescriberList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");


  const [addPrescriberModel, setAddPrescriberModel] = useState(false);
  const [infoPrescriberModel, setInfoPrescriberModel] = useState(false);
  const [editPrescriberModel, setEditPrescriberModel] = useState(false);

  const [infoData, setInfoData] = useState({});
  const [brandVolumeMapping, setBrandVolumeMapping] = useState([]);


  // for delete

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [editId, setEditId] = useState("");
  const [crid, setCrid] = useState("");

     const [doctorInputs, setDoctorInputs] = useState([
       {
         doctorName: '',
         conversionDate: '',
         businessValue: '',
         brands: [{ brand: '', volume: '' }],
       },
     ]);

  // for camp Prescriber data

  const [loading, setLoading] = useState(false);

  const handelAddPrescriber = () => {
    setAddPrescriberModel(true);
  };
 
  const handelCloseModel = async () => {
    setAddPrescriberModel(false);
  };

  const handelCloseEditModel = async () => {
    setEditPrescriberModel(false);
    setDoctorInputs([
       {
         doctorName: '',
         conversionDate: '',
         businessValue: '',
         brands: [{ brand: '', volume: '' }],
       },
     ]);
    
  };

  const handelInfo = async (prescriberId) => {
    const infoData = prescriberList.find((e)=>e.psid === prescriberId);
    setInfoData(infoData);
    await getBrandVolumeMapping(prescriberId)
    setInfoPrescriberModel(true);
  };
  const handelCloseInfoModel = () => {
    setInfoPrescriberModel(false);
    setInfoData({});
  };

  const handelDelete = (prescriberId) => {
    setShowDeleteConfirmation(true);
    setDelId(prescriberId);
  };
  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(`${BASEURL}/prescriber/deletePrescriberWithId`, {
        psId: delId,
      });

      if (res.data.errorCode == "1") {
        toast.success("Prescriber Deleted Successfully");
        await getPrescriberList();
        setDelId("");
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  for showing dashboard list
  const getPrescriberList = async () => {
    setLoading(true)
    try {
      const res = await axios.post(
        `${BASEURL}/prescriber/getAllPrescriber?searchName=${searchQuery}`,
        {userId: userId }
      );

      if (res?.data?.errorCode == "1") {
        setPrescriberList(res?.data?.data);
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
        getPrescriberList();
      },1000)
      
      return ()=>{
        clearTimeout(timer)
      }
    }
    else{
      getPrescriberList();
    }
  }, [searchQuery]);

  // for get camp type


  const getBrandList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getBrand`);
      setBrandList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getBrandVolumeMapping = async (psid) => {
      try {
        const res = await axios.post(`${BASEURL}/prescriber/getBrandVolumeMapping`, {
          psId: psid,
          type:'PRE'
        });

        console.log("inside brand volume mapping", res)
         if (res?.data.errorCode == 1) {
        setBrandVolumeMapping(res?.data?.data);
      }
      } catch (error) {
        console.log(error);
      }
    };

    const getBrandVolumeMapping1 = async (psid) => {
      try {
        const res = await axios.post(`${BASEURL}/prescriber/getBrandVolumeMapping`, {
          psId: psid,
          type:'PRE'
        });
        console.log("res brand map 1", res)
         if (res?.data.errorCode == 1) {
      const transformedData = res.data.data.map((item) => ({
        psdocid: item.psdocid,
        doctorName: item.doctor_name,
        conversionDate: item.conversion_date2,
        businessValue: item.business_value,
        brands: item.brands.map((brand) => ({
          bvid: brand.bvid,
          brand: brand.brand,
          volume: brand.volume,
        })),
      }));

      setDoctorInputs(transformedData); // or setBrandVolumeMapping(transformedData)
    }
      } catch (error) {
        console.log(error);
      }
    };




  useEffect(() => {
    getBrandList();
    //getDoctorList();
  }, []);

  // for search

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

 
  const handleAddSubmit = async () => {
    const validationErrors = [];

    doctorInputs.forEach((doctor, docIndex) => {
      if (!doctor.doctorName.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Name is required`);
      }

      if (!doctor.conversionDate.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Conversion Date is required`);
      }
      if (!doctor.businessValue.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Business Value is required`);
      }


      doctor.brands.forEach((brand, brandIndex) => {
        if (!brand.brand) {
          validationErrors.push(
            `Doctor ${docIndex + 1}, Brand ${brandIndex + 1}: Brand is required`
          );
        }
        if (!brand.volume || Number(brand.volume) <= 0) {
          validationErrors.push(
            `Doctor ${docIndex + 1}, Brand ${brandIndex + 1}: Volume must be greater than 0`
          );
        }
      });
    });
    //console.log("inside validation error",validationErrors);
     if (validationErrors.length > 0) {
    validationErrors.forEach((err) => toast.error(err));
    return;
     }

    try {
      // First API call: Submit the report
      const reportResponse = await axios.post(
        `${BASEURL}/prescriber/addPrescriberWithInfo`,
        {
        doctorInputs,
        userId
        }
      );

      if (reportResponse?.data?.errorCode == 1) {
        toast.success("Prescriber Details Added Successfully");
        await getPrescriberList();
        setDoctorInputs([
       {
         doctorName: '',
         conversionDate: '',
         businessValue: '',
         brands: [{ brand: '', volume: '' }],
       },
     ]);
        
        
     } 
  }
    catch (error) {
      console.error(error);
      toast.error("Error in adding prescriber details");
    } 
    finally {
      setAddPrescriberModel(false);
    }
  }

  
  const handelUpdateBrandVolumeMapping = async(psId)=>{
        
    try {
        const res = await axios.post(`${BASEURL}/prescriber/updateBrandVolumeMapping`,{
          bvId:psId,
          userId,
          type:"PRE",
          data:brandInputs
        })
        console.log("inside update brand mapoing",res)
    } catch (error) {
       console.log("error in adding brand mapping",error);
       toast.error('Error doctor mapping data'); 
    }
    
  }


  const handleEdit = async (prescriberId) => {
    setEditId(prescriberId);

    //const infoData = prescriberList.find((e)=>e.psid === prescriberId);

    await getBrandVolumeMapping1(prescriberId)
    setEditPrescriberModel(true);
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
   const validationErrors = [];

    doctorInputs.forEach((doctor, docIndex) => {
      if (!doctor.doctorName.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Name is required`);
      }

      if (!doctor.conversionDate.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Conversion Date is required`);
      }
      if (!doctor.businessValue) {
        validationErrors.push(`Doctor ${docIndex + 1}: Business Value is required`);
      }


      doctor.brands.forEach((brand, brandIndex) => {
        if (!brand.brand) {
          validationErrors.push(
            `Doctor ${docIndex + 1}, Brand ${brandIndex + 1}: Brand is required`
          );
        }
        if (!brand.volume || Number(brand.volume) <= 0) {
          validationErrors.push(
            `Doctor ${docIndex + 1}, Brand ${brandIndex + 1}: Volume must be greater than 0`
          );
        }
      });
    });
    //console.log("inside validation error",validationErrors);
     if (validationErrors.length > 0) {
    validationErrors.forEach((err) => toast.error(err));
    return;
     }


    try {
      const res = await axios.post(
        `${BASEURL}/prescriber/updatePrescriberWithInfo`,
        {
        doctorInputs,
        userId,
        psId:editId
        }
      );
      if (res?.data?.errorCode == 1) {
        toast.success("Prescriber Updated Successfully");
        await getPrescriberList();
        setDoctorInputs([
       {
         doctorName: '',
         conversionDate: '',
         businessValue: '',
         brands: [{ brand: '', volume: '' }],
       },
     ]);
       
      }
    } catch (error) {
      toast.error("Server error in updating report");
    } finally {
      setEditPrescriberModel(false);
    }
  };




  const brandOptions = brandList?.map((brand) => ({
    value: brand.brand_id,
    label: brand.item_name,
  }));

  // for select camp Prescriber
  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(prescriberList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };


  const renderPageNumbers = () => {
    const totalPages = Math.ceil(prescriberList.length / PageCount);
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


     const handleDoctorChange = (index, field, value) => {
    const updatedDoctors = [...doctorInputs];
    updatedDoctors[index][field] = value;
    setDoctorInputs(updatedDoctors);
  };

  const handleBrandChange = (doctorIndex, brandIndex, field, value) => {
    const updatedDoctors = [...doctorInputs];
    updatedDoctors[doctorIndex].brands[brandIndex][field] = value;
    setDoctorInputs(updatedDoctors);
  };

  const addDoctorSet = () => {
    if (doctorInputs.length < 10) {
      setDoctorInputs([
        ...doctorInputs,
        {
          doctorName: '',
          conversionDate: '',
          businessValue: '',
          brands: [{ brand: '', volume: '' }],
        },
      ]);
    }
  };

  const removeDoctorSet = () => {
    if (doctorInputs.length > 1) {
      const updatedDoctors = [...doctorInputs];
      updatedDoctors.pop();
      setDoctorInputs(updatedDoctors);
    }
  };

  const addBrandSet = (doctorIndex) => {
    const updatedDoctors = [...doctorInputs];
    if (updatedDoctors[doctorIndex].brands.length < 5) {
      updatedDoctors[doctorIndex].brands.push({ brand: '', volume: '' });
      setDoctorInputs(updatedDoctors);
    }
  };

  const removeBrandSet = (doctorIndex) => {
    const updatedDoctors = [...doctorInputs];
    if (updatedDoctors[doctorIndex].brands.length > 1) {
      updatedDoctors[doctorIndex].brands.pop();
      setDoctorInputs(updatedDoctors);
    }
  };

  console.log("doctor input", doctorInputs)

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
              <div className="dropdown ml-3 mt-4" style={{ marginLeft: "1%" }}>
                {/* <select
                  className="form-control selectStyle"
                  onChange={(e) => {
                    setListCampType(e.target.value);
                  }}
                  value={listCampType}
                >
                  <option value="">All Camp</option>
                  {campList.map((e) => (
                    <option
                          
                    key={e.basic_id}
                    value={e.basic_id}
                    >
                      {e.description}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                <small className="msgnote mt-2">*Scroll left for other column of table</small>
                  <div className="m-3">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handelAddPrescriber}
                    >
                      <i className="bx bx-plus"></i> Add New Prescriber
                    </button>
                  </div>
                  <hr />
                  <div className="tbst">
                    <table className="table table-hover newcss">
                      <thead>
                        <tr>
                          <th scope="col">Doctor Name</th>
                          <th scope="col">Created Date</th>
                          {/* <th scope="col">Conversion Status</th> */}
                          {/* <th scope="col">Conversion Date</th>
                          <th scope="col">Current Business Volume</th> */}
                          {/* <th scope="col">Brand</th> */}
                          {/* <th scope="col">Business Support Value</th> */}
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriberList &&
                          prescriberList.length > 0 &&
                          prescriberList
                            .slice(page * PageCount - PageCount, page * PageCount)
                            .map((e) => (
                              <tr key={e.psid}>
        
                                <td>{e.doctorNames}</td>
                                {/* <td>{e.conversion_status}</td> */}
                                <td>{e.created_date1}</td>
                                {/* <td>{e.brandName}</td> */}
                                {/* <td>{e.business_value}</td> */}
                                <td>
                                  <button
                                    className="btn btn-info btn-circle rounded-pill ml-1 mb-1"
                                    title="Info"
                                    onClick={() => handelInfo(e.psid)}
                                  >
                                    <i className="ri-information-2-line"></i>
                                  </button>
                                  <button
                                    className="btn btn-dark rounded-pill ml-1 mb-1"
                                    title="Edit"
                                    onClick={() => handleEdit(e.psid)}
                                  >
                                    <i className="ri-edit-2-fill"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger rounded-pill ml-1 mb-1"
                                    title="Delete"
                                    onClick={() => handelDelete(e.psid)}
                                  >
                                    <i className="ri-delete-bin-2-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>

                  {prescriberList && prescriberList.length > 0 && (
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



      {infoPrescriberModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Prescriber Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body">
                 
                       {brandVolumeMapping.length>0 && brandVolumeMapping.map((doctor) => (
        <div className="doctor-block mb-4" key={doctor.psdocid}>
          <div className="row">
            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Doctor Name"
                value={doctor.doctor_name}
                
              />
              <label className="form-label did-floating-label">Doctor Name</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Conversion Date"
                value={doctor.conversion_date1}
                
              />
              <label className="form-label did-floating-label">Conversion Date</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Business Volume"
                value={doctor.business_value}
                
              />
              <label className="form-label did-floating-label">Current Business Volume</label>
            </div>
          </div>
       
          {/* Brand Section */}
          {doctor.brands.map((brand) => (
            <div key={brand.bvid} className="row">
                          <div className="form-group col-md-4 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              placeholder="Brand"
                              value={brand.brand_name}
                            />
                            <label className="form-label did-floating-label">
                              Brand
                            </label>
                          </div>
                          <div className="form-group col-md-4 did-floating-label-content">
                            <input
                              type="text"
                              className="form-control did-floating-input"
                              placeholder="SKU"
                              value={brand.volume}
                            />
                            <label className="form-label did-floating-label">
                              Volume
                            </label>
                          </div>
                        </div>
          ))}

          
        </div>
                    ))}
                    
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     

      {addPrescriberModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Prescriber Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseModel}
                  ></button>
                </div>
                <div className="modal-body">

                  <div>
                        {doctorInputs.map((doctor, doctorIndex) => (
                          <div className="doctor-block mb-4" key={doctorIndex}>
                            <div className="row">
                              <div className="form-group col-md-4 did-floating-label-content">
                                <input
                                  type="text"
                                  className="form-control did-floating-input"
                                  placeholder="Doctor Name"
                                  value={doctor.doctorName}
                                  onChange={(e) =>
                                    handleDoctorChange(doctorIndex, 'doctorName', e.target.value)
                                  }
                                />
                                <label className="form-label did-floating-label">Doctor Name</label>
                              </div>
                  
                              <div className="form-group col-md-4 did-floating-label-content">
                                <input
                                   onClick={()=> document.getElementById(`fromDate${doctorIndex}`).showPicker()}
                                    id={`fromDate${doctorIndex}`}
                                    type="date"
                                    className="form-control did-floating-input"
                                    onChange={(e) => {
                                      handleDoctorChange(doctorIndex, 'conversionDate', e.target.value)
                                    }}
                                    
                                    placeholder="Conversion Date"
                                    value={doctor.conversionDate}
                                />
                                <label className="form-label did-floating-label">Conversion Date</label>
                              </div>
                  
                              <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                                      handleDoctorChange(doctorIndex, 'businessValue', e.target.value)
                                    }}
                          placeholder="Business Value"
                          value={doctor.businessValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Current Business Volume
                        </label>
                              </div>
                            </div>
                  
                            {/* Brand Section */}
                            {doctor.brands.map((brand, brandIndex) => (
            <div className="row" key={brandIndex}>
              <div className="form-group col-md-4 did-floating-label-content">
                <Select
                  options={brandOptions}
                  value={brandOptions.find(
                    (option) => option.value === brand.brand
                  )}
                  onChange={(selectedOption) =>
                    handleBrandChange(
                      doctorIndex,
                      brandIndex,
                      'brand',
                      selectedOption ? selectedOption.value : ''
                    )
                  }
                  placeholder="Select Brand"
                  isClearable
                />
              </div>

              <div className="form-group col-md-4 did-floating-label-content">
                <input
                  type="number"
                  className="form-control did-floating-input"
                  placeholder="Volume"
                  value={brand.volume}
                  min={0}
                  onChange={(e) =>
                    handleBrandChange(
                      doctorIndex,
                      brandIndex,
                      'volume',
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                  }}
                />
                <label className="form-label did-floating-label">Volume</label>
              </div>
            </div>
          ))}
                  
                            <div className="col-12 mb-2">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => addBrandSet(doctorIndex)}
                                disabled={doctor.brands.length >= 5}
                              >
                                Add Brand
                              </button>
                              {doctor.brands.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger m-2"
                                  onClick={() => removeBrandSet(doctorIndex)}
                                >
                                  Remove Brand
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                  
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={addDoctorSet}
                            disabled={doctorInputs.length >= 10}
                          >
                            Add Doctor
                          </button>
                          {doctorInputs.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger m-2"
                              onClick={removeDoctorSet}
                            >
                              Remove Doctor
                            </button>
                          )}
                        </div>
                  </div>

                
                    <div className="text-center">
                      
                      <button
                        type="button"
                        className="btn btn-success mx-auto ml-1 mt-5"
                        //onClick={handleImageUpload}
                        onClick={handleAddSubmit}
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


      {editPrescriberModel && (
        <div className="addusermodel">
          <div
            className="modal fade show"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Prescriber Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                   <div>
                        {doctorInputs.map((doctor, doctorIndex) => (
                          <div className="doctor-block mb-4" key={doctorIndex}>
                            <div className="row">
                              <div className="form-group col-md-4 did-floating-label-content">
                                <input
                                  type="text"
                                  className="form-control did-floating-input"
                                  placeholder="Doctor Name"
                                  value={doctor.doctorName}
                                  onChange={(e) =>
                                    handleDoctorChange(doctorIndex, 'doctorName', e.target.value)
                                  }
                                />
                                <label className="form-label did-floating-label">Doctor Name</label>
                              </div>
                  
                              <div className="form-group col-md-4 did-floating-label-content">
                                <input
                                   onClick={()=> document.getElementById(`fromDate${doctorIndex}`).showPicker()}
                                    id={`fromDate${doctorIndex}`}
                                    type="date"
                                    className="form-control did-floating-input"
                                    onChange={(e) => {
                                      handleDoctorChange(doctorIndex, 'conversionDate', e.target.value)
                                    }}
                                    
                                    placeholder="Conversion Date"
                                    value={doctor.conversionDate}
                                />
                                <label className="form-label did-floating-label">Conversion Date</label>
                              </div>
                  
                              <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                                      handleDoctorChange(doctorIndex, 'businessValue', e.target.value)
                                    }}
                          placeholder="Business Value"
                          value={doctor.businessValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Current Business Volume
                        </label>
                              </div>
                            </div>
                  
                            {/* Brand Section */}
                            {doctor.brands.map((brand, brandIndex) => (
            <div className="row" key={brandIndex}>
              <div className="form-group col-md-4 did-floating-label-content">
                <Select
                  options={brandOptions}
                  value={brandOptions.find(
                    (option) => option.value === brand.brand
                  )}
                  onChange={(selectedOption) =>
                    handleBrandChange(
                      doctorIndex,
                      brandIndex,
                      'brand',
                      selectedOption ? selectedOption.value : ''
                    )
                  }
                  placeholder="Select Brand"
                  isClearable
                />
              </div>

              <div className="form-group col-md-4 did-floating-label-content">
                <input
                  type="number"
                  className="form-control did-floating-input"
                  placeholder="Volume"
                  value={brand.volume}
                  min={0}
                  onChange={(e) =>
                    handleBrandChange(
                      doctorIndex,
                      brandIndex,
                      'volume',
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                  }}
                />
                <label className="form-label did-floating-label">Volume</label>
              </div>
            </div>
          ))}
                  
                            <div className="col-12 mb-2">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => addBrandSet(doctorIndex)}
                                disabled={doctor.brands.length >= 5}
                              >
                                Add Brand
                              </button>
                              {doctor.brands.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger m-2"
                                  onClick={() => removeBrandSet(doctorIndex)}
                                >
                                  Remove Brand
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                  
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={addDoctorSet}
                            disabled={doctorInputs.length >= 10}
                          >
                            Add Doctor
                          </button>
                          {doctorInputs.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger m-2"
                              onClick={removeDoctorSet}
                            >
                              Remove Doctor
                            </button>
                          )}
                        </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success mx-auto mt-1"
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
          message="Are you sure you want to Delete Prescriber?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default Prescriber;
