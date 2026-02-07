import { useDispatch, useSelector } from "react-redux";
import { publicRoutes, getPrivateRoutes } from "./Routes";
import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "../protectedroutes/protect";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASEURL2, DeptId } from "../constant/constant";

const AppRoutes = () => {


  const [view_poster, setViewPoster] = useState("N")
  const [view_camp, setViewCamp] = useState("N")


  const getDeptPermissions = async () => {
    // setLoading(true);
    try {
      let res;
      res = await axios.post(
        `${BASEURL2}/department/getDepartmentPermissions`,
        { dept_id: DeptId }
      );
      if (Number(res?.data?.errorCode) === 1) {
        console.log(res.data.responseData);
        setViewPoster(res.data.responseData.view_poster)
        setViewCamp(res.data.responseData.view_camp)
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setLoading(false);
    }
  }

  useEffect(() => {

    getDeptPermissions();
  })

  // if (loading) return null; // or <Loader />

  const privateRoutes = getPrivateRoutes({ view_poster, view_camp });

  return (
    <>
      <Routes>
        {publicRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={r.element} />
        ))}

        {privateRoutes.map((r, i) => (
          <Route
            key={i}
            path={r.path}
            element={<AdminProtectedRoute>{r.element}</AdminProtectedRoute>}
          />
        ))}
      </Routes>

      <Toaster position="top-center" />
    </>
  );
};

export default AppRoutes;
