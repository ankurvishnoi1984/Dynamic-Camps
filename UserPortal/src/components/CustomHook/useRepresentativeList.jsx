import React, { useEffect, useState } from 'react'
import { BASEURL } from '../constant/constant';
import axios from 'axios';

const useRepresentativeList = (empId,role) => {
    const [representativeList, setRepresentativeList] = useState([]);

    const getRepresentativeList = async () => {
        try {
          const res = await axios.post(`${BASEURL}/report/getRepresentative`,{empId,role});
          setRepresentativeList(res?.data?.data);
        } catch (error) {
          console.log(error);
        }
      };

      useEffect(()=>{
        getRepresentativeList();
      },[])
    return [representativeList]    
}

export default useRepresentativeList