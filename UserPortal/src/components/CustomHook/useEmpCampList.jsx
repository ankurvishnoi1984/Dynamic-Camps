import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { BASEURL, BASEURL2 } from '../constant/constant';

const useEmpCampList = () => {
    const [campList, setCampList] = useState([]);
    const getCampList = async () => {
        try {
          const res = await axios.get(`${BASEURL2}/basic/getEmpanormCampType`);
          setCampList(res?.data?.data);
        } catch (error) {
          console.log(error);
        }
      };
     
      useEffect(() => {
        getCampList();
      }, []);

      return [campList]
}

export default useEmpCampList