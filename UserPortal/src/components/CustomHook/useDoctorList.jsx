import React, { useEffect, useState } from 'react'
import { BASEURL } from '../constant/constant';
import axios from 'axios';

const useDoctorList = (empId,role) => {
    const [doctorList, setDoctorList] = useState([]);
    const getDoctor = async () => {
        try {
          const res = await axios.post(`${BASEURL}/report/getDoctor`,{empId,role});
          setDoctorList(res?.data?.data);
        } catch (error) {
          console.log(error);
        }
      };

      useEffect(()=>{
        getDoctor();
      },[])

      return [doctorList];
}

export default useDoctorList