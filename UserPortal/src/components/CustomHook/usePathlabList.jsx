import React, { useEffect, useState } from 'react'
import { BASEURL } from '../constant/constant';
import axios from 'axios';

const usePathlabList = () => {

    const [pathlabList, setPathlabList] = useState([]);
    const getPathlabList = async () => {
        try {
          const res = await axios.get(`${BASEURL}/report/getPathLab`);
          setPathlabList(res?.data?.data);
        } catch (error) {
          console.log(error);
        }
      };

      useEffect(()=>{
        getPathlabList();
      },[])

      return [pathlabList];
}

export default usePathlabList