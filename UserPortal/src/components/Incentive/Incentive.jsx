import React, { useState, useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import { BASEURL, ImageLimit, PageCount, SelectStyle } from "../constant/constant";
import ConfirmationPopup from "../popup/Popup";
import Select from "react-select";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";

const Incentive = () => {
  const userId = sessionStorage.getItem("userId");

  const [brandList, setBrandList] = useState([]);
  //const [doctorList, setDoctorList] = useState([]);
  const [qtrList, setQtrList] = useState([]);
  const [qtrId1, setQtrId1] = useState("");
  const [qtrId2, setQtrId2] = useState("");
  const [qtrId3, setQtrId3] = useState("");

  const [incentiveValue, setIncentiveValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [volumeValue, setVolumeValue] = useState("");
  // const [doctorName, setDoctorName] = useState("");
  // const [support, setSupport] = useState("");
  // const [amsValue, setAmsValue] = useState("");

  const [brandId, setBrandId] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  // const [doctorId, setDoctorId] = useState("");
  // const [incentiveDate, setIncentiveDate] = useState("");
  // const [amount, setAmount] = useState("");
  // const [percentageAchive, setPercentageAchive] = useState("");

  const [incentiveList, setIncentiveList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [addIncentiveModel, setAddIncentiveModel] = useState(false);
  const [infoIncentiveModel, setInfoIncentiveModel] = useState(false);
  const [editIncentiveModel, setEditIncentiveModel] = useState(false);

  const [infoData, setInfoData] = useState({});
  const [brandVolumeMapping, setBrandVolumeMapping] = useState([]);

    const [doctorInputs, setDoctorInputs] = useState([
    {
      doctorName: '',
      support: '',
      amsValue: '',
      brands: [{ brand: '', volume: '' }],
    },
  ]);

  // for delete

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [delId, setDelId] = useState("");
  const [editId, setEditId] = useState("");

  

  // for camp Incentive data

  const [loading, setLoading] = useState(false);

  const handelAddIncentive = () => {
    setAddIncentiveModel(true);
  };

  const handelCloseModel = async () => {
    setAddIncentiveModel(false);
  };

  const handelCloseEditModel = async () => {
    setEditIncentiveModel(false);
    //setDoctorName("");
   // setIncentiveDate("");
    //setSupport("");
    //setAmsValue("");
    setIncentiveValue("");
    setTargetValue("");
    setVolumeValue("");
    setQtrId1("");
    setQtrId2("");
    setQtrId3("");
     setDoctorInputs([
            {
              doctorName: '',
              support: '',
              amsValue: '',
              brands: [{ brand: '', volume: '' }],
            },
          ])
    
  };

  const handelInfo = async (IncentiveId) => {
    const infoData = incentiveList.find((e) => e.icid === IncentiveId);
    setInfoData(infoData);
    await getBrandVolumeMapping(IncentiveId);
    setInfoIncentiveModel(true);
  };
  const handelCloseInfoModel = () => {
    setInfoIncentiveModel(false);
    setInfoData({});
  };

  const handelDelete = (IncentiveId) => {
    setShowDeleteConfirmation(true);
    setDelId(IncentiveId);
  };
  const handelCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDelId("");
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmation(false);
    try {
      const res = await axios.post(
        `${BASEURL}/incentive/deleteIncentiveWithId`,
        {
          icId: delId,
        }
      );

      if (res.data.errorCode == "1") {
        toast.success("Incentive Deleted Successfully");
        await getIncentiveList();
        setDelId("");
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  for showing dashboard list
  const getIncentiveList = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASEURL}/incentive/getAllIncentive?searchName=${searchQuery}`,
        { userId: userId }
      );

      if (res?.data?.errorCode == "1") {
        setIncentiveList(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getBrandVolumeMapping = async (psid) => {
    try {
      const res = await axios.post(
        `${BASEURL}/incentive/getIncentiveBrandVolumeMapping`,
        {
          icId: psid,
          type: "INC",
        }
      );

      console.log("inside brand volume mapping", res);
      if (res?.data.errorCode == 1) {
        setBrandVolumeMapping(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

 const getBrandVolumeMapping1 = async (psid) => {
  try {
    const res = await axios.post(
      `${BASEURL}/incentive/getIncentiveBrandVolumeMapping`,
      {
        icId: psid,
        type: "INC",
      }
    );

    if (res?.data.errorCode == 1) {
      const transformedData = res.data.data.map((item) => ({
        icdocid: item.icdocid,
        doctorName: item.doctor_name,
        support: item.cur_support,
        amsValue: item.ams_plan,
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
    if (searchQuery) {
      let timer = setTimeout(() => {
        getIncentiveList();
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      getIncentiveList();
    }
  }, [searchQuery]);

  const getBrandList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getBrand`);
      setBrandList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  

  const getQtrList = async () => {
    try {
      const res = await axios.get(`${BASEURL}/basic/getQtr`);
      setQtrList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBrandList();
    //getDoctorList();
    getQtrList();
  }, []);

  // for search

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  console.log("doctor inputs",  doctorInputs);

  const handleAddSubmit = async () => {
    if (
      //!doctorName ||
      //!incentiveDate ||
      !qtrId1 ||
      !qtrId2 ||
      !qtrId3 ||
      !incentiveValue ||
      !targetValue ||
      !volumeValue 
      //!support ||
      //!amsValue
    ) {
      toast.error("Missing Required Field");
      return;
    }

      const validationErrors = [];

    doctorInputs.forEach((doctor, docIndex) => {
      if (!doctor.doctorName.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Name is required`);
      }
      if (!doctor.support.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Support value is required`);
      }

      if (!doctor.amsValue.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Ams value is required`);
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
  //console.log(doctorInputs);
    try {
      // First API call: Submit the report
      const res = await axios.post(
        `${BASEURL}/incentive/addIncentiveWithInfo`,
        {
          doctorInputs,
          incentiveQtr: qtrId1,
          incentiveValue,
          targetQtr: qtrId2,
          targetValue,
          volumeQtr: qtrId3,
          volumeValue,
          userId,
        }
      );

      if(res.data.errorCode == 1){
         toast.success("Incentive Details Added Successfully"); 
          await getIncentiveList();
           setIncentiveValue("");
        setTargetValue("");
        setVolumeValue("");
        setQtrId1("");
        setQtrId2("");
        setQtrId3("");
            setDoctorInputs([
            {
              doctorName: '',
              support: '',
              amsValue: '',
              brands: [{ brand: '', volume: '' }],
            },
          ])
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Error in adding Incentive details");
    } finally {
      setAddIncentiveModel(false);
    }
  };

 

  const handleEdit = async (IncentiveId) => {
    setEditId(IncentiveId);

    const infoData = incentiveList.find((e) => e.icid === IncentiveId);

    if (infoData) {
      //setDoctorName(infoData.doctor_name);
      //setIncentiveDate(infoData.incentive_date2);
      //setSupport(infoData.cur_support);
      //setAmsValue(infoData.ams_plan);
      setQtrId1(infoData.incentive_qtr);
      setQtrId2(infoData.target_qtr);
      setQtrId3(infoData.volume_qtr);
      setIncentiveValue(infoData.incentive_value);
      setTargetValue(infoData.target_value);
      setVolumeValue(infoData.volume_value);

  //      let doctorInputs = [];  
  //  if (infoData.doctor_list && infoData.doctor_list.trim() !== "") {
  //  doctorInputs = infoData.doctor_list
  //   .split(',')
  //   .map(name => name.trim())
  //   .filter(name => !!name)
  //   .map(name => ({ doctorName: name }));
  //   }
  //   setDoctorInputs(doctorInputs);
  }
    await getBrandVolumeMapping1(IncentiveId);
    setEditIncentiveModel(true);
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
      //!doctorName ||
      //!incentiveDate ||
      !qtrId1 ||
      !qtrId2 ||
      !qtrId3 ||
      !incentiveValue ||
      !targetValue ||
      !volumeValue 
      //!support ||
      //!amsValue
    ) {
      toast.error("Missing Required Field");
      return;
    }

     const validationErrors = [];

    doctorInputs.forEach((doctor, docIndex) => {
      if (!doctor.doctorName.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Name is required`);
      }
      if (!doctor.support.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Support value is required`);
      }

      if (!doctor.amsValue.trim()) {
        validationErrors.push(`Doctor ${docIndex + 1}: Ams value is required`);
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
        `${BASEURL}/incentive/updateIncentiveWithInfo`,
        {
          //doctorName,
         // supportValue: support,
          //amsPlan: amsValue,
          doctorInputs,
          //incentiveDate,
          incentiveQtr: qtrId1,
          incentiveValue,
          targetQtr: qtrId2,
          targetValue,
          volumeQtr: qtrId3,
          volumeValue,
          userId,
          icId: editId,
        }
      );
      if (res?.data?.errorCode == "1") {
        toast.success("Incentive Updated Successfully");
        await getIncentiveList();
           setIncentiveValue("");
        setTargetValue("");
        setVolumeValue("");
        setQtrId1("");
        setQtrId2("");
        setQtrId3("");
            setDoctorInputs([
            {
              doctorName: '',
              support: '',
              amsValue: '',
              brands: [{ brand: '', volume: '' }],
            },
          ])
      
      }
    } catch (error) {
      toast.error("Server error in updating report");
    } finally {
      setEditIncentiveModel(false);
    }
  };

  // const handleBrandChange = (selectedOptions) => {
  //   setSelectedBrands(selectedOptions);
  // };

  const brandOptions = brandList?.map((brand) => ({
    value: brand.brand_id,
    label: brand.item_name,
  }));

  // for select camp Incentive
  const [page, setPage] = useState(1);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(incentiveList.length / PageCount) &&
      page !== selectedPage
    )
      setPage(selectedPage);
  };

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(incentiveList.length / PageCount);
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
          support: '',
          amsValue: '',
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

  console.log("doctor data",doctorInputs);

  return loading ? (
    <Loader />
  ) : (
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
               
              </div>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <small className="msgnote mt-2">
                    *Scroll left for other column of table
                  </small>
                  <div className="m-3">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handelAddIncentive}
                    >
                      <i className="bx bx-plus"></i> Add New Incentive
                    </button>
                  </div>
                  <hr />
                  <div className="tbst">
                    <table className="table table-hover newcss">
                      <thead>
                        <tr>
                          {/* <th scope="col">Incentive Earn</th> */}
                          {/* <th scope="col">Target</th> */}
                          {/* <th scope="col">Volume</th> */}
                          <th scope="col">Doctor Name</th>
                          <th scope="col">Qtr</th>
                          {/* <th scope="col">Date</th> */}
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incentiveList &&
                          incentiveList.length > 0 &&
                          incentiveList
                            .slice(
                              page * PageCount - PageCount,
                              page * PageCount
                            )
                            .map((e) => (
                              <tr key={e.icid}>
                                <td>{e.doctorNames}</td>
                                  {/* <td>{e.incentive_value}</td>
                                  <td>{e.target_value}</td>
                                  <td>{e.volume_value}</td> */}
                                <td>{e.qtrName1}</td>
                                {/* <td>{e.incentive_date1}</td> */}
                                <td>
                                  <button
                                    className="btn btn-info btn-circle rounded-pill ml-1 mb-1"
                                    title="Info"
                                    onClick={() => handelInfo(e.icid)}
                                  >
                                    <i className="ri-information-2-line"></i>
                                  </button>
                                  <button
                                    className="btn btn-dark rounded-pill ml-1 mb-1"
                                    title="Edit"
                                    onClick={() => handleEdit(e.icid)}
                                  >
                                    <i className="ri-edit-2-fill"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger rounded-pill ml-1 mb-1"
                                    title="Delete"
                                    onClick={() => handelDelete(e.icid)}
                                  >
                                    <i className="ri-delete-bin-2-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>

                  {incentiveList && incentiveList.length > 0 && (
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

      {infoIncentiveModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Incentive Info</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseInfoModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mt-3">
                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          placeholder=""
                          value={infoData && infoData.qtrName1}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Incentive i wish to earn in
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          value={infoData && infoData.incentive_value}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Value
                        </label>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          placeholder=""
                          value={infoData && infoData.qtrName2}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          My Target
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          value={infoData && infoData.target_value}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Value
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          placeholder=""
                          value={infoData && infoData.qtrName3}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Volume i have to achieve
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="text"
                          className="form-control did-floating-input"
                          value={infoData && infoData.volume_value}
                          readOnly
                        />
                        <label className="form-label did-floating-label">
                          Value
                        </label>
                      </div>
                    </div>

                    {brandVolumeMapping.length>0 && brandVolumeMapping.map((doctor, doctorIndex) => (
        <div className="doctor-block mb-4" key={doctor.icdocid}>
          <div className="row">
            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Doctor Name"
                value={doctor.doctor_name}
                
              />
              <label className="form-label did-floating-label">Doctor who can support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Support"
                value={doctor.cur_support}
                
              />
              <label className="form-label did-floating-label">Current Support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="AMS Value"
                value={doctor.ams_plan}
                
              />
              <label className="form-label did-floating-label">Inc Ams Planned</label>
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
        </div>
      )}

      {addIncentiveModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Incentive Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mt-3">
                    

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId1(event.target.value);
                          }}
                          value={qtrId1}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          Incentive i wish to earn
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setIncentiveValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={incentiveValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId2(event.target.value);
                          }}
                          value={qtrId2}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          My Target
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setTargetValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={targetValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId3(event.target.value);
                          }}
                          value={qtrId3}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          Volume i have to achieve
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setVolumeValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={volumeValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>
                  



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
              <label className="form-label did-floating-label">Doctor who can support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Support"
                value={doctor.support}
                onChange={(e) =>
                  handleDoctorChange(doctorIndex, 'support', e.target.value)
                }
              />
              <label className="form-label did-floating-label">Current Support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="AMS Value"
                value={doctor.amsValue}
                onChange={(e) =>
                  handleDoctorChange(doctorIndex, 'amsValue', e.target.value)
                }
              />
              <label className="form-label did-floating-label">Inc Ams Planned</label>
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

                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success mx-auto ml-1 mt-1"
                     
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

      {editIncentiveModel && (
        <div className="addusermodel">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Incentive Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handelCloseEditModel}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mt-3">
                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId1(event.target.value);
                          }}
                          value={qtrId1}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          Incentive i wish to earn
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setIncentiveValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={incentiveValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId2(event.target.value);
                          }}
                          value={qtrId2}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          My Target
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setTargetValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={targetValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-4 did-floating-label-content">
                        <select
                          className="form-control did-floating-select"
                          onChange={(event) => {
                            setQtrId3(event.target.value);
                          }}
                          value={qtrId3}
                        >
                          <option value="">Select QTR</option>
                          {qtrList.map((e) => (
                            <option key={e.qtr_id} value={e.qtr_id}>
                              {e.qtr_name}
                            </option>
                          ))}
                        </select>
                        <label className="form-label did-floating-label">
                          Volume i have to achieve
                        </label>
                      </div>

                      <div className="form-group col-md-4 did-floating-label-content">
                        <input
                          type="number"
                          className="form-control did-floating-input"
                          onChange={(e) => {
                            setVolumeValue(e.target.value);
                          }}
                          placeholder="Value"
                          value={volumeValue}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault(); 
                            }
                          }}
                          min={0}
                        />
                        <label className="form-label did-floating-label">
                          Type Value
                        </label>
                      </div>
                    </div>


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
              <label className="form-label did-floating-label">Doctor who can support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Support"
                value={doctor.support}
                onChange={(e) =>
                  handleDoctorChange(doctorIndex, 'support', e.target.value)
                }
              />
              <label className="form-label did-floating-label">Current Support</label>
            </div>

            <div className="form-group col-md-4 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="AMS Value"
                value={doctor.amsValue}
                onChange={(e) =>
                  handleDoctorChange(doctorIndex, 'amsValue', e.target.value)
                }
              />
              <label className="form-label did-floating-label">Inc Ams Planned</label>
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

                    

                    

                    
                    

                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success mx-auto ml-1 mt-1"
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
          message="Are you sure you want to Delete Incentive?"
          onConfirm={handleConfirmDelete}
          onCancel={handelCancelDelete}
        />
      )}
    </>
  );
};

export default Incentive;
