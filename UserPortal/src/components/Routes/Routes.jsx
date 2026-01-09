import Login from "../login/login";
import DashboardPage from "../Pages/DashboardPage";
import RequestPage from "../Pages/RequestPage";
import DoctorPage from "../Pages/DoctorPage";
import PosterPage from "../Pages/PosterPage";
import PrescriberPage from "../Pages/PrescriberPage";
import IncentivePage from "../Pages/IncentivePage";
import BccDistPage from "../Pages/BccDistPage";
import JaiHoPage from "../Pages/JaiHoPage";
import PrescriptionPage from "../Pages/PrescriptionPage";
import EmpanormPage from "../Pages/EmpanormPage";
import DynamicCampPage from "../Pages/DynamicCampPage";
import MonthlyCampPage from "../Pages/MonthlyCampPage";
import NotFoundPage from "../Pages/NotFoundPage";
import PreviewPage from "../Pages/PreviewPage";

export const publicRoutes = [{ path: "/", element: <Login /> }];

export const privateRoutes = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/notFound", element: <NotFoundPage /> },
  { path: "/empanormCampaign", element: <EmpanormPage /> },
  { path: "/bccDistribution", element: <BccDistPage /> },
  { path: "/jaiHo", element: <JaiHoPage/> },
  { path: "/campRequest", element: <RequestPage /> },
  { path: "/addDoctor", element: <DoctorPage /> },
  { path: "/addDoctor/poster/:id", element: <PosterPage /> },
  { path: "/prescriber", element: <PrescriberPage /> },
  { path: "/prescriptionUpload", element: <PrescriptionPage /> },
    { path: "/monthlycamp", element: <DynamicCampPage /> },
  { path: "/incentive", element: <IncentivePage /> },
   { path: "/camp/:campId", element: <MonthlyCampPage /> },
     { path: "/poster", element: <PosterPage /> },
     { path: "/poster/viewPoster/:id", element: <PreviewPage /> }
];
