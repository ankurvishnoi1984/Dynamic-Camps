import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { publicRoutes, privateRoutes } from "./Routes";
import AdminProtectedRoute from "../protectedroutes/protect";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}

        {/* Private Protected Routes */}
        {privateRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<AdminProtectedRoute>{element}</AdminProtectedRoute>}
          />
        ))}
      </Routes>

      {/* Toast Notification */}
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default AppRoutes;
