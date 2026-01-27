import { useSelector } from "react-redux";
import { publicRoutes, getPrivateRoutes } from "./Routes";
import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "../protectedroutes/protect";
import { Toaster } from "react-hot-toast";

const AppRoutes = () => {
  
  const { view_poster, view_camp, loading } = useSelector(
    (state) => state.permissions
  );

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
