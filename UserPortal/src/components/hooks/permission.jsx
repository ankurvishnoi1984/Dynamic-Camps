import { useEffect, useState } from "react";
import axios from "axios";
import { BASEURL,DeptId } from "../constant/constant";

export const useDepartmentPermissions = (deptId) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!DeptId) return;

    axios
      .post(`${BASEURL}/department/getDepartmentPermissions`, { dept_id: DeptId })
      .then((res) => {
        setPermissions(res.data.responseData);
      })
      .catch(() => {
        setPermissions({ viewPoster: "N", viewCamp: "N" });
      })
      .finally(() => setLoading(false));
  }, [DeptId]);

  return { permissions, loading };
};
