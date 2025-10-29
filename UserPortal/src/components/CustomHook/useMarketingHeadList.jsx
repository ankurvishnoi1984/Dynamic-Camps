import React, { useEffect, useState } from 'react'
import { BASEURL } from '../constant/constant';
import axios from 'axios';

const useMarketingHeadList = () => {

    const [marketingHeadList, setMarketingHeadList] = useState([]);
    const getMarketingHead = async () => {
        try {
          const res = await axios.get(`${BASEURL}/report/getMarketingHead`);
          setMarketingHeadList(res?.data?.data);
        } catch (error) {
          console.log(error);
        }
      };
   useEffect(()=>{
    getMarketingHead();
   },[])
   return [marketingHeadList];
}

export default useMarketingHeadList